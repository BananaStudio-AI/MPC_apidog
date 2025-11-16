#!/usr/bin/env tsx
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ApiClient } from '../apis/client/index.js';

function loadDotEnv() {
  try {
    const root = process.cwd();
    const full = readFileSync(path.join(root, '.env'), 'utf8');
    for (const line of full.split(/\r?\n/)) {
      const s = line.trim();
      if (!s || s.startsWith('#')) continue;
      const eq = s.indexOf('=');
      if (eq < 0) continue;
      const key = s.slice(0, eq).trim();
      let val = s.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (err) {
    // ignore
  }
}

async function main() {
  loadDotEnv();
  const client = new ApiClient({ apiKey: process.env.FAL_API_KEY });

  const payload = {
    estimate_type: 'unit_price',
    endpoints: {
      'fal-ai/flux/dev': { unit_quantity: 1 },
      'fal-ai/flux-pro': { unit_quantity: 2 }
    }
  };

  console.log('Requesting estimate with payload:', payload);
  const resp = await client.estimateModelsPricing(payload);
  console.log('Result:', resp);
}

main().catch(err => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
