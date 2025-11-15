#!/usr/bin/env node
/**
 * Push endpoints via OpenAI Agents + Hosted MCP connector for Apidog.
 *
 * Behavior:
 * - Reads local JSON specs from apidog/api_specs/
 * - Fetches remote endpoints and indexes by id, name, and method+path
 * - Shows a change summary; applies updates only with --force
 * - If an endpoint does not exist remotely and create is allowed, will create it when --force is used
 *
 * Prerequisites:
 * - OPENAI_API_KEY set in your environment
 * - An OpenAI Agents MCP connector configured for Apidog with:
 *   - serverLabel: "BananaStudio API Hub"
 *   - connectorId: "connector_apidog"
 *   - allowed tools include: listModules, listEndpoints, getEndpoint, updateEndpoint, createEndpoint
 */
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';

async function getAgents() {
  try {
    const mod = await import('@openai/agents');
    return mod;
  } catch (e) {
    console.error('Missing @openai/agents. Install with:\n  npm i -S @openai/agents');
    process.exit(1);
  }
}

function stableStringify(obj) {
  const seen = new WeakSet();
  const sorter = (key, value) => {
    if (value && typeof value === 'object') {
      if (seen.has(value)) return; // avoid cycles
      seen.add(value);
      if (!Array.isArray(value)) {
        return Object.keys(value)
          .sort()
          .reduce((acc, k) => {
            acc[k] = value[k];
            return acc;
          }, {});
      }
    }
    return value;
  };
  return JSON.stringify(JSON.parse(JSON.stringify(obj, sorter)), null, 2);
}

function isEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}

function sanitize(name) {
  return String(name || 'endpoint').replace(/[^a-z0-9-_\.]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 120) || 'endpoint';
}

async function readLocalSpecs(dir) {
  const out = new Map();
  if (!fssync.existsSync(dir)) return out;
  const files = await fs.readdir(dir);
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const p = path.join(dir, f);
    try {
      const raw = await fs.readFile(p, 'utf8');
      const spec = JSON.parse(raw);
      const id = spec.id || spec.endpointId || sanitize(f.replace(/\.json$/, ''));
      out.set(id, { id, file: p, spec });
    } catch (e) {
      console.warn(`Skipping invalid JSON: ${f}`);
    }
  }
  return out;
}

async function buildRemoteIndex(runner, tool, { listOnly = false } = {}) {
  const index = {
    byId: new Map(),
    byName: new Map(),
    byMethodPath: new Map(),
    rawList: [],
  };
  const modules = await runner.callTool(tool, 'listModules', {});
  const mods = Array.isArray(modules?.modules) ? modules.modules : [];
  for (const mod of mods) {
    const endpoints = await runner.callTool(tool, 'listEndpoints', { moduleId: mod.id });
    const list = Array.isArray(endpoints?.endpoints) ? endpoints.endpoints : [];
    for (const ep of list) {
      let detail = ep;
      if (!listOnly) {
        try {
          detail = await runner.callTool(tool, 'getEndpoint', { endpointId: ep.id });
        } catch {}
      }
      index.rawList.push(detail);
      const id = detail.id || ep.id;
      if (id) index.byId.set(id, detail);
      const name = detail.name || ep.name;
      if (name) index.byName.set(name, detail);
      const method = (detail.method || ep.method || '').toUpperCase();
      const p = detail.path || ep.path;
      if (method && p) index.byMethodPath.set(`${method} ${p}`, detail);
    }
  }
  return index;
}

function findRemoteMatch(local, remoteIndex) {
  if (local.spec?.id && remoteIndex.byId.has(local.spec.id)) return remoteIndex.byId.get(local.spec.id);
  if (local.spec?.name && remoteIndex.byName.has(local.spec.name)) return remoteIndex.byName.get(local.spec.name);
  const method = (local.spec?.method || '').toUpperCase();
  const p = local.spec?.path;
  if (method && p && remoteIndex.byMethodPath.has(`${method} ${p}`)) return remoteIndex.byMethodPath.get(`${method} ${p}`);
  return undefined;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set. Export your key first.');
    process.exit(1);
  }
  const FORCE = process.argv.includes('--force');
  const root = process.cwd();
  const dir = path.resolve(root, 'apidog', 'api_specs');

  const { Runner, hostedMcpTool } = await getAgents();
  const apidog = hostedMcpTool({
    serverLabel: 'BananaStudio API Hub',
    allowedTools: ['listModules', 'listEndpoints', 'getEndpoint', 'updateEndpoint', 'createEndpoint'],
    connectorId: 'connector_apidog',
    requireApproval: 'auto',
  });
  const runner = new Runner();

  const local = await readLocalSpecs(dir);
  if (local.size === 0) {
    console.log('No local specs found in apidog/api_specs/. Nothing to push.');
    return;
  }

  console.log('🔎 Fetching remote index...');
  const remote = await buildRemoteIndex(runner, apidog);

  const toUpdate = [];
  const toCreate = [];
  for (const [id, entry] of local) {
    const remoteMatch = findRemoteMatch(entry, remote);
    if (!remoteMatch) {
      toCreate.push(entry);
      continue;
    }
    if (!isEqual(entry.spec, remoteMatch)) {
      toUpdate.push({ local: entry, remote: remoteMatch });
    }
  }

  if (!FORCE) {
    console.log(`Found ${toUpdate.length} updates and ${toCreate.length} additions. Re-run with --force to apply.`);
    return;
  }

  for (const u of toUpdate) {
    const endpointId = u.remote.id;
    if (!endpointId) {
      console.warn('Skipping update without remote id');
      continue;
    }
    await runner.callTool(apidog, 'updateEndpoint', { endpointId, endpoint: u.local.spec });
    console.log(`✅ Updated ${u.local.spec.name || endpointId}`);
  }

  for (const c of toCreate) {
    try {
      const created = await runner.callTool(apidog, 'createEndpoint', { endpoint: c.spec });
      console.log(`➕ Created ${c.spec.name || 'endpoint'} (${created?.id || 'id unknown'})`);
    } catch (e) {
      console.warn(`Could not create ${c.spec.name || 'endpoint'}; ensure connector allows createEndpoint.`);
    }
  }

  console.log('🎉 Push complete.');
}

main().catch((err) => {
  console.error('❌ Error:', err?.stack || err?.message || String(err));
  process.exit(1);
});
