/**
 * Example: Using the generated API client
 * 
 * This demonstrates how to use the auto-generated TypeScript client
 * to interact with the FAL API endpoints.
 */

import { ApiClient } from '../apis/client/index.js';

async function main() {
  // Initialize the client with your API key
  const client = new ApiClient({
    baseUrl: 'https://api.fal.ai/v1/models/pricing',
    apiKey: process.env.FAL_API_KEY || 'your-api-key-here'
  });

  try {
    console.log('Fetching models pricing...\n');
    
    // Get pricing information for all models
    const pricing = await client.getModelsPricing();
    
    console.log(`Found ${pricing.prices.length} model prices:`);
    console.log(`Has more pages: ${pricing.has_more}`);
    console.log(`Next cursor: ${pricing.next_cursor || 'null'}\n`);
    
    // Display first few prices
    pricing.prices.slice(0, 3).forEach(price => {
      console.log(`- ${price.endpoint_id}`);
      console.log(`  Price: ${price.unit_price} ${price.currency} per ${price.unit}`);
    });

    console.log('\n---\n');
    console.log('Searching models...\n');
    
    // Search for available models
    const models = await client.getModelsSearch();
    
    console.log(`Found ${models.models.length} models:`);
    
    // Display model information
    models.models.slice(0, 2).forEach(model => {
      console.log(`\n- ${model.metadata.display_name}`);
      console.log(`  ID: ${model.endpoint_id}`);
      console.log(`  Category: ${model.metadata.category}`);
      console.log(`  Description: ${model.metadata.description}`);
      console.log(`  Status: ${model.metadata.status}`);
      console.log(`  Tags: ${model.metadata.tags.join(', ')}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
