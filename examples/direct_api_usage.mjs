#!/usr/bin/env node
/**
 * Example: Direct API calls without using the generated client
 * Useful for understanding the raw API structure
 */

import { config } from 'dotenv';
config();

/**
 * Fetch Comet models using fetch API
 */
async function fetchCometModelsRaw() {
  console.log('🔹 Fetching Comet models (raw API)...\n');
  
  const response = await fetch('https://api.cometapi.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${process.env.COMET_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`✓ Response status: ${response.status}`);
  console.log(`✓ Models returned: ${data.data?.length || 0}`);
  
  if (data.data && data.data.length > 0) {
    console.log('\nSample model structure:');
    console.log(JSON.stringify(data.data[0], null, 2));
  }
  
  return data;
}

/**
 * Fetch FAL models using fetch API
 */
async function fetchFalModelsRaw() {
  console.log('\n🔹 Fetching FAL models (raw API)...\n');
  
  const response = await fetch('https://api.fal.ai/v1/models?limit=5', {
    headers: {
      'Authorization': `Key ${process.env.FAL_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`✓ Response status: ${response.status}`);
  console.log(`✓ Models returned: ${data.models?.length || 0}`);
  console.log(`✓ Has more: ${data.has_more}`);
  
  if (data.models && data.models.length > 0) {
    console.log('\nSample model structure:');
    console.log(JSON.stringify(data.models[0], null, 2));
  }
  
  return data;
}

/**
 * Estimate FAL pricing
 */
async function estimatePricingRaw() {
  console.log('\n🔹 Estimating FAL pricing (raw API)...\n');
  
  const requestBody = {
    estimate_type: 'unit_price',
    endpoints: {
      'fal-ai/flux/dev': { unit_quantity: 10 }
    }
  };
  
  const response = await fetch('https://api.fal.ai/v1/models/pricing/estimate', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.FAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`✓ Response status: ${response.status}`);
  console.log('\nEstimate result:');
  console.log(JSON.stringify(data, null, 2));
  
  return data;
}

async function main() {
  console.log('📡 Direct API Usage Examples');
  console.log('============================\n');
  
  try {
    if (process.env.COMET_API_KEY) {
      await fetchCometModelsRaw();
    } else {
      console.log('⚠️  Skipping Comet examples (COMET_API_KEY not set)');
    }
    
    if (process.env.FAL_API_KEY) {
      await fetchFalModelsRaw();
      await estimatePricingRaw();
    } else {
      console.log('⚠️  Skipping FAL examples (FAL_API_KEY not set)');
    }
    
    console.log('\n✅ Direct API examples completed!\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
