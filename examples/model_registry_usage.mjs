#!/usr/bin/env node
/**
 * Example: Using the unified model registry
 * This demonstrates how to fetch and query models from both Comet and FAL APIs
 */

import { fetchAllModels, fetchCometModels, fetchFalModels } from '../apis/model_registry/index.js';
import { config } from 'dotenv';

config();

async function main() {
  console.log('🔍 Model Registry Example\n');
  
  // Example 1: Fetch all models
  console.log('Fetching all models...');
  const allModels = await fetchAllModels();
  console.log(`✓ Total models: ${allModels.length}`);
  
  // Group by source
  const bySource = allModels.reduce((acc, model) => {
    acc[model.source] = (acc[model.source] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\nModels by source:');
  Object.entries(bySource).forEach(([source, count]) => {
    console.log(`  ${source}: ${count}`);
  });
  
  // Example 2: Filter by category
  const textToImageModels = allModels.filter(m => 
    m.category === 'text-to-image'
  );
  console.log(`\nText-to-Image models: ${textToImageModels.length}`);
  
  if (textToImageModels.length > 0) {
    console.log('First 5 text-to-image models:');
    textToImageModels.slice(0, 5).forEach((model, idx) => {
      console.log(`  ${idx + 1}. ${model.id}`);
    });
  }
  
  // Example 3: Find specific provider
  const openaiModels = allModels.filter(m => 
    m.provider?.toLowerCase().includes('openai')
  );
  console.log(`\nOpenAI models: ${openaiModels.length}`);
  
  // Example 4: Search by model ID
  const searchTerm = 'gpt-4';
  const gptModels = allModels.filter(m => 
    m.id.toLowerCase().includes(searchTerm)
  );
  console.log(`\nModels matching "${searchTerm}": ${gptModels.length}`);
  
  if (gptModels.length > 0) {
    gptModels.slice(0, 3).forEach((model, idx) => {
      console.log(`  ${idx + 1}. ${model.id} (${model.source})`);
    });
  }
  
  console.log('\n✅ Model registry examples completed!');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
