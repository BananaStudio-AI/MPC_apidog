/* Simple smoke tests for MPC-API model brain.
   Uses global fetch available in Node 20+. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'http://localhost:3000';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.resolve(__dirname, '../model_catalog/model_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

const modelSet = new Set();
for (const entry of catalog) {
  modelSet.add(entry.canonical_id);
  modelSet.add(entry.provider_id);
  (entry.aliases || []).forEach((alias) => modelSet.add(alias));
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const testCases = [];

const addTest = (name, fn) => testCases.push({ name, fn });

addTest('select-model: chat/general/text', async () => {
  const res = await fetch(`${BASE_URL}/api/select-model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_type: 'chat', domain: 'general', modality: 'text' })
  });
  assert(res.ok, `Expected 200, got ${res.status}`);
  const body = await res.json();
  assert(body.selected_model, 'selected_model missing');
  assert(body.selected_model.canonical_id, 'canonical_id missing on selected_model');
  assert(Array.isArray(body.candidates) && body.candidates.length > 0, 'candidates must be non-empty array');
});

addTest('select-model: video_overlay/creative/video', async () => {
  const res = await fetch(`${BASE_URL}/api/select-model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_type: 'video_overlay', domain: 'creative', modality: 'video' })
  });
  assert(res.ok, `Expected 200, got ${res.status}`);
  const body = await res.json();
  assert(body.selected_model, 'selected_model missing');
  assert(body.selected_model.canonical_id, 'canonical_id missing on selected_model');
  assert(Array.isArray(body.candidates) && body.candidates.length > 0, 'candidates must be non-empty array');
});

const jobTypes = [
  'tariff_video_overlay',
  'campaign_video_overlay',
  'youtube_explainer_video',
  'tiktok_short_vertical',
  'brand_pack_assets',
  'storyboard_with_frames'
];

for (const jobType of jobTypes) {
  addTest(`orchestrate: ${jobType}`, async () => {
    const res = await fetch(`${BASE_URL}/api/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_type: jobType })
    });
    assert(res.ok, `Expected 200, got ${res.status}`);
    const body = await res.json();
    assert(body.plan && Array.isArray(body.plan.steps) && body.plan.steps.length > 0, 'plan.steps must be non-empty array');
    for (const step of body.plan.steps) {
      assert(typeof step.step === 'string' && step.step.length > 0, 'step.step must be string');
      assert(typeof step.model === 'string' && step.model.length > 0, 'step.model must be string');
      assert(modelSet.has(step.model), `model alias not found in catalog: ${step.model}`);
    }
  });
}

const run = async () => {
  let failures = 0;
  for (const { name, fn } of testCases) {
    try {
      await fn();
      console.log(`✅ ${name}`);
    } catch (err) {
      failures += 1;
      console.error(`❌ ${name}: ${err.message}`);
    }
  }
  if (failures > 0) {
    process.exit(1);
  }
};

run();
