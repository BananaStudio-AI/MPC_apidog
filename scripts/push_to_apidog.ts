#!/usr/bin/env tsx

/**
 * Push API Hub OpenAPI Spec to Apidog
 * 
 * This script uploads the complete API Hub bundle to Apidog including:
 * - OpenAPI 3.1.0 spec with inline schemas (no external $refs)
 * - Folder structure mapping for UI organization
 * - Request/response examples for all endpoints
 * - UI metadata for automatic generation
 * 
 * Usage:
 *   APIDOG_ACCESS_TOKEN=xxx APIDOG_PROJECT_ID=1128155 tsx scripts/push_to_apidog.ts
 * 
 * Or with npm script:
 *   npm run push:apidog
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const APIDOG_API_BASE = 'https://api.apidog.com/v1';
const APIDOG_ACCESS_TOKEN = process.env.APIDOG_ACCESS_TOKEN;
const APIDOG_PROJECT_ID = process.env.APIDOG_PROJECT_ID || '1128155';
const BUNDLE_DIR = path.join(__dirname, '../apidog-ui-bundle');

// Required files in bundle
const REQUIRED_FILES = [
  'oas.json',
  'folder_map.json',
  'request_examples.json',
  'response_examples.json',
  'ui_metadata.json'
];

// ============================================================================
// Validation
// ============================================================================

function validateEnvironment() {
  console.log('🔍 Validating environment...\n');
  
  if (!APIDOG_ACCESS_TOKEN) {
    console.error('❌ Missing APIDOG_ACCESS_TOKEN environment variable');
    console.error('   Set it with: export APIDOG_ACCESS_TOKEN=your_token_here\n');
    process.exit(1);
  }
  
  if (!APIDOG_PROJECT_ID) {
    console.error('❌ Missing APIDOG_PROJECT_ID environment variable');
    console.error('   Set it with: export APIDOG_PROJECT_ID=1128155\n');
    process.exit(1);
  }
  
  console.log(`✅ Access token: ${APIDOG_ACCESS_TOKEN.slice(0, 10)}...`);
  console.log(`✅ Project ID: ${APIDOG_PROJECT_ID}\n`);
}

function validateBundleFiles() {
  console.log('🔍 Validating bundle files...\n');
  
  if (!fs.existsSync(BUNDLE_DIR)) {
    console.error(`❌ Bundle directory not found: ${BUNDLE_DIR}`);
    console.error('   Run: npm run bundle:create\n');
    process.exit(1);
  }
  
  const missingFiles: string[] = [];
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(BUNDLE_DIR, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    } else {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error(`\n❌ Missing required files: ${missingFiles.join(', ')}`);
    console.error('   Run: npm run bundle:create\n');
    process.exit(1);
  }
  
  console.log();
}

// ============================================================================
// Bundle Loading
// ============================================================================

interface ApidogBundle {
  oas: any;
  folderMap: any;
  requestExamples: any;
  responseExamples: any;
  uiMetadata: any;
}

function loadBundle(): ApidogBundle {
  console.log('📦 Loading bundle files...\n');
  
  const bundle: ApidogBundle = {
    oas: null,
    folderMap: null,
    requestExamples: null,
    responseExamples: null,
    uiMetadata: null
  };
  
  try {
    bundle.oas = JSON.parse(
      fs.readFileSync(path.join(BUNDLE_DIR, 'oas.json'), 'utf-8')
    );
    console.log(`✅ Loaded OpenAPI spec (${bundle.oas.info.version})`);
    
    bundle.folderMap = JSON.parse(
      fs.readFileSync(path.join(BUNDLE_DIR, 'folder_map.json'), 'utf-8')
    );
    console.log(`✅ Loaded folder structure (${Object.keys(bundle.folderMap.folders).length} folders)`);
    
    bundle.requestExamples = JSON.parse(
      fs.readFileSync(path.join(BUNDLE_DIR, 'request_examples.json'), 'utf-8')
    );
    console.log(`✅ Loaded request examples (${Object.keys(bundle.requestExamples.endpoints).length} endpoints)`);
    
    bundle.responseExamples = JSON.parse(
      fs.readFileSync(path.join(BUNDLE_DIR, 'response_examples.json'), 'utf-8')
    );
    console.log(`✅ Loaded response examples (${Object.keys(bundle.responseExamples.endpoints).length} endpoints)`);
    
    bundle.uiMetadata = JSON.parse(
      fs.readFileSync(path.join(BUNDLE_DIR, 'ui_metadata.json'), 'utf-8')
    );
    console.log(`✅ Loaded UI metadata (${Object.keys(bundle.uiMetadata.endpoints).length} endpoint configs)`);
    
  } catch (error) {
    console.error(`\n❌ Failed to load bundle files:`, error);
    process.exit(1);
  }
  
  console.log();
  return bundle;
}

// ============================================================================
// Apidog API Client
// ============================================================================

async function pushToApidog(bundle: ApidogBundle) {
  console.log('🚀 Pushing to Apidog...\n');
  
  const endpoint = `${APIDOG_API_BASE}/projects/${APIDOG_PROJECT_ID}/import-openapi`;
  
  const payload = {
    input: {
      data: bundle.oas,
      // Include folder mapping and examples in options
      folderStructure: bundle.folderMap,
      requestExamples: bundle.requestExamples,
      responseExamples: bundle.responseExamples,
      uiMetadata: bundle.uiMetadata
    },
    options: {
      overwriteExistingEndpoints: true,
      createFolders: true,
      importExamples: true,
      generateMockServers: true,
      enableAutoDocumentation: true
    }
  };
  
  console.log(`📡 Endpoint: ${endpoint}`);
  console.log(`📦 Payload size: ${(JSON.stringify(payload).length / 1024).toFixed(2)} KB`);
  console.log(`🔐 Authentication: ${APIDOG_ACCESS_TOKEN.slice(0, 10)}...`);
  console.log();
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APIDOG_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Apidog-Api-Version': '2024-03-28'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}\n`);
    
    if (response.ok) {
      console.log('✅ Successfully pushed to Apidog!\n');
      console.log('📋 Response:');
      console.log(JSON.stringify(responseData, null, 2));
      console.log();
      
      console.log('🎉 Import complete! Visit Apidog to see your API Hub:');
      console.log(`   https://apidog.com/project/${APIDOG_PROJECT_ID}\n`);
      
      return true;
    } else {
      console.error('❌ Failed to push to Apidog\n');
      console.error('📋 Error Response:');
      console.error(JSON.stringify(responseData, null, 2));
      console.error();
      
      if (response.status === 401) {
        console.error('🔑 Authentication failed. Check your APIDOG_ACCESS_TOKEN.');
      } else if (response.status === 422) {
        console.error('📝 Validation failed. Check the OpenAPI spec format.');
      } else if (response.status === 404) {
        console.error('🔍 Project not found. Check your APIDOG_PROJECT_ID.');
      }
      
      console.error();
      return false;
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

// ============================================================================
// Summary
// ============================================================================

function printSummary(bundle: ApidogBundle, success: boolean) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 Push Summary');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Project ID: ${APIDOG_PROJECT_ID}`);
  console.log(`API Version: ${bundle.oas.info.version}`);
  console.log(`Endpoints: ${Object.keys(bundle.oas.paths).length}`);
  console.log(`Schemas: ${Object.keys(bundle.oas.components.schemas).length}`);
  console.log(`Folders: ${Object.keys(bundle.folderMap.folders).length}`);
  console.log(`Models: ${bundle.uiMetadata.documentation.model_categories.comet.total + bundle.uiMetadata.documentation.model_categories.fal.total}`);
  console.log();
  
  if (success) {
    console.log('🎯 Next Steps:');
    console.log('   1. Visit Apidog UI to verify folder structure');
    console.log('   2. Test endpoints with request examples');
    console.log('   3. Generate client SDKs');
    console.log('   4. Set up mock servers');
    console.log('   5. Share with team\n');
  } else {
    console.log('🔧 Troubleshooting:');
    console.log('   1. Verify APIDOG_ACCESS_TOKEN is valid');
    console.log('   2. Check APIDOG_PROJECT_ID exists');
    console.log('   3. Validate OAS with: npm run validate:oas');
    console.log('   4. Check Apidog API docs: https://openapi.apidog.io/api-7312738\n');
  }
  
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       🍌 BananaStudio API Hub → Apidog Push Tool 🍌          ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  // Step 1: Validate environment
  validateEnvironment();
  
  // Step 2: Validate bundle files
  validateBundleFiles();
  
  // Step 3: Load bundle
  const bundle = loadBundle();
  
  // Step 4: Push to Apidog
  const success = await pushToApidog(bundle);
  
  // Step 5: Print summary
  printSummary(bundle, success);
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
}

export { main, pushToApidog, loadBundle };
