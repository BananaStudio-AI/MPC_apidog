#!/usr/bin/env tsx
/**
 * Sync Model Catalog
 * 
 * Fetches models from both Comet and FAL APIs, normalizes them into
 * a unified format, and saves to /openapi/model_catalog.json.
 * 
 * Usage:
 *   npm run sync:model-catalog
 * 
 * Environment variables required:
 *   - FAL_API_KEY: API key for FAL platform
 *   - COMET_API_KEY: API key for Comet models (if different)
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApiClient, ModelSearchResponse, ModelsPricingResponse } from '../apis/client/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT, 'openapi', 'model_catalog.json');

// Unified model interface
interface UnifiedModel {
  source: 'comet' | 'fal';
  id: string;
  provider: string | null;
  category: string | null;
  raw: any;
}

interface ModelCatalog {
  generated_at: string;
  total_models: number;
  sources: {
    comet: number;
    fal: number;
  };
  models: UnifiedModel[];
}

/**
 * Fetch models from FAL API
 */
async function fetchFalModels(): Promise<UnifiedModel[]> {
  console.log('Fetching models from FAL API...');
  
  const client = new ApiClient({
    baseUrl: 'https://api.fal.ai/v1/models',
    apiKey: process.env.FAL_API_KEY
  });

  try {
    const response = await client.getModelsSearch();
    
    console.log(`✓ Fetched ${response.models.length} FAL models`);
    
    return response.models.map(model => ({
      source: 'fal' as const,
      id: model.endpoint_id,
      provider: extractProvider(model.endpoint_id),
      category: model.metadata.category || null,
      raw: model
    }));
  } catch (error: any) {
    console.error(`✗ Failed to fetch FAL models: ${error.message}`);
    return [];
  }
}

/**
 * Fetch models from Comet API (pricing endpoint as proxy)
 */
async function fetchCometModels(): Promise<UnifiedModel[]> {
  console.log('Fetching models from Comet API...');
  
  const client = new ApiClient({
    baseUrl: 'https://api.fal.ai/v1/models/pricing',
    apiKey: process.env.COMET_API_KEY || process.env.FAL_API_KEY
  });

  try {
    const response = await client.getModelsPricing();
    
    console.log(`✓ Fetched ${response.prices.length} Comet model prices`);
    
    // Convert pricing data to unified model format
    return response.prices.map(price => ({
      source: 'comet' as const,
      id: price.endpoint_id,
      provider: extractProvider(price.endpoint_id),
      category: inferCategoryFromId(price.endpoint_id),
      raw: price
    }));
  } catch (error: any) {
    console.error(`✗ Failed to fetch Comet models: ${error.message}`);
    return [];
  }
}

/**
 * Extract provider from endpoint ID
 * e.g., "fal-ai/flux/dev" -> "fal-ai"
 */
function extractProvider(endpointId: string): string | null {
  const parts = endpointId.split('/');
  return parts.length > 1 ? parts[0] : null;
}

/**
 * Infer category from endpoint ID when not available
 */
function inferCategoryFromId(endpointId: string): string | null {
  const id = endpointId.toLowerCase();
  
  if (id.includes('text-to-image') || id.includes('flux') || id.includes('stable-diffusion')) {
    return 'text-to-image';
  }
  if (id.includes('image-to-video') || id.includes('video')) {
    return 'video';
  }
  if (id.includes('text-to-video')) {
    return 'text-to-video';
  }
  if (id.includes('upscale') || id.includes('enhance')) {
    return 'enhancement';
  }
  if (id.includes('audio') || id.includes('speech') || id.includes('tts')) {
    return 'audio';
  }
  
  return null;
}

/**
 * Deduplicate models by ID, preferring FAL source when duplicates exist
 */
function deduplicateModels(models: UnifiedModel[]): UnifiedModel[] {
  const modelMap = new Map<string, UnifiedModel>();
  
  for (const model of models) {
    const existing = modelMap.get(model.id);
    
    // Prefer FAL source over Comet when duplicate IDs exist
    if (!existing || (existing.source === 'comet' && model.source === 'fal')) {
      modelMap.set(model.id, model);
    }
  }
  
  return Array.from(modelMap.values());
}

/**
 * Save catalog to JSON file
 */
async function saveCatalog(catalog: ModelCatalog): Promise<void> {
  const json = JSON.stringify(catalog, null, 2);
  await fs.writeFile(OUTPUT_FILE, json, 'utf8');
  console.log(`\n✓ Saved model catalog to: ${OUTPUT_FILE}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting model catalog sync...\n');
  
  // Check for API keys
  if (!process.env.FAL_API_KEY) {
    console.error('✗ Missing FAL_API_KEY environment variable');
    console.error('Set it in .env or export it before running this script');
    process.exit(1);
  }

  // Fetch from both sources in parallel
  const [falModels, cometModels] = await Promise.all([
    fetchFalModels(),
    fetchCometModels()
  ]);

  // Combine and deduplicate
  const allModels = [...falModels, ...cometModels];
  const uniqueModels = deduplicateModels(allModels);
  
  // Sort by source, then by ID
  uniqueModels.sort((a, b) => {
    if (a.source !== b.source) {
      return a.source === 'fal' ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  });

  // Build catalog
  const catalog: ModelCatalog = {
    generated_at: new Date().toISOString(),
    total_models: uniqueModels.length,
    sources: {
      comet: uniqueModels.filter(m => m.source === 'comet').length,
      fal: uniqueModels.filter(m => m.source === 'fal').length
    },
    models: uniqueModels
  };

  // Save to file
  await saveCatalog(catalog);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Total unique models: ${catalog.total_models}`);
  console.log(`   FAL models: ${catalog.sources.fal}`);
  console.log(`   Comet models: ${catalog.sources.comet}`);
  
  // Category breakdown
  const categories = uniqueModels.reduce((acc, model) => {
    const cat = model.category || 'unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📁 Categories:');
  Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

  console.log('\n✅ Model catalog sync complete!');
}

// Run if executed directly
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
