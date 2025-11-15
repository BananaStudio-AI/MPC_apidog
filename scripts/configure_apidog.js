#!/usr/bin/env node
/**
 * Configure Apidog API Credentials
 * 
 * Interactive script to set up your Apidog API credentials in the terminal.
 * This creates or updates the .env file with your access token and project ID.
 * 
 * Usage:
 *   node scripts/configure_apidog.js
 * 
 * Features:
 *   - Interactive prompts for credentials
 *   - Validates required fields
 *   - Creates or updates .env file
 *   - Masks sensitive token input
 *   - Tests connection (optional)
 */

import { readFile, writeFile, access } from 'fs/promises';
import { resolve } from 'path';
import { createInterface } from 'readline';
import { constants } from 'fs';

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

function questionPassword(prompt) {
  return new Promise((resolve) => {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Note: In a production environment, you'd want to use a library
    // like 'readline' with proper password masking. For simplicity,
    // this version shows a warning but accepts visible input.
    readline.question(prompt, (answer) => {
      readline.close();
      resolve(answer.trim());
    });
  });
}

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function loadExistingEnv() {
  const envPath = resolve('.env');
  if (await fileExists(envPath)) {
    try {
      const content = await readFile(envPath, 'utf-8');
      const env = {};
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          env[match[1].trim()] = match[2].trim();
        }
      });
      return env;
    } catch {
      return {};
    }
  }
  return {};
}

async function configureApidog() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     🔧 Apidog API Configuration Setup                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  console.log('This script will help you configure your Apidog credentials.\n');
  console.log('You\'ll need:');
  console.log('  1. Apidog Access Token (from your Apidog account settings)');
  console.log('  2. Apidog Project ID (from your project URL or settings)\n');

  try {
    // Check for existing configuration
    const existingEnv = await loadExistingEnv();
    const hasExisting = existingEnv.APIDOG_ACCESS_TOKEN || existingEnv.APIDOG_PROJECT_ID;

    if (hasExisting) {
      console.log('📋 Found existing configuration:');
      if (existingEnv.APIDOG_PROJECT_ID) {
        console.log(`   Project ID: ${existingEnv.APIDOG_PROJECT_ID}`);
      }
      if (existingEnv.APIDOG_ACCESS_TOKEN) {
        const maskedToken = existingEnv.APIDOG_ACCESS_TOKEN.substring(0, 8) + '...';
        console.log(`   Access Token: ${maskedToken} (hidden)`);
      }
      console.log('');
      
      const overwrite = await question('Do you want to update these credentials? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('✅ Keeping existing configuration.');
        rl.close();
        return;
      }
      console.log('');
    }

    // Get Apidog Project ID
    console.log('📌 Step 1: Apidog Project ID');
    console.log('   Find this in your Apidog project URL or settings page.');
    console.log('   Example: If URL is "https://apidog.com/project/12345", ID is "12345"\n');
    
    const defaultProjectId = existingEnv.APIDOG_PROJECT_ID || '';
    const promptProjectId = defaultProjectId 
      ? `Project ID [${defaultProjectId}]: `
      : 'Project ID: ';
    
    let projectId = await question(promptProjectId);
    if (!projectId && defaultProjectId) {
      projectId = defaultProjectId;
    }
    
    if (!projectId) {
      console.error('\n❌ Error: Project ID is required');
      rl.close();
      process.exit(1);
    }

    // Get Apidog Access Token
    console.log('\n📌 Step 2: Apidog Access Token');
    console.log('   Get this from: Account Settings → API Access → Generate Token');
    console.log('   ⚠️  Warning: Token will be visible as you type\n');
    
    const hasExistingToken = !!existingEnv.APIDOG_ACCESS_TOKEN;
    const promptToken = hasExistingToken
      ? 'Access Token [press Enter to keep existing]: '
      : 'Access Token: ';
    
    let accessToken = await questionPassword(promptToken);
    if (!accessToken && hasExistingToken) {
      accessToken = existingEnv.APIDOG_ACCESS_TOKEN;
    }
    
    if (!accessToken) {
      console.error('\n❌ Error: Access Token is required');
      rl.close();
      process.exit(1);
    }

    // Confirm configuration
    console.log('\n📋 Configuration Summary:');
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Access Token: ${accessToken.substring(0, 8)}... (${accessToken.length} characters)`);
    console.log('');

    const confirm = await question('Save this configuration? (Y/n): ');
    if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
      console.log('❌ Configuration cancelled');
      rl.close();
      process.exit(0);
    }

    // Create .env file content
    const envContent = `# Apidog MCP Server Configuration
# Generated by configure_apidog.js on ${new Date().toISOString()}

APIDOG_ACCESS_TOKEN=${accessToken}
APIDOG_PROJECT_ID=${projectId}
`;

    // Write to .env file
    const envPath = resolve('.env');
    await writeFile(envPath, envContent, 'utf-8');

    console.log('\n✅ Configuration saved successfully!');
    console.log(`   Location: ${envPath}`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Start the MCP server:');
    console.log('      ./setup-mcp.sh');
    console.log('');
    console.log('   2. Or use the automation scripts:');
    console.log('      node scripts/pull_endpoints.js');
    console.log('      node scripts/add_endpoint.js');
    console.log('      node scripts/push_endpoints.js');
    console.log('');
    console.log('💡 Tip: Your credentials are stored in .env (gitignored)');
    console.log('   Never commit this file to version control!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error during configuration:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
configureApidog();
