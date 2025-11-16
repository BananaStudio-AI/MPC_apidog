#!/usr/bin/env node
/*
  Pull endpoint specs from Apidog via OAS-based MCP tools.
  Fetches the full OpenAPI spec and extracts individual endpoint definitions.
  
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

  const client = new Client({ name: 'BananaStudio Pull OAS Script', version: '1.0.0' });
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

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (e) {
    // Ignore if exists
  }
}

function extractEndpointsFromOAS(oas) {
  const endpoints = [];
  const paths = oas.paths || {};
  
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method.toLowerCase())) {
        continue; // Skip non-HTTP methods like $ref, description, etc.
      }
      
      const id = `${method.toUpperCase()}_${pathKey.replace(/[^a-z0-9]/gi, '_')}`;
      
      endpoints.push({
        id,
        method: method.toUpperCase(),
        path: pathKey,
        summary: operation.summary || '',
        description: operation.description || '',
        deprecated: operation.deprecated || false,
        tags: operation.tags || [],
        parameters: operation.parameters || [],
        requestBody: operation.requestBody,
        responses: operation.responses || {},
        security: operation.security || []
      });
    }
  }
  
  return endpoints;
}

async function saveEndpoints(endpoints) {
  await ensureDir(SPEC_DIR);
  
  for (const ep of endpoints) {
    const filename = `${ep.id}.json`;
    const filePath = path.join(SPEC_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(ep, null, 2));
    console.log(`✓ Saved: ${filename}`);
  }
}

async function saveRawOAS(oas) {
  await ensureDir(path.dirname(OAS_FILE));
  
  const wrapped = {
    fetchedAt: new Date().toISOString(),
    projectId: PROJECT_ID,
    ...oas
  };
  
  await fs.writeFile(OAS_FILE, JSON.stringify(wrapped, null, 2));
  console.log(`✓ Saved raw OAS: ${path.basename(OAS_FILE)}`);
}

async function main() {
  assertEnv();
  
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
    console.log('Fetching OpenAPI spec from Apidog...');
    
    const oasData = await callTool(client, readTool.name, {});
    const oas = typeof oasData === 'string' ? JSON.parse(oasData) : oasData;
    
    console.log(`\nOpenAPI Spec:`);
    console.log(`  Title: ${oas.info?.title || 'N/A'}`);
    console.log(`  Version: ${oas.info?.version || 'N/A'}`);
    console.log(`  Paths: ${Object.keys(oas.paths || {}).length}`);
    
    // Save raw OAS
    await saveRawOAS(oas);
    
    // Extract and save individual endpoints
    const endpoints = extractEndpointsFromOAS(oas);
    console.log(`\nExtracted ${endpoints.length} endpoint(s):`);
    
    await saveEndpoints(endpoints);
    
    console.log(`\n✅ Pull complete! Endpoint specs saved to ${SPEC_DIR}`);
    
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
