#!/usr/bin/env node
/**
 * Normalize the API HUB OpenAPI spec per project rules.
 * - Reads: openapi/api-hub.raw.oas.json
 * - Writes: openapi/api-hub.oas.json
 *
 * Rules:
 * - Top-level servers include Comet and FAL servers
 * - COMET_API operations:
 *   - Path: /models (no vendor prefix)
 *   - Tag: COMET_API
 *   - Operation-level server: Comet server
 * - FAL_API operations:
 *   - Paths:
 *     - GET /models/pricing
 *   - Tag: FAL_API
 *   - Operation-level server: FAL server
 * - Preserve components, info, security, webhooks
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const RAW_PATH = path.join(ROOT, 'openapi', 'api-hub.raw.oas.json');
const OUT_PATH = path.join(ROOT, 'openapi', 'api-hub.oas.json');

const COMET_SERVER = {
  url: 'https://api.cometapi.com/v1',
  description: 'Comet API'
};

const FAL_SERVER = {
  url: 'https://api.fal.ai/v1',
  description: 'FAL Platform API'
};

function deepClone(obj) {
  return obj == null ? obj : JSON.parse(JSON.stringify(obj));
}

function tagAndAttachServer(operation, tag, server) {
  const op = deepClone(operation) || {};
  const tags = Array.isArray(op.tags) ? op.tags.slice() : [];
  if (!tags.includes(tag)) tags.unshift(tag);
  op.tags = tags;
  op.servers = [server];
  return op;
}

async function normalize() {
  const rawTxt = await fs.readFile(RAW_PATH, 'utf8');
  const raw = JSON.parse(rawTxt);

  const normalized = {
    openapi: raw.openapi || '3.1.0',
    info: deepClone(raw.info) || { title: 'API Hub', version: '1.0.0' },
    servers: [COMET_SERVER, FAL_SERVER],
    paths: {},
    webhooks: deepClone(raw.webhooks) || {},
    components: deepClone(raw.components) || {},
    security: Array.isArray(raw.security) ? deepClone(raw.security) : []
  };

  const paths = raw.paths || {};
  for (const [p, item] of Object.entries(paths)) {
    const pathItem = deepClone(item) || {};

    for (const method of Object.keys(pathItem)) {
      const lower = method.toLowerCase();
      if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(lower)) continue;

      const op = pathItem[method];
      const summary = (op && op.summary) ? String(op.summary) : '';

      // Map to normalized path + tag based on simple heuristics from current spec
      let newPath = null;
      let tag = null;
      let server = null;

      // Pricing endpoint (currently at "/" in raw spec)
      if (summary.toLowerCase().includes('pricing') || p === '/') {
        newPath = '/models/pricing';
        tag = 'FAL_API';
        server = FAL_SERVER;
      }
      // Model listing/search (currently "/models" in raw spec)
      else if (p === '/models' && lower === 'get') {
        newPath = '/models';
        tag = 'COMET_API';
        server = COMET_SERVER;
      }
      // If anything else appears in the future, pass through unchanged with no tag/server change
      else {
        newPath = p;
        tag = null;
        server = null;
      }

      const outOp = tag ? tagAndAttachServer(op, tag, server) : op;

      if (!normalized.paths[newPath]) normalized.paths[newPath] = {};
      // Guard against duplicate method collision
      if (normalized.paths[newPath][lower]) {
        // If collision, suffix path with provider tag to avoid overwrite
        const suffixed = `${newPath}#${tag || 'UNSPEC'}`;
        if (!normalized.paths[suffixed]) normalized.paths[suffixed] = {};
        normalized.paths[suffixed][lower] = outOp;
      } else {
        normalized.paths[newPath][lower] = outOp;
      }
    }
  }

  // Ensure components exist even if raw had $refs only
  normalized.components = normalized.components || {};

  await fs.writeFile(OUT_PATH, JSON.stringify(normalized, null, 2));
  console.log(`✓ Wrote normalized spec: ${path.relative(ROOT, OUT_PATH)}`);
}

normalize().catch(err => {
  console.error('Normalization failed:', err?.message || err);
  process.exit(1);
});
