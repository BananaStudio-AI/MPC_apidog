#!/usr/bin/env node
/*
  Pull all endpoints from Apidog via MCP and write JSON specs to /apidog/api_specs.
  Requires: APIDOG_ACCESS_TOKEN in env, Project ID from env APIDOG_PROJECT_ID or defaults to 1128155.
  Note: This script uses the Model Context Protocol SDK. Install dependencies:
    npm i -S @modelcontextprotocol/sdk
*/
import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const OUT_DIR = path.join(ROOT, 'apidog', 'api_specs');
const PROJECT_ID = process.env.APIDOG_PROJECT_ID || '1128155';
const TOKEN = process.env.APIDOG_ACCESS_TOKEN;

function assertEnv() {
  if (!TOKEN) {
    console.error('Missing APIDOG_ACCESS_TOKEN in environment. Set it in .env');
    process.exit(1);
  }
}

async function ensureOutDir() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

async function connectMCP() {
  let sdk;
  try {
    sdk = await import('@modelcontextprotocol/sdk');
  } catch (err) {
    console.error('Missing dependency @modelcontextprotocol/sdk. Install with:');
    console.error('  npm i -S @modelcontextprotocol/sdk');
    process.exit(1);
  }
  const { Client } = sdk;
  const { StdioClientTransport } = sdk;

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

  const client = new Client({
    name: 'BananaStudio Pull Script',
    version: '1.0.0',
  });

  await client.connect(transport);
  return client;
}

async function discoverEndpointsTool(client) {
  const tools = await client.listTools();
  // Prefer explicit env override, else best-effort discovery
  const preferred = process.env.APIDOG_LIST_TOOL;
  if (preferred) {
    const t = tools.tools.find((x) => x.name === preferred);
    if (t) return t.name;
    console.warn(`Preferred tool ${preferred} not found. Falling back.`);
  }
  const candidates = [
    'apidog.listEndpoints',
    'Apidog.listEndpoints',
    'project.listEndpoints',
    'endpoints.list',
    'BananaStudio_Internal.listEndpoints',
  ];
  for (const c of candidates) {
    if (tools.tools.find((x) => x.name === c)) return c;
  }
  throw new Error(
    'Could not find an endpoints listing tool via MCP. Set APIDOG_LIST_TOOL env var to the correct tool name.'
  );
}

async function callTool(client, name, args = {}) {
  const res = await client.callTool({ name, arguments: args });
  // Expecting JSON output in first content block
  const block = res.content?.[0];
  if (block?.type === 'json') return block.json;
  if (block?.type === 'text') {
    try {
      return JSON.parse(block.text);
    } catch {}
  }
  throw new Error(`Unexpected tool result format for ${name}`);
}

async function writeEndpointFiles(endpoints) {
  const byId = new Map();
  for (const ep of endpoints) {
    const id = ep.id || `${ep.method}-${ep.path}`.replace(/[^a-z0-9-_]/gi, '_');
    byId.set(id, ep);
  }
  const writes = [];
  for (const [id, ep] of byId.entries()) {
    const file = path.join(OUT_DIR, `${id}.json`);
    writes.push(fs.writeFile(file, JSON.stringify(ep, null, 2), 'utf8'));
  }
  await Promise.all(writes);
  return byId.size;
}

async function main() {
  assertEnv();
  await ensureOutDir();
  const client = await connectMCP();
  try {
    const toolName = await discoverEndpointsTool(client);
    const data = await callTool(client, toolName, {});
    const endpoints = Array.isArray(data?.endpoints) ? data.endpoints : data;
    if (!Array.isArray(endpoints)) {
      throw new Error('Tool did not return an array of endpoints.');
    }
    const count = await writeEndpointFiles(endpoints);
    console.log(`Saved ${count} endpoint specs to ${OUT_DIR}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
