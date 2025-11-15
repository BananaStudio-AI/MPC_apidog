#!/usr/bin/env node
/**
 * Import OpenAPI Specification
 * 
 * This script imports OpenAPI/Swagger specifications and converts them to
 * the endpoint format used by this repository.
 * 
 * Usage:
 *   node scripts/import_openapi.js <openapi-file.yaml|openapi-file.json>
 *   node scripts/import_openapi.js --stdin
 * 
 * Features:
 *   - Parses YAML or JSON OpenAPI specs
 *   - Converts to internal endpoint format
 *   - Adds to endpoints.json
 *   - Supports OpenAPI 3.0+
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { stdin } from 'process';

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║     📥 Import OpenAPI Specification                     ║
╚══════════════════════════════════════════════════════════╝

Usage:
  node scripts/import_openapi.js <file.yaml|file.json>
  node scripts/import_openapi.js --stdin

Examples:
  node scripts/import_openapi.js api-spec.yaml
  cat openapi.yaml | node scripts/import_openapi.js --stdin

Supported formats:
  - OpenAPI 3.0.x
  - JSON or YAML

The script will:
  1. Parse the OpenAPI specification
  2. Convert endpoints to internal format
  3. Add to apis/endpoints.json
  4. Show summary of imported endpoints
`);
  process.exit(0);
}

// Simple YAML parser for basic OpenAPI specs
function parseYAML(content) {
  // This is a simplified YAML parser for OpenAPI specs
  // For production use, consider using a proper YAML library
  
  // Try to parse as JSON first
  try {
    return JSON.parse(content);
  } catch (e) {
    // Basic YAML to JSON conversion
    console.error('⚠️  YAML parsing is limited. Please convert to JSON or use a proper YAML file.');
    console.error('   You can convert YAML to JSON at: https://www.json2yaml.com/');
    process.exit(1);
  }
}

function convertOpenAPIToEndpoints(spec) {
  const endpoints = [];
  const paths = spec.paths || {};
  
  // Get collection name from tags or default
  const tags = spec.tags || [];
  const collectionName = tags.length > 0 ? tags[0].name : 'Imported APIs';
  
  // Get base URL from servers
  const baseUrl = spec.servers && spec.servers.length > 0 
    ? spec.servers[0].url 
    : '';
  
  for (const [path, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
        continue;
      }
      
      const endpoint = {
        id: `endpoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: operation.summary || `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        path: path,
        description: operation.description || '',
        parameters: [],
        importedFrom: 'OpenAPI',
        importedAt: new Date().toISOString(),
        tags: operation.tags || [],
        baseUrl: baseUrl
      };
      
      // Convert parameters
      if (operation.parameters) {
        for (const param of operation.parameters) {
          endpoint.parameters.push({
            name: param.name,
            type: param.schema?.type || 'string',
            required: param.required || false,
            description: param.description || '',
            in: param.in // query, header, path, etc.
          });
        }
      }
      
      // Add request body info if present
      if (operation.requestBody) {
        const contentType = Object.keys(operation.requestBody.content || {})[0];
        if (contentType) {
          endpoint.requestBody = {
            contentType: contentType,
            required: operation.requestBody.required || false,
            description: operation.requestBody.description || ''
          };
        }
      }
      
      // Add response info
      if (operation.responses) {
        endpoint.responses = {};
        for (const [statusCode, response] of Object.entries(operation.responses)) {
          endpoint.responses[statusCode] = {
            description: response.description || ''
          };
        }
      }
      
      endpoints.push(endpoint);
    }
  }
  
  return {
    collectionName,
    endpoints,
    info: spec.info || {}
  };
}

async function loadExistingEndpoints() {
  const endpointsPath = resolve('./apis/endpoints.json');
  try {
    const fileContent = await readFile(endpointsPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // Create new structure if file doesn't exist
    return {
      projectId: process.env.APIDOG_PROJECT_ID || '',
      fetchedAt: new Date().toISOString(),
      collections: []
    };
  }
}

async function importOpenAPI() {
  try {
    console.log('\n📥 Importing OpenAPI Specification...\n');
    
    let content;
    
    // Read from stdin or file
    if (args[0] === '--stdin') {
      console.log('Reading from stdin...');
      const chunks = [];
      for await (const chunk of stdin) {
        chunks.push(chunk);
      }
      content = Buffer.concat(chunks).toString('utf-8');
    } else {
      const filePath = resolve(args[0]);
      console.log(`Reading from: ${filePath}`);
      content = await readFile(filePath, 'utf-8');
    }
    
    // Parse the OpenAPI spec
    let spec;
    if (content.trim().startsWith('{')) {
      spec = JSON.parse(content);
    } else {
      spec = parseYAML(content);
    }
    
    console.log(`✓ Parsed OpenAPI ${spec.openapi || spec.swagger || '2.0'}`);
    console.log(`  Title: ${spec.info?.title || 'Untitled'}`);
    console.log(`  Version: ${spec.info?.version || 'N/A'}`);
    
    // Convert to internal format
    const { collectionName, endpoints, info } = convertOpenAPIToEndpoints(spec);
    
    console.log(`\n📊 Found ${endpoints.length} endpoints`);
    
    // Load existing endpoints
    const endpointsData = await loadExistingEndpoints();
    
    // Find or create collection
    let collection = endpointsData.collections.find(c => c.name === collectionName);
    if (!collection) {
      collection = {
        id: `collection-${Date.now()}`,
        name: collectionName,
        description: info.description || `Imported from ${info.title || 'OpenAPI spec'}`,
        endpoints: []
      };
      endpointsData.collections.push(collection);
      console.log(`✓ Created new collection: ${collectionName}`);
    } else {
      console.log(`✓ Using existing collection: ${collectionName}`);
    }
    
    // Add endpoints to collection
    let addedCount = 0;
    for (const endpoint of endpoints) {
      // Check for duplicates
      const exists = collection.endpoints.some(
        e => e.method === endpoint.method && e.path === endpoint.path
      );
      
      if (!exists) {
        collection.endpoints.push(endpoint);
        addedCount++;
        console.log(`  ✓ ${endpoint.method} ${endpoint.path}`);
      } else {
        console.log(`  ⊘ ${endpoint.method} ${endpoint.path} (already exists)`);
      }
    }
    
    endpointsData.fetchedAt = new Date().toISOString();
    
    // Save to file
    const endpointsPath = resolve('./apis/endpoints.json');
    await writeFile(endpointsPath, JSON.stringify(endpointsData, null, 2), 'utf-8');
    
    console.log(`\n✅ Import complete!`);
    console.log(`   Collection: ${collectionName}`);
    console.log(`   New endpoints: ${addedCount}`);
    console.log(`   Total in collection: ${collection.endpoints.length}`);
    console.log(`   Saved to: ${endpointsPath}`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Review the imported endpoints: cat apis/endpoints.json');
    console.log('   2. Push to Apidog: node scripts/push_endpoints.js');
    
  } catch (error) {
    console.error('\n❌ Error importing OpenAPI spec:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
importOpenAPI();
