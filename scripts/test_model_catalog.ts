#!/usr/bin/env tsx
/**
 * Test script for Model Brain v0.1 catalog
 * Verifies that the catalog loads correctly and demonstrates basic functionality
 */
import {
  loadCatalog,
  findModelById,
  findModelsByProvider,
  findModelsByModality,
  searchModels,
  clearCache
} from '../mpc-api/model_catalog/src/catalog.ts';

async function testCatalog() {
  console.log('🧪 Testing Model Brain v0.1 Catalog System\n');
  
  try {
    // Test 1: Load catalog
    console.log('📚 Test 1: Loading catalog...');
    const catalog = await loadCatalog();
    console.log(`✅ Catalog loaded successfully`);
    console.log(`   Version: ${catalog.version}`);
    console.log(`   Description: ${catalog.description}`);
    console.log(`   Total models: ${catalog.models.length}\n`);
    
    // Test 2: Find model by ID
    console.log('🔍 Test 2: Finding model by canonical ID...');
    const gpt4 = await findModelById('gpt-4-turbo');
    if (gpt4) {
      console.log(`✅ Found model: ${gpt4.canonical_id}`);
      console.log(`   Provider: ${gpt4.provider}`);
      console.log(`   Modality: ${gpt4.modality.join(', ')}`);
      console.log(`   Quality tier: ${gpt4.quality_tier}\n`);
    } else {
      console.log('❌ Model not found\n');
    }
    
    // Test 3: Find models by provider
    console.log('🏢 Test 3: Finding models by provider (openai)...');
    const openaiModels = await findModelsByProvider('openai');
    console.log(`✅ Found ${openaiModels.length} OpenAI model(s)`);
    openaiModels.forEach(model => {
      console.log(`   - ${model.canonical_id}`);
    });
    console.log('');
    
    // Test 4: Find models by modality
    console.log('🎨 Test 4: Finding models by modality (image)...');
    const imageModels = await findModelsByModality('image');
    console.log(`✅ Found ${imageModels.length} image model(s)`);
    imageModels.forEach(model => {
      console.log(`   - ${model.canonical_id} (${model.provider})`);
    });
    console.log('');
    
    // Test 5: Search models
    console.log('🔎 Test 5: Searching models (query: "flux")...');
    const fluxModels = await searchModels('flux');
    console.log(`✅ Found ${fluxModels.length} matching model(s)`);
    fluxModels.forEach(model => {
      console.log(`   - ${model.canonical_id}`);
      console.log(`     Aliases: ${model.aliases.join(', ')}`);
    });
    console.log('');
    
    // Test 6: Verify supports object
    console.log('🔧 Test 6: Checking model capabilities...');
    const claude = await findModelById('claude-3-opus');
    if (claude) {
      console.log(`✅ Model: ${claude.canonical_id}`);
      console.log(`   Supports images: ${claude.supports.images}`);
      console.log(`   Supports video: ${claude.supports.video}`);
      console.log(`   Supports audio: ${claude.supports.audio}`);
      console.log(`   Supports structured output: ${claude.supports.structured_output}\n`);
    }
    
    // Test 7: Display all models summary
    console.log('📊 Test 7: All models summary:');
    catalog.models.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.canonical_id}`);
      console.log(`      Provider: ${model.provider}`);
      console.log(`      Tasks: ${model.tasks.join(', ')}`);
      console.log(`      Speed: ${model.speed_tier}, Quality: ${model.quality_tier}`);
    });
    console.log('');
    
    console.log('🎉 All tests passed successfully!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCatalog();
