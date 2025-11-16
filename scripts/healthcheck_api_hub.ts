#!/usr/bin/env ts-node
/**
 * Production health-check for BananaStudio API HUB
 * Validates connectivity and data integrity for COMET_API and FAL_API
 */
import ApiClient from '../apis/api-hub-client';
import { fetchCometModels, fetchFalModels, fetchAllModels } from '../apis/model_registry';

interface HealthCheckResult {
  service: string;
  status: 'ok' | 'warn' | 'fail';
  message: string;
  count?: number;
}

const results: HealthCheckResult[] = [];

function log(result: HealthCheckResult) {
  results.push(result);
  const icon = result.status === 'ok' ? '✓' : result.status === 'warn' ? '⚠' : '✗';
  console.log(`${icon} ${result.service}: ${result.message}`);
}

async function checkCometModels(): Promise<number> {
  try {
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
    const count = Array.isArray(data.data) ? data.data.length : 0;
    
    if (count === 0) {
      log({ service: 'COMET_API GET /models', status: 'warn', message: 'Returned empty array', count });
    } else {
      log({ service: 'COMET_API GET /models', status: 'ok', message: `${count} models found`, count });
    }
    return count;
  } catch (err: any) {
    log({ service: 'COMET_API GET /models', status: 'fail', message: err.message || String(err) });
    return -1;
  }
}

async function checkFalModels(): Promise<number> {
  // FAL doesn't have a public models list endpoint
  // Using hardcoded count from registry
  try {
    const falModels = await fetchFalModels();
    const count = falModels.length;
    
    if (count === 0) {
      log({ service: 'FAL_API models (curated)', status: 'warn', message: 'No models in curated list', count });
    } else {
      log({ service: 'FAL_API models (curated)', status: 'ok', message: `${count} models in registry`, count });
    }
    return count;
  } catch (err: any) {
    log({ service: 'FAL_API models (curated)', status: 'fail', message: err.message || String(err) });
    return -1;
  }
}

async function checkFalPricing(): Promise<boolean> {
  try {
    const response = await fetch('https://api.fal.ai/v1/models/pricing/estimate', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        estimate_type: 'unit_price',
        endpoints: {
          'fal-ai/flux/dev': { unit_quantity: 1 }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    log({ service: 'FAL_API POST /pricing/estimate', status: 'ok', message: 'HTTP 200' });
    return true;
  } catch (err: any) {
    log({ service: 'FAL_API POST /pricing/estimate', status: 'fail', message: err.message || String(err) });
    return false;
  }
}

async function checkUnifiedRegistry(): Promise<number> {
  try {
    const allModels = await fetchAllModels();
    const cometCount = allModels.filter(m => m.source === 'comet').length;
    const falCount = allModels.filter(m => m.source === 'fal').length;
    const total = allModels.length;
    
    if (total === 0) {
      log({ service: 'Unified Registry', status: 'warn', message: 'No models in registry', count: 0 });
    } else {
      log({ 
        service: 'Unified Registry', 
        status: 'ok', 
        message: `${total} total (comet: ${cometCount}, fal: ${falCount})`,
        count: total 
      });
    }
    return total;
  } catch (err: any) {
    log({ service: 'Unified Registry', status: 'fail', message: err.message || String(err) });
    return -1;
  }
}

async function main() {
  console.log('🏥 BananaStudio API HUB Health Check\n');
  
  // Validate environment
  if (!process.env.COMET_API_KEY) {
    console.error('✗ Missing COMET_API_KEY in environment');
    process.exit(1);
  }
  if (!process.env.FAL_API_KEY) {
    console.error('✗ Missing FAL_API_KEY in environment');
    process.exit(1);
  }
  
  // Run checks
  const [cometCount, falCount, pricingOk, registryTotal] = await Promise.all([
    checkCometModels(),
    checkFalModels(),
    checkFalPricing(),
    checkUnifiedRegistry()
  ]);
  
  console.log('\n📊 Summary:');
  console.log(`   COMET models: ${cometCount >= 0 ? cometCount : 'ERROR'}`);
  console.log(`   FAL models: ${falCount >= 0 ? falCount : 'ERROR'}`);
  console.log(`   Registry total: ${registryTotal >= 0 ? registryTotal : 'ERROR'}`);
  
  const failures = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warn').length;
  
  console.log(`\n   Status: ${failures} failures, ${warnings} warnings`);
  
  if (failures > 0) {
    console.error('\n❌ Health check FAILED');
    process.exit(1);
  } else if (warnings > 0) {
    console.warn('\n⚠️  Health check passed with warnings');
    process.exit(0);
  } else {
    console.log('\n✅ Health check PASSED');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal error during health check:', err.message || String(err));
  process.exit(1);
});
