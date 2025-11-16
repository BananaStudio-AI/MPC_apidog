import { CometApiService, FalApiService, OpenAPI } from '../apis/api-hub-client';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Example: Query Comet API for LLM models
 */
async function exampleCometModels() {
  console.log('\n=== Comet API Example ===\n');
  
  // Configure OpenAPI client for Comet
  OpenAPI.BASE = 'https://api.cometapi.com/v1';
  OpenAPI.TOKEN = process.env.COMET_API_KEY;

  try {
    const response = await CometApiService.listCometModels();
    console.log(`✓ Found ${response.data?.length || 0} Comet models`);
    
    // Display first 5 models
    if (response.data && response.data.length > 0) {
      console.log('\nFirst 5 models:');
      response.data.slice(0, 5).forEach((model: any, idx: number) => {
        console.log(`  ${idx + 1}. ${model.id} (${model.owned_by || 'unknown'})`);
      });
    }
  } catch (error: any) {
    console.error(`✗ Error: ${error.message}`);
  }
}

/**
 * Example: Query FAL API for creative models
 */
async function exampleFalModels() {
  console.log('\n=== FAL API Example ===\n');
  
  // Configure OpenAPI client for FAL
  OpenAPI.BASE = 'https://api.fal.ai/v1';
  OpenAPI.TOKEN = process.env.FAL_API_KEY;

  try {
    const response = await FalApiService.listFalModels({
      limit: 10,
      category: 'text-to-image'
    });
    
    console.log(`✓ Found ${response.models?.length || 0} FAL models (text-to-image)`);
    
    if (response.models && response.models.length > 0) {
      console.log('\nText-to-Image models:');
      response.models.forEach((model: any, idx: number) => {
        console.log(`  ${idx + 1}. ${model.endpoint_id}`);
      });
    }
  } catch (error: any) {
    console.error(`✗ Error: ${error.message}`);
  }
}

/**
 * Example: Get FAL pricing information
 */
async function exampleFalPricing() {
  console.log('\n=== FAL Pricing Example ===\n');
  
  OpenAPI.BASE = 'https://api.fal.ai/v1';
  OpenAPI.TOKEN = process.env.FAL_API_KEY;

  try {
    const pricing = await FalApiService.getFalModelPricing();
    console.log(`✓ Retrieved pricing for ${Object.keys(pricing).length} models`);
    
    // Show pricing for a specific model
    const fluxModel = 'fal-ai/flux/dev';
    if (pricing[fluxModel]) {
      console.log(`\nPricing for ${fluxModel}:`);
      console.log(`  Unit price: $${pricing[fluxModel].unit_price}`);
    }
  } catch (error: any) {
    console.error(`✗ Error: ${error.message}`);
  }
}

/**
 * Example: Estimate cost for FAL model usage
 */
async function exampleCostEstimation() {
  console.log('\n=== Cost Estimation Example ===\n');
  
  OpenAPI.BASE = 'https://api.fal.ai/v1';
  OpenAPI.TOKEN = process.env.FAL_API_KEY;

  try {
    const estimate = await FalApiService.estimateFalModelCost({
      estimate_type: 'unit_price',
      endpoints: {
        'fal-ai/flux/dev': { unit_quantity: 100 },
        'fal-ai/flux-pro': { unit_quantity: 50 }
      }
    });
    
    console.log('✓ Cost estimation completed:');
    console.log(JSON.stringify(estimate, null, 2));
  } catch (error: any) {
    console.error(`✗ Error: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('BananaStudio API Hub - TypeScript Client Examples');
  console.log('================================================\n');
  
  // Check required environment variables
  if (!process.env.COMET_API_KEY) {
    console.error('⚠️  Warning: COMET_API_KEY not set. Skipping Comet examples.');
  } else {
    await exampleCometModels();
  }
  
  if (!process.env.FAL_API_KEY) {
    console.error('⚠️  Warning: FAL_API_KEY not set. Skipping FAL examples.');
  } else {
    await exampleFalModels();
    await exampleFalPricing();
    await exampleCostEstimation();
  }
  
  console.log('\n✅ Examples completed!\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
