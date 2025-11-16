#!/usr/bin/env tsx
/**
 * Comprehensive Example: Using BananaStudio API Hub
 * 
 * This example demonstrates:
 * - Querying both Comet (LLM) and FAL (Creative AI) APIs
 * - Using the auto-generated TypeScript client
 * - Proper error handling and validation
 * - TypeScript best practices with type safety
 * - Working with the unified model registry
 * 
 * Prerequisites:
 * - Set COMET_API_KEY in .env
 * - Set FAL_API_KEY in .env
 * - Run: npm install
 * 
 * Usage:
 *   tsx examples/api-hub-comprehensive.ts
 *   npm run sync:model-registry  # To sync registry first
 */

import { fetchAllModels, fetchCometModels, fetchFalModels } from '../apis/model_registry/index.js';
import type { UnifiedModelRecord } from '../apis/model_registry/types.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get current file path (for ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
interface Config {
  cometApiKey: string;
  falApiKey: string;
}

/**
 * Validate required environment variables
 */
function validateEnvironment(): Config {
  const cometApiKey = process.env.COMET_API_KEY;
  const falApiKey = process.env.FAL_API_KEY;

  if (!cometApiKey) {
    throw new Error(
      'COMET_API_KEY is required. Add it to your .env file.\n' +
      'Get your key from: https://cometapi.com'
    );
  }

  if (!falApiKey) {
    throw new Error(
      'FAL_API_KEY is required. Add it to your .env file.\n' +
      'Get your key from: https://fal.ai'
    );
  }

  return { cometApiKey, falApiKey };
}

/**
 * Example 1: Query Comet API for LLMs
 */
