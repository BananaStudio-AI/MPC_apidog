#!/usr/bin/env tsx

/**
 * Validate Push Readiness
 * 
 * Checks if everything is ready to push the API Hub to Apidog:
 * - Bundle files exist and are valid
 * - Environment variables are configured
 * - OpenAPI spec is valid
 * 
 * Usage:
 *   tsx scripts/validate_push_readiness.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUNDLE_DIR = path.join(__dirname, '../apidog-ui-bundle');
const REQUIRED_FILES = [
  'oas.json',
  'folder_map.json',
  'request_examples.json',
  'response_examples.json',
  'ui_metadata.json'
];

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

function checkEnvironment(): ValidationResult {
  const token = process.env.APIDOG_ACCESS_TOKEN;
  const projectId = process.env.APIDOG_PROJECT_ID || '1128155';
  
  if (!token) {
    return {
      passed: false,
      message: 'APIDOG_ACCESS_TOKEN not set',
      details: {
        instruction: 'Set the token with: export APIDOG_ACCESS_TOKEN=your_token',
        help: 'Get your token from Apidog Account Settings → API Access Token'
      }
    };
  }
  
  return {
    passed: true,
    message: 'Environment variables configured',
    details: {
      token: `${token.slice(0, 10)}...`,
      projectId
    }
  };
}

function checkBundleFiles(): ValidationResult {
  if (!fs.existsSync(BUNDLE_DIR)) {
    return {
      passed: false,
      message: 'Bundle directory not found',
      details: { path: BUNDLE_DIR }
    };
  }
  
  const missingFiles: string[] = [];
  const fileDetails: any = {};
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(BUNDLE_DIR, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    } else {
      const stats = fs.statSync(filePath);
      fileDetails[file] = {
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        modified: stats.mtime.toISOString()
      };
    }
  }
  
  if (missingFiles.length > 0) {
    return {
      passed: false,
      message: 'Missing required bundle files',
      details: { missing: missingFiles }
    };
  }
  
  return {
    passed: true,
    message: 'All bundle files present',
    details: fileDetails
  };
}

function validateOASSpec(): ValidationResult {
  try {
    const oasPath = path.join(BUNDLE_DIR, 'oas.json');
    const oas = JSON.parse(fs.readFileSync(oasPath, 'utf-8'));
    
    // Basic OpenAPI validation
    if (!oas.openapi) {
      return {
        passed: false,
        message: 'Not a valid OpenAPI spec (missing openapi field)'
      };
    }
    
    if (!oas.info) {
      return {
        passed: false,
        message: 'Missing required info section'
      };
    }
    
    if (!oas.paths || Object.keys(oas.paths).length === 0) {
      return {
        passed: false,
        message: 'No paths/endpoints defined'
      };
    }
    
    const endpointCount = Object.keys(oas.paths).length;
    const schemaCount = oas.components?.schemas ? Object.keys(oas.components.schemas).length : 0;
    
    return {
      passed: true,
      message: 'OpenAPI spec is valid',
      details: {
        version: oas.openapi,
        title: oas.info.title,
        endpoints: endpointCount,
        schemas: schemaCount
      }
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Failed to parse OpenAPI spec',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}

function validateBundleConsistency(): ValidationResult {
  try {
    const oas = JSON.parse(fs.readFileSync(path.join(BUNDLE_DIR, 'oas.json'), 'utf-8'));
    const folderMap = JSON.parse(fs.readFileSync(path.join(BUNDLE_DIR, 'folder_map.json'), 'utf-8'));
    const requestExamples = JSON.parse(fs.readFileSync(path.join(BUNDLE_DIR, 'request_examples.json'), 'utf-8'));
    const responseExamples = JSON.parse(fs.readFileSync(path.join(BUNDLE_DIR, 'response_examples.json'), 'utf-8'));
    const uiMetadata = JSON.parse(fs.readFileSync(path.join(BUNDLE_DIR, 'ui_metadata.json'), 'utf-8'));
    
    const oasEndpoints = Object.keys(oas.paths).length;
    const reqExamplesEndpoints = Object.keys(requestExamples.endpoints || {}).length;
    const respExamplesEndpoints = Object.keys(responseExamples.endpoints || {}).length;
    const uiMetadataEndpoints = Object.keys(uiMetadata.endpoints || {}).length;
    
    if (reqExamplesEndpoints !== oasEndpoints || respExamplesEndpoints !== oasEndpoints) {
      return {
        passed: false,
        message: 'Bundle files are inconsistent',
        details: {
          oas: oasEndpoints,
          requestExamples: reqExamplesEndpoints,
          responseExamples: respExamplesEndpoints,
          uiMetadata: uiMetadataEndpoints
        }
      };
    }
    
    return {
      passed: true,
      message: 'Bundle files are consistent',
      details: {
        endpoints: oasEndpoints,
        folders: Object.keys(folderMap.folders).length
      }
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Failed to validate bundle consistency',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         🍌 Apidog Push Readiness Validation 🍌               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvironment },
    { name: 'Bundle Files', fn: checkBundleFiles },
    { name: 'OpenAPI Specification', fn: validateOASSpec },
    { name: 'Bundle Consistency', fn: validateBundleConsistency }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    console.log(`\n🔍 Checking: ${check.name}`);
    console.log('─'.repeat(60));
    
    const result = check.fn();
    
    if (result.passed) {
      console.log(`✅ ${result.message}`);
      if (result.details) {
        console.log(JSON.stringify(result.details, null, 2));
      }
    } else {
      console.log(`❌ ${result.message}`);
      if (result.details) {
        console.log(JSON.stringify(result.details, null, 2));
      }
      allPassed = false;
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  
  if (allPassed) {
    console.log('\n✅ All checks passed! Ready to push to Apidog.');
    console.log('\nRun: npm run push:apidog\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed. Please fix the issues above.');
    console.log('\n📚 Documentation:');
    console.log('   - Environment setup: .env.example');
    console.log('   - Bundle structure: apidog-ui-bundle/README.md');
    console.log('   - API documentation: docs/APIDOG_WORKFLOWS.md\n');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
}

export { checkEnvironment, checkBundleFiles, validateOASSpec, validateBundleConsistency };
