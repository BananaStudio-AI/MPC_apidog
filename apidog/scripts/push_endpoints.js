#!/usr/bin/env node
/*
  Push local endpoint specs to Apidog via MCP.
  Behavior: compares local /apidog/api_specs/*.json with live endpoints; updates only changed ones.
  Use --force to overwrite without diff confirmation.

  Requires: APIDOG_ACCESS_TOKEN in env, Project ID from env APIDOG_PROJECT_ID or defaults to 1128155.
  Install dependency: npm i -S @modelcontextprotocol/sdk
*/
import { platform } from 'node:os';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SPEC_DIR = path.join(ROOT, 'apidog', 'api_specs');
const PROJECT_ID = process.env.APIDOG_PROJECT_ID || '1128155';
const TOKEN = process.env.APIDOG_ACCESS_TOKEN;
const FORCE = process.argv.includes('--force');

function assertEnv() {
  if (!TOKEN) {
    console.error('Missing APIDOG_ACCESS_TOKEN in environment. Set it in .env');
    process.exit(1);
  }
}

async function connectMCP() {
  let Client, StdioClientTransport;
  try {
    ({ Client } = await import('@modelcontextprotocol/sdk/client'));
    ({ StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js'));
  } catch (err) {
    console.error('Missing or incompatible @modelcontextprotocol/sdk. Install/update with:');
    console.error('  npm i -S @modelcontextprotocol/sdk');
    process.exit(1);
  }

  const isWindows = platform() === 'win32';
  const command = isWindows ? 'cmd' : 'npx';
  const args = isWindows
    ? ['/c', 'npx', '-y', 'apidog-mcp-server@latest', `--project-id=${PROJECT_ID}`]
    : ['-y', 'apidog-mcp-server@latest', `--project-id=${PROJECT_ID}`];

  const transport = new StdioClientTransport({
    command,
    args,
    env: { ...process.env, APIDOG_ACCESS_TOKEN: TOKEN },
  });

  const client = new Client({ name: 'BananaStudio Push Script', version: '1.0.0' });
  await client.connect(transport);
  return client;
}

async function discoverTools(client) {
  const tools = await client.listTools();
  const listPreferred = process.env.APIDOG_LIST_TOOL;
  const updatePreferred = process.env.APIDOG_UPDATE_TOOL;

  function findTool(name) {
    return tools.tools.find((t) => t.name === name);
  }

  const listCandidates = [listPreferred, 'apidog.listEndpoints', 'Apidog.listEndpoints', 'project.listEndpoints', 'endpoints.list'].filter(Boolean);
  const updateCandidates = [updatePreferred, 'apidog.updateEndpoint', 'Apidog.updateEndpoint', 'project.updateEndpoint', 'endpoints.update'].filter(Boolean);

  const listTool = listCandidates.find((c) => c && findTool(c));
  const updateTool = updateCandidates.find((c) => c && findTool(c));

  if (!listTool) throw new Error('Could not find list endpoints tool. Set APIDOG_LIST_TOOL env var.');
  if (!updateTool) throw new Error('Could not find update endpoint tool. Set APIDOG_UPDATE_TOOL env var.');
  return { listTool, updateTool };
}

async function callTool(client, name, args = {}) {
  const res = await client.callTool({ name, arguments: args });
  const block = res.content?.[0];
  if (block?.type === 'json') return block.json;
  if (block?.type === 'text') {
    try { return JSON.parse(block.text); } catch {}
  }
  throw new Error(`Unexpected tool result format for ${name}`);
}

async function readLocalSpecs() {
  const files = await fs.readdir(SPEC_DIR);
  const out = new Map();
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const raw = await fs.readFile(path.join(SPEC_DIR, f), 'utf8');
    try {
      const data = JSON.parse(raw);
      const id = data.id || f.replace(/\.json$/, '');
      out.set(id, data);
    } catch (e) {
      console.warn(`Skipping invalid JSON: ${f}`);
    }
  }
  return out;
}

function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
}

function isEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}

async function main() {
  assertEnv();
  const local = await readLocalSpecs();
  const client = await connectMCP();
  try {
    const { listTool, updateTool } = await discoverTools(client);
    const data = await callTool(client, listTool, {});
    const remoteList = Array.isArray(data?.endpoints) ? data.endpoints : data;
    const remote = new Map();
    for (const ep of remoteList) {
      const id = ep.id || `${ep.method}-${ep.path}`.replace(/[^a-z0-9-_]/gi, '_');
      remote.set(id, ep);
    }

    const updates = [];
    for (const [id, spec] of local) {
      const r = remote.get(id);
      if (!r) {
        console.log(`[ADD] ${id} (not present on remote)`);
        updates.push({ id, spec, type: 'add' });
        continue;
      }
      if (!isEqual(spec, r)) {
        console.log(`[CHANGE] ${id} differs from remote`);
        updates.push({ id, spec, type: 'change' });
      }
    }

    if (updates.length === 0) {
      console.log('No changes to push.');
      return;
    }

    if (!FORCE) {
      console.log(`Found ${updates.length} changes. Re-run with --force to apply.`);
      return;
    }

    for (const u of updates) {
      const args = { id: u.id, endpoint: u.spec };
      const res = await callTool(client, updateTool, args);
      console.log(`[OK] Updated ${u.id}`);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