async function exampleCometAPI() {
  console.log('\n📚 Example 1: Querying Comet API (LLMs)\n');
  console.log('=' .repeat(60));

  try {
    const models = await fetchCometModels();
    
    if (models.length === 0) {
      console.warn('⚠️  No models returned from Comet API');
      return;
    }

    console.log(`✓ Found ${models.length} LLM models from Comet API\n`);

    // Display first 5 models
    console.log('Sample models:');
    models.slice(0, 5).forEach((model, idx) => {
      console.log(`  ${idx + 1}. ${model.name}`);
      console.log(`     ID: ${model.id}`);
      console.log(`     Provider: ${model.provider || 'N/A'}`);
      if (model.description) {
        const desc = model.description.length > 80 
          ? model.description.slice(0, 77) + '...'
          : model.description;
        console.log(`     Description: ${desc}`);
      }
      console.log('');
    });

    // Statistics
    const byProvider = models.reduce((acc, m) => {
      const provider = m.provider || 'Unknown';
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Models by provider:');
    Object.entries(byProvider)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([provider, count]) => {
        console.log(`  - ${provider}: ${count} models`);
      });

  } catch (error) {
    console.error('❌ Error querying Comet API:', error);
    throw error;
  }
}

/**
 * Example 2: Query FAL API for Creative Models
 */
async function exampleFALAPI() {
  console.log('\n\n🎨 Example 2: Querying FAL API (Creative Models)\n');
  console.log('=' .repeat(60));

  try {
    const models = await fetchFalModels();
    
    if (models.length === 0) {
      console.warn('⚠️  No models returned from FAL API');
      return;
    }

    console.log(`✓ Found ${models.length} creative models from FAL API\n`);

    // Display first 5 models
    console.log('Sample models:');
    models.slice(0, 5).forEach((model, idx) => {
      console.log(`  ${idx + 1}. ${model.name}`);
      console.log(`     ID: ${model.id}`);
      if (model.description) {
        const desc = model.description.length > 80 
          ? model.description.slice(0, 77) + '...'
          : model.description;
        console.log(`     Description: ${desc}`);
      }
      console.log('');
    });

    // Statistics by category
    const byCategory = models.reduce((acc, m) => {
      const category = (m as any).category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(byCategory).length > 0) {
      console.log('Models by category:');
      Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([category, count]) => {
          console.log(`  - ${category}: ${count} models`);
        });
    }

  } catch (error) {
    console.error('❌ Error querying FAL API:', error);
    throw error;
  }
}

/**
 * Example 3: Using the Unified Model Registry
 */
async function exampleUnifiedRegistry() {
  console.log('\n\n🔗 Example 3: Unified Model Registry\n');
  console.log('=' .repeat(60));

  try {
    const allModels = await fetchAllModels();
    
    if (allModels.length === 0) {
      console.warn('⚠️  No models in unified registry');
      return;
    }

    console.log(`✓ Total models in unified registry: ${allModels.length}\n`);

    // Count by source
    const bySource = allModels.reduce((acc, m) => {
      acc[m.source] = (acc[m.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Models by source:');
    Object.entries(bySource).forEach(([source, count]) => {
      const percentage = ((count / allModels.length) * 100).toFixed(1);
      console.log(`  - ${source.toUpperCase()}: ${count} models (${percentage}%)`);
    });

    // Search functionality example
    console.log('\n🔍 Example: Searching for specific models');
    const searchTerm = 'gpt';
    const searchResults = allModels.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(`\nFound ${searchResults.length} models matching "${searchTerm}":`);
    searchResults.slice(0, 3).forEach((model, idx) => {
      console.log(`  ${idx + 1}. ${model.name} (${model.source})`);
      console.log(`     ID: ${model.id}`);
    });

  } catch (error) {
    console.error('❌ Error with unified registry:', error);
    throw error;
  }
}

/**
 * Example 4: Working with FAL Pricing API
 */
async function exampleFALPricing() {
  console.log('\n\n💰 Example 4: FAL Pricing API\n');
  console.log('=' .repeat(60));

  try {
    const falApiKey = process.env.FAL_API_KEY;
    if (!falApiKey) {
      console.warn('⚠️  FAL_API_KEY not set, skipping pricing example');
      return;
    }

    // Query pricing information
    const response = await fetch('https://api.fal.ai/v1/models/pricing', {
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const pricingData = await response.json();
    
    console.log(`✓ Retrieved pricing for ${pricingData.prices?.length || 0} models\n`);

    // Display sample pricing
    if (pricingData.prices && pricingData.prices.length > 0) {
      console.log('Sample pricing:');
      pricingData.prices.slice(0, 5).forEach((price: any, idx: number) => {
        console.log(`  ${idx + 1}. ${price.endpoint_id}`);
        console.log(`     Cost: ${price.unit_price} ${price.currency} per ${price.unit}`);
      });
    }

    // Estimate cost for a specific model
    console.log('\n💵 Example: Estimating cost for fal-ai/flux/dev');
    
    const estimateResponse = await fetch('https://api.fal.ai/v1/models/pricing/estimate', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estimate_type: 'unit_price',
        endpoints: {
          'fal-ai/flux/dev': { unit_quantity: 1 }
        }
      })
    });

    if (estimateResponse.ok) {
      const estimate = await estimateResponse.json();
      console.log('✓ Cost estimate retrieved successfully');
      console.log(`  Estimated cost: ${JSON.stringify(estimate, null, 2)}`);
    }

  } catch (error) {
    console.error('❌ Error with FAL pricing API:', error);
    // Don't throw - this is optional functionality
  }
}

/**
 * Example 5: Saving Registry to File
 */
async function exampleSaveRegistry() {
  console.log('\n\n💾 Example 5: Saving Registry to File\n');
  console.log('=' .repeat(60));

  try {
    const allModels = await fetchAllModels();
    
    // Save to data directory
    const outputPath = path.join(__dirname, '../data/model_registry.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(allModels, null, 2));

    console.log(`✓ Saved ${allModels.length} models to: ${outputPath}`);

    // Also save a summary
    const summary = {
      totalModels: allModels.length,
      bySource: allModels.reduce((acc, m) => {
        acc[m.source] = (acc[m.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastUpdated: new Date().toISOString()
    };

    const summaryPath = path.join(__dirname, '../data/registry_summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`✓ Saved summary to: ${summaryPath}`);
    console.log(`\nSummary:`, summary);

  } catch (error) {
    console.error('❌ Error saving registry:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     BananaStudio API Hub - Comprehensive Example         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  try {
    // Validate environment
    console.log('\n🔐 Validating environment...');
    const config = validateEnvironment();
    console.log('✓ Environment validated successfully');

    // Run all examples
    await exampleCometAPI();
    await exampleFALAPI();
    await exampleUnifiedRegistry();
    await exampleFALPricing();
    await exampleSaveRegistry();

    // Success summary
    console.log('\n\n' + '=' .repeat(60));
    console.log('✅ All examples completed successfully!');
    console.log('=' .repeat(60));
    console.log('\n📖 Next steps:');
    console.log('  - Explore the unified model registry in data/model_registry.json');
    console.log('  - Review the TypeScript client in apis/api-hub-client/');
    console.log('  - Read the documentation in docs/');
    console.log('  - Check out other examples in examples/');
    console.log('\n💡 Tip: Run "npm run health:api-hub" to validate API connectivity\n');

  } catch (error) {
    console.error('\n❌ Example failed:', error instanceof Error ? error.message : error);
    console.error('\n🔧 Troubleshooting:');
    console.error('  1. Ensure .env file exists with valid API keys');
    console.error('  2. Run: cp .env.example .env');
    console.error('  3. Add your COMET_API_KEY and FAL_API_KEY');
    console.error('  4. Run: npm run health:api-hub to validate\n');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for use as a module
export {
  exampleCometAPI,
  exampleFALAPI,
  exampleUnifiedRegistry,
  exampleFALPricing,
  exampleSaveRegistry
};
