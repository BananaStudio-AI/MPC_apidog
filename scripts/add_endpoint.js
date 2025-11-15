#!/usr/bin/env node
/**
 * Add API Endpoint via Terminal
 * 
 * This interactive script allows you to add new API endpoints to your Apidog project
 * directly from the terminal using a simple CLI interface.
 * 
 * Usage:
 *   node scripts/add_endpoint.js
 * 
 * Environment Variables:
 *   APIDOG_PROJECT_ID - Your Apidog project ID
 *   APIDOG_ACCESS_TOKEN - Your Apidog API access token
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { createInterface } from 'readline';

// Get environment variables
const projectId = process.env.APIDOG_PROJECT_ID;
const accessToken = process.env.APIDOG_ACCESS_TOKEN;

if (!projectId || !accessToken) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please set APIDOG_PROJECT_ID and APIDOG_ACCESS_TOKEN');
  console.error('   You can copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function addEndpoint() {
  console.log('\n🚀 Add New API Endpoint to Apidog\n');
  console.log('Fill in the following details for your API endpoint:\n');

  try {
    // Collect endpoint details
    const name = await question('Endpoint Name (e.g., "Get User"): ');
    if (!name) {
      console.error('❌ Endpoint name is required');
      rl.close();
      process.exit(1);
    }

    const method = await question('HTTP Method (GET/POST/PUT/DELETE/PATCH) [GET]: ');
    const selectedMethod = method.toUpperCase() || 'GET';
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(selectedMethod)) {
      console.error('❌ Invalid HTTP method');
      rl.close();
      process.exit(1);
    }

    const path = await question('API Path (e.g., "/api/v1/users/{id}"): ');
    if (!path) {
      console.error('❌ API path is required');
      rl.close();
      process.exit(1);
    }

    const description = await question('Description (optional): ');
    
    const collectionName = await question('Collection Name (optional, default: "Default Collection"): ');
    const finalCollectionName = collectionName || 'Default Collection';

    // Create endpoint object
    const newEndpoint = {
      id: `endpoint-${Date.now()}`,
      name: name,
      method: selectedMethod,
      path: path,
      description: description || undefined,
      parameters: [],
      createdAt: new Date().toISOString()
    };

    // Ask if user wants to add parameters
    const addParams = await question('\nAdd parameters? (y/N): ');
    if (addParams.toLowerCase() === 'y' || addParams.toLowerCase() === 'yes') {
      console.log('\n📝 Adding parameters (press Enter on empty name to finish):\n');
      
      while (true) {
        const paramName = await question('  Parameter name: ');
        if (!paramName) break;

        const paramType = await question('  Type (string/number/boolean/object/array) [string]: ');
        const paramRequired = await question('  Required? (y/N): ');
        const paramDesc = await question('  Description (optional): ');

        newEndpoint.parameters.push({
          name: paramName,
          type: paramType || 'string',
          required: paramRequired.toLowerCase() === 'y' || paramRequired.toLowerCase() === 'yes',
          description: paramDesc || undefined
        });

        console.log('  ✓ Parameter added\n');
      }
    }

    console.log('\n📋 Endpoint Summary:');
    console.log(`   Name: ${newEndpoint.name}`);
    console.log(`   Method: ${newEndpoint.method}`);
    console.log(`   Path: ${newEndpoint.path}`);
    console.log(`   Collection: ${finalCollectionName}`);
    console.log(`   Parameters: ${newEndpoint.parameters.length}`);

    const confirm = await question('\n✅ Add this endpoint? (Y/n): ');
    if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
      console.log('❌ Operation cancelled');
      rl.close();
      process.exit(0);
    }

    // Load or create endpoints file
    const endpointsPath = resolve('./apis/endpoints.json');
    let endpointsData;
    
    try {
      const fileContent = await readFile(endpointsPath, 'utf-8');
      endpointsData = JSON.parse(fileContent);
    } catch (error) {
      // Create new structure if file doesn't exist
      endpointsData = {
        projectId,
        fetchedAt: new Date().toISOString(),
        collections: []
      };
    }

    // Find or create collection
    let collection = endpointsData.collections.find(c => c.name === finalCollectionName);
    if (!collection) {
      collection = {
        id: `collection-${Date.now()}`,
        name: finalCollectionName,
        description: `Collection for ${finalCollectionName}`,
        endpoints: []
      };
      endpointsData.collections.push(collection);
    }

    // Add endpoint to collection
    collection.endpoints.push(newEndpoint);
    endpointsData.fetchedAt = new Date().toISOString();

    // Save to file
    await writeFile(endpointsPath, JSON.stringify(endpointsData, null, 2), 'utf-8');

    console.log('\n✅ Endpoint added successfully!');
    console.log(`   Saved to: ${endpointsPath}`);
    console.log(`   Collection: ${finalCollectionName} (${collection.endpoints.length} endpoints)`);
    console.log('\n💡 Next steps:');
    console.log('   1. Review the endpoint in apis/endpoints.json');
    console.log('   2. Run: node scripts/push_endpoints.js --force');
    console.log('   3. Verify in Apidog dashboard');

    // Note about MCP integration
    console.log('\n📡 Note: To sync with Apidog, run:');
    console.log('   node scripts/push_endpoints.js');

  } catch (error) {
    console.error('\n❌ Error adding endpoint:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
addEndpoint();
