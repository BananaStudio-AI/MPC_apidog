#!/usr/bin/env tsx
/**
 * FAL Pricing Estimate Helper
 *
 * Calls POST https://api.fal.ai/v1/models/pricing/estimate with your FAL API key.
 *
 * Usage examples:
 *   npm run fal:estimate                          # uses default sample endpoints
 *   tsx scripts/fal_pricing_estimate.ts \
 *     --estimate-type unit_price \
 *     --endpoint fal-ai/flux/dev=50 \
 *     --endpoint fal-ai/flux-pro=25
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

function parseDotEnv(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

async function maybeLoadDotEnv() {
  if (process.env.FAL_API_KEY) return;
  try {
    const txt = await readFile(path.join(ROOT, '.env'), 'utf8');
    const env = parseDotEnv(txt);
    for (const [k, v] of Object.entries(env)) {
      if (process.env[k] == null) process.env[k] = v;
    }
  } catch {
    // ignore
  }
}

function parseArgs(argv: string[]) {
  const args = { estimateType: 'unit_price', endpoints: [] as Array<{ id: string; qty: number }> };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--estimate-type' && argv[i + 1]) {
      args.estimateType = argv[++i];
      continue;
    }
    if (a === '--endpoint' && argv[i + 1]) {
      const val = argv[++i];
      const [id, qtyStr] = val.split('=');
      const qty = Number(qtyStr);
      if (!id || !Number.isFinite(qty)) {
        console.error(`Invalid --endpoint value: ${val}. Use format endpoint_id=quantity`);
        process.exit(1);
      }
      args.endpoints.push({ id, qty });
      continue;
    }
  }
  // Defaults if no endpoints supplied
  if (args.endpoints.length === 0) {
    args.endpoints.push({ id: 'fal-ai/flux/dev', qty: 50 });
    args.endpoints.push({ id: 'fal-ai/flux-pro', qty: 25 });
  }
  return args;
}

async function main() {
  await maybeLoadDotEnv();

  const FAL_API_KEY = process.env.FAL_API_KEY;
  if (!FAL_API_KEY) {
    console.error('Missing FAL_API_KEY in environment. Add it to .env');
    process.exit(1);
  }

  const { estimateType, endpoints } = parseArgs(process.argv.slice(2));
  const payload: any = { estimate_type: estimateType, endpoints: {} as Record<string, { unit_quantity: number }> };
  for (const e of endpoints) payload.endpoints[e.id] = { unit_quantity: e.qty };

  const url = 'https://api.fal.ai/v1/models/pricing/estimate';
  console.log(`\nPOST ${url}`);
  console.log('Payload:', JSON.stringify(payload));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    console.log('\nResponse JSON:', JSON.stringify(json, null, 2));
  } catch {
    console.log('\nResponse Text:', text);
  }
  console.log(`\nStatus: ${res.status}`);
}

main().catch((err) => {
  console.error('Error:', err?.message || String(err));
  process.exit(1);
});
