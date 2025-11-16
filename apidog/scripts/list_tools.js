#!/usr/bin/env node
import './lib/load_env.js';
/*
  List available MCP tools exposed by the Apidog MCP server.
  Helpful for selecting the correct listing/updating tools.
*/
import { platform } from 'node:os';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function parseDotEnv(content) {
  const env = {};
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
  // Only load if required keys are missing
  if (process.env.APIDOG_ACCESS_TOKEN && process.env.APIDOG_PROJECT_ID) return;
  try {
    const dotEnvPath = resolve(process.cwd(), '.env');
    const txt = await readFile(dotEnvPath, 'utf8');
    const envMap = parseDotEnv(txt);
    for (const [k, v] of Object.entries(envMap)) {
      if (process.env[k] == null) process.env[k] = v;
    }
  } catch {
    // Silently ignore if .env not found; we'll error later if missing
  }
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)),
  ]);
}

async function main() {
  await maybeLoadDotEnv();

  const token = process.env.APIDOG_ACCESS_TOKEN;
  const projectId = process.env.APIDOG_PROJECT_ID || '1128155';
  if (!token) {
    console.error('Missing APIDOG_ACCESS_TOKEN in env. Add it to .env or export it before running.');
    process.exit(1);
  }

  let Client, StdioClientTransport;
  try {
    ({ Client } = await import('@modelcontextprotocol/sdk/client'));
    ({ StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js'));
  } catch (e) {
    console.error('Install/update SDK: npm i -S @modelcontextprotocol/sdk');
    process.exit(1);
  }

  const isWin = platform() === 'win32';
  const command = isWin ? 'cmd' : 'node';
  const args = isWin
    ? ['/c', 'node', 'node_modules/apidog-mcp-server/lib/index.js', `--project-id=${projectId}`]
    : ['node_modules/apidog-mcp-server/lib/index.js', `--project-id=${projectId}`];

  const transport = new StdioClientTransport({
    command,
    args,
    env: {
      ...process.env,
      APIDOG_ACCESS_TOKEN: token,
    },
  });

  const client = new Client({ name: 'BananaStudio Tool Lister', version: '1.0.0' });

  const connectTimeout = parseInt(process.env.MCP_CONNECT_TIMEOUT_MS || '20000', 10);
  const listTimeout = parseInt(process.env.MCP_LIST_TIMEOUT_MS || '10000', 10);

  console.error(`Connecting to Apidog MCP (project ${projectId}) with ${connectTimeout}ms timeout...`);
  await withTimeout(client.connect(transport), connectTimeout, 'MCP connection');

  try {
    console.error(`Connected. Listing tools (timeout ${listTimeout}ms)...`);
    const res = await withTimeout(client.listTools(), listTimeout, 'listTools');
    const tools = (res.tools || []).map(t => ({ name: t.name, description: t.description || '' }));
    console.log(JSON.stringify({ count: tools.length, tools }, null, 2));
  } finally {
    await client.close().catch(() => {});
  }
}

main().catch(err => {
  console.error(err?.message || String(err));
  process.exit(1);
});
