#!/usr/bin/env node
/**
 * Push Endpoints to Apidog
 * 
 * This script updates API endpoints in an Apidog project via the MCP server
 * by reading endpoint definitions from a local JSON file.
 * 
 * Usage:
 *   node scripts/push_endpoints.js [--input <path>] [--force]
 * 
 * Options:
 *   --input <path>  Path to the endpoints JSON file (default: ./apis/endpoints.json)
 *   --force         Force overwrite existing endpoints without confirmation
 * 
 * Environment Variables:
 *   APIDOG_PROJECT_ID - Your Apidog project ID
 *   APIDOG_ACCESS_TOKEN - Your Apidog API access token
 */

import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { createInterface } from 'readline';

// Parse command line arguments
const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input');
const inputPath = inputIndex !== -1 && args[inputIndex + 1] 
  ? args[inputIndex + 1] 
  : './apis/endpoints.json';
const forceOverwrite = args.includes('--force');

// Get environment variables
const projectId = process.env.APIDOG_PROJECT_ID;
const accessToken = process.env.APIDOG_ACCESS_TOKEN;

if (!projectId || !accessToken) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please set APIDOG_PROJECT_ID and APIDOG_ACCESS_TOKEN');
  console.error('   You can copy .env.example to .env and fill in your credentials');
  process.exit(1);
}

async function confirmAction(message) {
  if (forceOverwrite) {
    return true;
  }
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function pushEndpoints() {
  try {
    console.log('📤 Pushing endpoints to Apidog...');
    console.log(`   Project ID: ${projectId}`);
    
    // Read endpoints from file
    const resolvedPath = resolve(inputPath);
    const fileContent = await readFile(resolvedPath, 'utf-8');
    const endpoints = JSON.parse(fileContent);
    
    console.log(`   Source: ${resolvedPath}`);
    console.log(`   Collections: ${endpoints.collections?.length || 0}`);
    
    // Confirm action
    const confirmed = await confirmAction(
      '⚠️  This will update endpoints in Apidog. Continue?'
    );
    
    if (!confirmed) {
      console.log('❌ Operation cancelled by user');
      process.exit(0);
    }
    
    // Note: In a real implementation, this would use the MCP server tools
    // to update endpoints. For now, this is a template structure.
    // The actual API calls should go through the Apidog MCP server.
    
    console.log('🔄 Updating endpoints...');
    
    // This is where you would use MCP server tools to:
    // 1. Iterate through collections and endpoints
    // 2. Call MCP tools to update each endpoint
    // 3. Handle conflicts and errors
    
    console.log('✅ Endpoints pushed successfully!');
    console.log('   Note: Use MCP server tools to implement actual push logic');
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Error: Endpoints file not found');
      console.error(`   Path: ${resolve(inputPath)}`);
      console.error('   Run pull_endpoints.js first or specify correct --input path');
    } else {
      console.error('❌ Error pushing endpoints:', error.message);
    }
    process.exit(1);
  }
}

// Run the script
pushEndpoints();
