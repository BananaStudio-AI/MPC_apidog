#!/usr/bin/env node

/**
 * OpenAPI 3.0.3 Validation Script
 * 
 * Validates that api-hub.oas.json conforms to OpenAPI 3.0.3 standards
 * and meets Apidog compatibility requirements.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPEC_PATH = path.join(__dirname, '../openapi/api-hub.oas.json');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function header(message) {
  log(`\n${message}`, colors.cyan);
  log('='.repeat(message.length), colors.cyan);
}

async function validateSpec() {
  header('OpenAPI 3.0.3 Specification Validator');

  // Load spec
  let spec;
  try {
    const content = fs.readFileSync(SPEC_PATH, 'utf8');
    spec = JSON.parse(content);
    success('Loaded specification from ' + SPEC_PATH);
  } catch (err) {
    error('Failed to load specification: ' + err.message);
    process.exit(1);
  }

  let errorCount = 0;
  let warningCount = 0;

  // 1. Check OpenAPI version
  header('1. OpenAPI Version');
  if (spec.openapi === '3.0.3') {
    success('OpenAPI version is 3.0.3');
  } else {
    error(`OpenAPI version is ${spec.openapi}, expected 3.0.3`);
    errorCount++;
  }

  // 2. Check for 3.1-specific features
  header('2. 3.1-Specific Features Check');
  const specStr = JSON.stringify(spec);

  // Check for JSON Schema dialect
  if (specStr.includes('"$schema"')) {
    error('Found JSON Schema dialect declarations ($schema)');
    errorCount++;
  } else {
    success('No JSON Schema dialect declarations');
  }

  // Check for type arrays
  if (specStr.match(/"type"\s*:\s*\[/)) {
    error('Found type array declarations (3.1 feature)');
    errorCount++;
  } else {
    success('No type arrays found');
  }

  // Check for HTTP bearer scheme
  if (specStr.includes('"scheme":"bearer"')) {
    error('Found HTTP bearer scheme (use apiKey for 3.0.3)');
    errorCount++;
  } else {
    success('No HTTP bearer schemes');
  }

  // 3. Security schemes validation
  header('3. Security Schemes');
  const securitySchemes = spec.components?.securitySchemes || {};
  
  const expectedSchemes = ['CometAuth', 'FalAuth'];
  const actualSchemes = Object.keys(securitySchemes);
  
  expectedSchemes.forEach(name => {
    if (securitySchemes[name]) {
      const scheme = securitySchemes[name];
      if (scheme.type === 'apiKey' && scheme.in === 'header' && scheme.name === 'Authorization') {
        success(`${name}: Valid apiKey scheme`);
      } else {
        error(`${name}: Invalid scheme configuration`);
        errorCount++;
      }
    } else {
      error(`${name}: Missing from security schemes`);
      errorCount++;
    }
  });

  // 4. Provider separation validation
  header('4. Provider Separation');
  const paths = spec.paths || {};
  
  const cometEndpoints = [];
  const falEndpoints = [];
  const otherEndpoints = [];

  Object.entries(paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      if (typeof operation === 'object' && operation.tags) {
        const endpoint = `${method.toUpperCase()} ${path}`;
        const tag = operation.tags[0];
        
        if (tag === 'COMET_API') {
          cometEndpoints.push(endpoint);
        } else if (tag === 'FAL_API') {
          falEndpoints.push(endpoint);
        } else {
          otherEndpoints.push(endpoint);
        }
      }
    });
  });

  log(`\nCOMET_API endpoints (${cometEndpoints.length}):`);
  cometEndpoints.forEach(ep => log(`  - ${ep}`));
  
  log(`\nFAL_API endpoints (${falEndpoints.length}):`);
  falEndpoints.forEach(ep => log(`  - ${ep}`));

  if (otherEndpoints.length > 0) {
    warning(`Other endpoints (${otherEndpoints.length}):`);
    otherEndpoints.forEach(ep => log(`  - ${ep}`));
  }

  // Check for cross-contamination
  const cometPathsInFal = falEndpoints.filter(ep => ep.includes('/comet/'));
  const falPathsInComet = cometEndpoints.filter(ep => ep.includes('/fal/'));

  if (cometPathsInFal.length === 0 && falPathsInComet.length === 0) {
    success('No cross-provider contamination detected');
  } else {
    error('Cross-provider contamination detected!');
    errorCount++;
  }

  // 5. Schema validation
  header('5. Schema Validation');
  const schemas = spec.components?.schemas || {};
  const schemaNames = Object.keys(schemas);

  const expectedCometSchemas = ['CometModel', 'CometModelsResponse'];
  const expectedFalSchemas = [
    'FalModel', 'FalModelsResponse', 'FalPricingResponse',
    'FalEstimateRequest', 'FalEstimateResponse',
    'FalUsageRecord', 'FalUsageResponse',
    'FalAnalyticsRecord', 'FalAnalyticsResponse'
  ];
  const expectedSharedSchemas = ['UnifiedModelRecord', 'ErrorResponse'];

  const allExpectedSchemas = [
    ...expectedCometSchemas,
    ...expectedFalSchemas,
    ...expectedSharedSchemas
  ];

  log(`\nTotal schemas: ${schemaNames.length}`);

  const missingSchemas = allExpectedSchemas.filter(name => !schemaNames.includes(name));
  const extraSchemas = schemaNames.filter(name => !allExpectedSchemas.includes(name));

  if (missingSchemas.length === 0) {
    success('All expected schemas present');
  } else {
    error(`Missing schemas: ${missingSchemas.join(', ')}`);
    errorCount++;
  }

  if (extraSchemas.length > 0) {
    warning(`Extra schemas found: ${extraSchemas.join(', ')}`);
    warningCount++;
  }

  // Check for duplicate patterns
  const duplicatePatterns = [
    { pattern: /FalEstimate(Request|Response)/, name: 'FalEstimate' },
    { pattern: /FalEstimatedCost(Request|Response)/, name: 'FalEstimatedCost' }
  ];

  duplicatePatterns.forEach(({ pattern, name }) => {
    const matches = schemaNames.filter(s => pattern.test(s));
    if (matches.length > 1) {
      warning(`Potential duplicates for ${name}: ${matches.join(', ')}`);
      warningCount++;
    }
  });

  // 6. Server configuration
  header('6. Server Configuration');
  const servers = spec.servers || [];
  
  const expectedServers = [
    { url: 'https://api.cometapi.com/v1', provider: 'Comet' },
    { url: 'https://api.fal.ai/v1', provider: 'FAL' }
  ];

  expectedServers.forEach(({ url, provider }) => {
    const found = servers.find(s => s.url === url);
    if (found) {
      success(`${provider} server configured: ${url}`);
    } else {
      error(`${provider} server missing: ${url}`);
      errorCount++;
    }
  });

  // 7. Operation-level server overrides
  header('7. Operation Server Overrides');
  let serverOverrideErrors = 0;

  Object.entries(paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      if (typeof operation === 'object' && operation.tags) {
        const tag = operation.tags[0];
        const expectedServer = tag === 'COMET_API' 
          ? 'https://api.cometapi.com/v1'
          : 'https://api.fal.ai/v1';

        if (operation.servers && operation.servers.length > 0) {
          const actualServer = operation.servers[0].url;
          if (actualServer === expectedServer) {
            // Server override is correct
          } else {
            error(`${method.toUpperCase()} ${path}: Wrong server ${actualServer}`);
            serverOverrideErrors++;
          }
        } else {
          // No override - will inherit from global
          warning(`${method.toUpperCase()} ${path}: No server override (using global)`);
        }
      }
    });
  });

  if (serverOverrideErrors === 0) {
    success('All operation servers configured correctly');
  } else {
    errorCount += serverOverrideErrors;
  }

  // 8. Example validation
  header('8. Example Validation');
  let exampleCount = 0;

  Object.entries(paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      if (typeof operation === 'object' && operation.responses) {
        Object.entries(operation.responses).forEach(([code, response]) => {
          const content = response.content?.['application/json'];
          if (content?.examples) {
            exampleCount += Object.keys(content.examples).length;
          }
        });
      }
    });
  });

  success(`Found ${exampleCount} response examples`);

  // Summary
  header('Validation Summary');
  
  if (errorCount === 0 && warningCount === 0) {
    success('✨ Specification is valid and ready for import!');
    log('\nNext steps:', colors.cyan);
    log('  1. Import into Apidog (OpenAPI 3.0 format)');
    log('  2. Regenerate client: npm run generate:api-hub-client');
    log('  3. Test endpoint execution with valid API keys');
  } else {
    if (errorCount > 0) {
      error(`\n❌ Validation failed with ${errorCount} error(s)`);
    }
    if (warningCount > 0) {
      warning(`⚠️  ${warningCount} warning(s) found`);
    }
    
    if (errorCount > 0) {
      log('\nPlease fix the errors before importing to Apidog.', colors.red);
      process.exit(1);
    }
  }

  return { errors: errorCount, warnings: warningCount };
}

// Run validation
validateSpec().catch(err => {
  error('Validation failed: ' + err.message);
  console.error(err);
  process.exit(1);
});
