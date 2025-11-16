#!/usr/bin/env tsx
/** Example: Sync models from Comet and FAL and normalize into a unified model catalog. */
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { CometApiService, FalApiService, OpenAPI } from '../apis/api-hub-client/index.js';

const OUTPUT = path.join(process.cwd(), 'openapi', 'model_catalog.json');

async function fetchComet() {
  OpenAPI.BASE = 'https://api.cometapi.com/v1';
  OpenAPI.TOKEN = process.env.COMET_API_KEY;
  try {
    const res = await CometApiService.listCometModels();
    return res.data || [];
  } catch (e) {
    console.error('Failed to fetch Comet models:', (e as Error)?.message || e);
    return [];
  }
}

async function fetchFal() {
  OpenAPI.BASE = 'https://api.fal.ai/v1';
  OpenAPI.TOKEN = process.env.FAL_API_KEY;
  try {
    const res = await FalApiService.listFalModels();
    return res.models || [];
  } catch (e) {
    console.error('Failed to fetch FAL models:', (e as Error)?.message || e);
    return [];
  }
}

function unifyFalModel(m: any) {
  return {
    source: 'fal',
    id: m.endpoint_id,
    provider: m.endpoint_id?.split('/')?.[0] || null,
    category: m.metadata?.category || null,
    raw: m
  };
}

function unifyCometModel(m: any) {
  return {
    source: 'comet',
    id: m.id || m.endpoint_id || m.name,
    provider: m.owned_by || null,
    category: m.root || null,
    raw: m
  };
}

async function main() {
  if (!process.env.COMET_API_KEY) console.warn('COMET_API_KEY not set, Comet calls will fail.');
  if (!process.env.FAL_API_KEY) console.warn('FAL_API_KEY not set, FAL calls will fail.');

  const [fal, comet] = await Promise.all([fetchFal(), fetchComet()]);
  const falRecords = fal.map(unifyFalModel);
  const cometRecords = comet.map(unifyCometModel);

  const all = [...falRecords, ...cometRecords];
  const uniqueMap = new Map();
  for (const r of all) uniqueMap.set(r.id, r);
  const unique = Array.from(uniqueMap.values());

  const out = {
    generated_at: new Date().toISOString(),
    total_models: unique.length,
    sources: {
      comet: cometRecords.length,
      fal: falRecords.length
    },
    models: unique
  };

  await fs.writeFile(OUTPUT, JSON.stringify(out, null, 2), 'utf8');
  console.log('Saved model catalog to:', OUTPUT);
}

main().catch(err => { console.error(err); process.exit(1); });
