#!/usr/bin/env ts-node
/**
 * Import api-hub.oas.json into Apidog project via REST API
 * 
 * Apidog Import API endpoint (inferred from common patterns):
 * POST https://api.apidog.com/api/v1/projects/{projectId}/import-data
 * 
 * If the endpoint differs, update APIDOG_IMPORT_URL below.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const APIDOG_BASE_URL = process.env.APIDOG_API_BASE_URL || 'https://api.apidog.com';
const APIDOG_IMPORT_PATH = '/api/v1/projects/{projectId}/import-data';

interface ImportPayload {
  input: {
    type: 'openapi';
    data: string; // JSON string of the OAS
  };
  options?: {
    mode?: 'merge' | 'overwrite';
  };
}

async function main() {
  const TOKEN = process.env.APIDOG_ACCESS_TOKEN;
  const PROJECT_ID = process.env.APIDOG_PROJECT_ID;
  
  if (!TOKEN) {
    console.error('❌ Missing APIDOG_ACCESS_TOKEN in environment');
    process.exit(1);
  }
  
  if (!PROJECT_ID) {
    console.error('❌ Missing APIDOG_PROJECT_ID in environment');
    process.exit(1);
  }
  
  const oasPath = path.join(__dirname, '../openapi/api-hub.oas.json');
  
  console.log(`📖 Reading OpenAPI spec from: ${path.relative(process.cwd(), oasPath)}`);
  
  let oasContent: string;
  try {
    oasContent = await fs.readFile(oasPath, 'utf-8');
    // Validate it's valid JSON
    JSON.parse(oasContent);
  } catch (err: any) {
    console.error(`❌ Failed to read or parse OAS file: ${err.message}`);
    process.exit(1);
  }
  
  const endpoint = `${APIDOG_BASE_URL}${APIDOG_IMPORT_PATH.replace('{projectId}', PROJECT_ID)}`;
  
  console.log(`🚀 Importing to Apidog project ${PROJECT_ID}...`);
  console.log(`   Endpoint: ${endpoint}`);
  
  const payload: ImportPayload = {
    input: {
      type: 'openapi',
      data: oasContent
    },
    options: {
      mode: 'merge' // Use 'overwrite' if you want to replace everything
    }
  };
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }
    
    if (response.ok) {
      console.log(`✅ Import succeeded (HTTP ${response.status})`);
      if (responseData.message || responseData.success) {
        console.log(`   ${responseData.message || 'Success: ' + responseData.success}`);
      }
      process.exit(0);
    } else {
      console.error(`❌ Import failed (HTTP ${response.status})`);
      console.error(`   ${responseData.message || responseData.error || responseText}`);
      
      if (response.status === 404) {
        console.error('\n💡 Hint: The import endpoint URL may be incorrect.');
        console.error('   Check Apidog API docs or update APIDOG_IMPORT_PATH in this script.');
        console.error(`   Current: ${APIDOG_IMPORT_PATH}`);
      } else if (response.status === 401 || response.status === 403) {
        console.error('\n💡 Hint: Check APIDOG_ACCESS_TOKEN has import permissions.');
      }
      
      process.exit(1);
    }
  } catch (err: any) {
    console.error(`❌ Network or fetch error: ${err.message}`);
    process.exit(1);
  }
}

main();
