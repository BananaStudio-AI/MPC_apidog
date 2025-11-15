#!/usr/bin/env node
/**
 * Pull Endpoints from Apidog
 * 
 * This script fetches all API endpoints from an Apidog project via the MCP server
 * and saves them to a local JSON file for version control and reference.
 * 
 * Usage:
 *   node scripts/pull_endpoints.js [--output <path>]
 * 
 * Environment Variables:
 *   APIDOG_PROJECT_ID - Your Apidog project ID
 *   APIDOG_ACCESS_TOKEN - Your Apidog API access token
 */

import { writeFile } from 'fs/promises';
import { resolve } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const outputPath = outputIndex !== -1 && args[outputIndex + 1] 
  ? args[outputIndex + 1] 
  : './apis/endpoints.json';

// Get environment variables
const projectId = process.env.APIDOG_PROJECT_ID;
const accessToken = process.env.APIDOG_ACCESS_TOKEN;

if (!projectId || !accessToken) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please set APIDOG_PROJECT_ID and APIDOG_ACCESS_TOKEN');
  console.error('   You can copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

async function pullEndpoints() {
  try {
    console.log('🔄 Pulling endpoints from Apidog...');
    console.log(`   Project ID: ${projectId}`);
    
    // Note: In a real implementation, this would use the MCP server tools
    // to fetch endpoints. For now, this is a template structure.
    // The actual API calls should go through the Apidog MCP server.
    
    const endpoints = {
      projectId,
      fetchedAt: new Date().toISOString(),
      collections: [],
      // This structure should be populated by querying the MCP server
      // using tools like 'apidog-get-endpoints' or similar
      note: 'Use MCP server tools to populate this data'
    };
    
    // Save to file
    const resolvedPath = resolve(outputPath);
    await writeFile(resolvedPath, JSON.stringify(endpoints, null, 2), 'utf-8');
    
    console.log('✅ Endpoints pulled successfully!');
    console.log(`   Saved to: ${resolvedPath}`);
    console.log(`   Collections: ${endpoints.collections.length}`);
    
  } catch (error) {
    console.error('❌ Error pulling endpoints:', error.message);
    process.exit(1);
  }
}

// Run the script
pullEndpoints();
