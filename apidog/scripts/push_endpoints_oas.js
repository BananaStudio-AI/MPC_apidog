#!/usr/bin/env node
/*
  Push local endpoint specs to Apidog via OAS-based MCP tools.
  This script reads the full OAS, merges local changes, and writes back.
  Use --force to overwrite without confirmation.
  
  Requires: APIDOG_ACCESS_TOKEN, Project ID from APIDOG_PROJECT_ID or defaults to 1128155.
*/
import { platform } from 'node:os';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const SPEC_DIR = path.join(ROOT, 'apidog', 'api_specs');
const OAS_FILE = path.join(ROOT, 'apidog', 'generated', 'oas_raw.json');
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
    console.error('Missing @modelcontextprotocol/sdk. Install with: npm i -S @modelcontextprotocol/sdk');
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

  const client = new Client({ name: 'BananaStudio Push OAS Script', version: '1.0.0' });
  await client.connect(transport);
  return client;
}

async function callTool(client, name, args = {}) {
  const res = await client.callTool({ name, arguments: args });
  const block = res.content?.[0];
  if (block?.type === 'json') return block.json;
  if (block?.type === 'text') {
    try { return JSON.parse(block.text); } catch {}
    return block.text;
  }
  throw new Error(`Unexpected tool result format for ${name}`);
}

async function readLocalOAS() {
  try {
    const raw = await fs.readFile(OAS_FILE, 'utf8');
    const data = JSON.parse(raw);
    // Extract the OAS portion if wrapped
    return data.openapi ? data : data;
  } catch (e) {
    console.warn(`Could not read ${OAS_FILE}. Using empty OAS.`);
    return {
      openapi: '3.0.1',
      info: { title: 'BananaStudio API Hub', version: '1.0.0' },
      paths: {},
      components: { schemas: {} }
    };
  }
}

async function readLocalSpecs() {
  const files = await fs.readdir(SPEC_DIR);
  const specs = [];
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const raw = await fs.readFile(path.join(SPEC_DIR, f), 'utf8');
    try {
      specs.push(JSON.parse(raw));
    } catch (e) {
      console.warn(`Skipping invalid JSON: ${f}`);
    }
  }
  return specs;
}

function mergeEndpointsIntoOAS(oas, endpoints) {
  // Simple merge: for each endpoint with path/method, update OAS paths
  for (const ep of endpoints) {
    const pathKey = ep.path || '/';
    const method = (ep.method || 'get').toLowerCase();
    
    if (!oas.paths[pathKey]) oas.paths[pathKey] = {};
    
    oas.paths[pathKey][method] = {
      summary: ep.summary || '',
      description: ep.description || '',
      deprecated: ep.deprecated || false,
      tags: ep.tags || [],
      parameters: ep.parameters || [],
      responses: ep.response || ep.responses || {},
      security: ep.security || []
    };
  }
  return oas;
}

function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
}

async function main() {
  assertEnv();
  
  console.log('Reading local OAS and endpoint specs...');
  const localOAS = await readLocalOAS();
  const endpoints = await readLocalSpecs();
  
  console.log(`Found ${endpoints.length} local endpoint specs.`);
  
  // Merge endpoints into OAS
  const mergedOAS = mergeEndpointsIntoOAS(JSON.parse(JSON.stringify(localOAS)), endpoints);
  
  console.log('Connecting to MCP server...');
  const client = await connectMCP();
  
  try {
    const tools = await client.listTools();
    const readTool = tools.tools.find(t => t.name.includes('read_project_oas') && !t.name.includes('ref'));
    
    if (!readTool) {
      console.error('No OpenAPI read tool found. Available tools:', tools.tools.map(t => t.name));
      process.exit(1);
    }
    
    console.log(`Using read tool: ${readTool.name}`);
    console.log('Fetching remote OAS...');
    
    const remoteData = await callTool(client, readTool.name, {});
    const remoteOAS = typeof remoteData === 'string' ? JSON.parse(remoteData) : remoteData;
    
    // Compare
    const localStr = stableStringify(mergedOAS);
    const remoteStr = stableStringify(remoteOAS);
    
    if (localStr === remoteStr) {
      console.log('✓ No changes detected. Local and remote OAS match.');
      return;
    }
    
    console.log('\n⚠️  Changes detected between local and remote OAS.');
    console.log(`Local paths: ${Object.keys(mergedOAS.paths || {}).length}`);
    console.log(`Remote paths: ${Object.keys(remoteOAS.paths || {}).length}`);
    
    if (!FORCE) {
      console.log('\nRe-run with --force to push changes (Note: direct OAS write not supported by current MCP tools).');
      console.log('Current MCP server exposes read-only tools. To update Apidog:');
      console.log('  1. Use the Apidog web UI to import the OAS from apidog/generated/oas_raw.json');
      console.log('  2. Or use the Apidog API directly with a write token.');
      return;
    }
    
    console.log('\n--force specified, but write tools not available via MCP.');
    console.log('Saving merged OAS to apidog/generated/oas_merged.json for manual import.');
    
    await fs.writeFile(
      path.join(ROOT, 'apidog', 'generated', 'oas_merged.json'),
      JSON.stringify(mergedOAS, null, 2)
    );
    
    console.log('✓ Merged OAS saved. Import it via Apidog UI or API.');
    
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
