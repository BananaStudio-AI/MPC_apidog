#!/usr/bin/env node
import './lib/load_env.js';
/**
 * Health check for Apidog API authentication.
 * Calls Apidog REST API directly to verify token and project access.
 * 
 * Apidog API uses Bearer token authentication:
 * - Token: Account-level API access token from Account Settings → API Access Token
 * - Format: Authorization: Bearer <token>
 * 
 * Usage: npm run apidog:auth-check
 */

async function main() {
  const TOKEN = process.env.APIDOG_ACCESS_TOKEN;
  const PROJECT_ID = process.env.APIDOG_PROJECT_ID || '1128155';

  if (!TOKEN) {
    console.error('❌ APIDOG_ACCESS_TOKEN not set');
    console.log('   Set it in .env from: Team Settings → Authorization → API Access Tokens');
    console.log('   (Use team/workspace tokens, NOT account-level tokens)');
    process.exit(1);
  }

  // Validate token format
  if (TOKEN.includes(':')) {
    console.warn('⚠️  WARNING: Token contains colon (:) which suggests wrong format!');
    console.warn('   Apidog uses Bearer token auth, not key:secret format.');
    console.warn('   Get the correct token from: Account Settings → API Access Token');
    console.warn('   Token should be a single string without colons.\n');
  }

  console.log('🔍 Apidog API Authentication Check');
  console.log(`   Project ID: ${PROJECT_ID}`);
  console.log(`   Token: ${TOKEN.substring(0, 20)}...${TOKEN.substring(TOKEN.length - 4)}`);
  console.log();

  try {
    const { default: fetch } = await import('node-fetch');

    // Test 1: Get project info
    console.log('📡 Test 1: Fetching project details...');
    const projectUrl = `https://api.apidog.com/api/v1/projects/${PROJECT_ID}`;
    const projectResponse = await fetch(projectUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${projectResponse.status} ${projectResponse.statusText}`);

    if (!projectResponse.ok) {
      const errorBody = await projectResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorBody);
      } catch {
        errorData = { raw: errorBody };
      }

      console.error('❌ Project API call failed');
      console.error('   Status:', projectResponse.status);
      console.error('   Response:', JSON.stringify(errorData, null, 2));
      
      if (projectResponse.status === 401) {
        console.log('\n💡 401 Unauthorized:');
        console.log('   - Token is invalid or expired');
        console.log('   - Generate new token: Account Settings → API Access Token');
      } else if (projectResponse.status === 403) {
        console.log('\n💡 403 Forbidden:');
        console.log('   You are using an account-level token which lacks project permissions.');
        console.log('   This is expected behavior - account tokens do not have project access.');
        console.log('');
        console.log('   Fix: Use a team/workspace-level token instead:');
        console.log('   1. Go to Apidog → Team Settings → Authorization → API Access Tokens');
        console.log('   2. Generate a new team/workspace token');
        console.log('   3. Update APIDOG_ACCESS_TOKEN in .env');
        console.log('   4. Re-run this auth check');
        console.log('');
        console.log('   Alternative (if team tokens unavailable):');
        console.log('   - Add your account to project', PROJECT_ID);
        console.log('   - Apidog dashboard → Project Settings → Members');
      } else if (projectResponse.status === 404) {
        console.log('\n💡 404 Not Found:');
        console.log('   - Project', PROJECT_ID, 'does not exist');
        console.log('   - Verify APIDOG_PROJECT_ID in .env');
      }
      
      process.exit(1);
    }

    const projectData = await projectResponse.json();
    console.log('✅ Project access confirmed');
    console.log(`   Name: ${projectData.data?.name || projectData.name || 'Unknown'}`);
    console.log();

    // Test 2: List APIs/endpoints
    console.log('📡 Test 2: Listing APIs...');
    const apisUrl = `https://api.apidog.com/api/v1/projects/${PROJECT_ID}/apis`;
    const apisResponse = await fetch(apisUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${apisResponse.status} ${apisResponse.statusText}`);

    if (!apisResponse.ok) {
      const errorBody = await apisResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorBody);
      } catch {
        errorData = { raw: errorBody };
      }

      console.error('❌ API list call failed');
      console.error('   Response:', JSON.stringify(errorData, null, 2));
      process.exit(1);
    }

    const apisData = await apisResponse.json();
    const apiCount = apisData.data?.length || apisData.length || 0;
    console.log(`✅ API list access confirmed (${apiCount} APIs found)`);
    console.log();

    console.log('🎉 Authentication successful! Token is valid and has project access.');
    console.log();
    console.log('✅ Next steps:');
    console.log('   npm run apidog:pull        # Pull endpoints via MCP');
    console.log('   npm run apidog:validate    # Validate specs');

  } catch (err) {
    console.error('❌ Error:', err.message);
    
    if (err.code === 'ENOTFOUND' || err.message.includes('ENOTFOUND')) {
      console.log('\n💡 Network error: Cannot reach api.apidog.com');
      console.log('   - Check internet connection');
      console.log('   - Verify DNS resolution');
    }
    
    process.exit(1);
  }
}

main();
