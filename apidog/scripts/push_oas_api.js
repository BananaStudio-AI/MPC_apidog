#!/usr/bin/env node
/*
  Push merged OAS directly to Apidog via REST API.
  Requires APIDOG_ACCESS_TOKEN with write permissions.
  
  Usage:
    node push_oas_api.js                    # Use oas_merged.json
    node push_oas_api.js path/to/spec.json  # Custom OAS file
*/
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const DEFAULT_OAS = path.join(ROOT, 'apidog', 'generated', 'oas_merged.json');
const PROJECT_ID = process.env.APIDOG_PROJECT_ID || '1128155';
const TOKEN = process.env.APIDOG_ACCESS_TOKEN;

// Apidog REST API endpoints
const API_BASE = 'https://api.apidog.com/api/v1';

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const text = await response.text();
  
  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function importOAS(oasPath) {
  console.log(`Reading OAS from: ${oasPath}`);
  const raw = await fs.readFile(oasPath, 'utf8');
  const oas = JSON.parse(raw);
  
  console.log(`\nImporting OpenAPI spec to project ${PROJECT_ID}...`);
  console.log(`  Title: ${oas.info?.title || 'N/A'}`);
  console.log(`  Version: ${oas.info?.version || 'N/A'}`);
  console.log(`  Paths: ${Object.keys(oas.paths || {}).length}`);
  
  // Apidog import endpoint (may vary - check API docs)
  // Common patterns: /projects/{id}/import-data or /projects/{id}/openapi
  const importEndpoint = `/projects/${PROJECT_ID}/import-data`;
  
  const payload = {
    dataType: 'openapi',
    openapi: oas,
    importMode: 'merge', // or 'overwrite' 
    options: {
      mergeStrategy: 'update_existing', // keep existing, update changed
      importSchemas: true,
      importEndpoints: true,
    }
  };
  
  try {
    const result = await makeRequest(importEndpoint, 'POST', payload);
    console.log('\n✅ Import successful!');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    if (err.message.includes('404') || err.message.includes('Not Found')) {
      console.error('\n❌ Import endpoint not found. This may mean:');
      console.error('  1. Apidog REST API import endpoint has changed');
      console.error('  2. Your token lacks import permissions');
      console.error('  3. Import must be done via Apidog Web UI');
      console.error('\nFallback: Import manually via Apidog UI:');
      console.error(`  Project Settings → Import → OpenAPI → Upload ${oasPath}`);
    }
    throw err;
  }
}

async function main() {
  if (!TOKEN) {
    console.error('❌ Missing APIDOG_ACCESS_TOKEN environment variable');
    console.error('Set it in .env or export it before running this script');
    process.exit(1);
  }
  
  const oasPath = process.argv[2] || DEFAULT_OAS;
  
  try {
    await fs.access(oasPath);
  } catch {
    console.error(`❌ OAS file not found: ${oasPath}`);
    console.error('\nGenerate it first with:');
    console.error('  npm run apidog:push:oas -- --force');
    process.exit(1);
  }
  
  await importOAS(oasPath);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
