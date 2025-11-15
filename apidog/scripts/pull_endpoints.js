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
  const oasTool = tools.tools.find((t) => t.name.startsWith('read_project_oas'));
  if (oasTool) return oasTool.name;
  const available = tools.tools.map((t) => t.name).join(', ');
  throw new Error(
    `Could not find an endpoints listing tool via MCP. Set APIDOG_LIST_TOOL env var to the correct tool name. Available tools: ${available}`
  );
}

async function callTool(client, name, args = {}) {
  const res = await client.callTool({ name, arguments: args });
  const tryParseText = async (text) => {
    try { return JSON.parse(text); } catch {}
    try {
      const YAML = await import('yaml').then(m => m.default || m);
      return YAML.parse(text);
    } catch {}
    return undefined;
  };
  const blobsToObj = async (b64) => {
    const buf = Buffer.from(b64, 'base64');
    const text = buf.toString('utf8');
    return tryParseText(text);
  };
  const contents = Array.isArray(res.content) ? res.content : [];
  for (const block of contents) {
    if (block?.type === 'json') return block.json;
    if (block?.type === 'text') {
      const obj = await tryParseText(block.text);
      if (obj) return obj;
    }
    if (block?.type === 'blob' && block.blob?.data) {
      const obj = await blobsToObj(block.blob.data);
      if (obj) return obj;
    }
    if (block?.type === 'resource' && block.resource?.uri) {
      const rr = await client.readResource({ uri: block.resource.uri });
      const rcs = Array.isArray(rr.content) ? rr.content : [];
      for (const rb of rcs) {
        if (rb?.type === 'json') return rb.json;
        if (rb?.type === 'text') {
          const obj = await tryParseText(rb.text);
          if (obj) return obj;
        }
        if (rb?.type === 'blob' && rb.blob?.data) {
          const obj = await blobsToObj(rb.blob.data);
          if (obj) return obj;
        }
      }
    }
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

function oasToEndpoints(oas) {
  const out = [];
  if (!oas || typeof oas !== 'object' || !oas.paths) return out;
  for (const [p, methods] of Object.entries(oas.paths)) {
    if (!methods || typeof methods !== 'object') continue;
    for (const [m, spec] of Object.entries(methods)) {
      const method = String(m).toUpperCase();
      if (!['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].includes(method)) continue;
      const ep = {
        id: `${method}-${p}`.replace(/[^a-z0-9-_]/gi, '_'),
        name: spec.summary || undefined,
        method,
        path: p,
        summary: spec.summary,
        description: spec.description,
        tags: spec.tags,
        deprecated: spec.deprecated,
      };
      const params = Array.isArray(spec.parameters) ? spec.parameters : [];
      ep.query = params.filter(pr => pr && pr.in === 'query').map(pr => ({
        name: pr.name,
        required: pr.required,
        description: pr.description,
        schema: pr.schema
      }));
      ep.headers = params.filter(pr => pr && pr.in === 'header').map(pr => ({
        name: pr.name,
        required: pr.required,
        description: pr.description,
        schema: pr.schema
      }));
      if (spec.requestBody) {
        ep.requestBody = spec.requestBody;
      }
      if (spec.responses) {
        ep.responses = spec.responses;
      }
      out.push(ep);
    }
  }
  return out;
}

async function main() {
  assertEnv();
  
  // Token format validation
  if (TOKEN && TOKEN.includes(':')) {
    console.warn('⚠️  WARNING: Token contains colon (:) which suggests wrong format!');
    console.warn('   Apidog uses Bearer token auth, not key:secret format.');
    console.warn('   Run: npm run apidog:auth-check');
    console.warn('   Get token from: Account Settings → API Access Token\n');
  }
  
  await ensureOutDir();
  const client = await connectMCP();
  try {
    const toolName = await discoverEndpointsTool(client);
    const data = await callTool(client, toolName, {});
    let endpoints = Array.isArray(data?.endpoints) ? data.endpoints : data;
    if (!Array.isArray(endpoints)) {
      // Try to treat as OpenAPI document
      const converted = oasToEndpoints(data);
      if (converted.length === 0) {
        // Dump raw for inspection with enhanced error details
        const dumpPath = path.join(OUT_DIR, '..', 'generated', 'oas_raw.json');
        await fs.mkdir(path.dirname(dumpPath), { recursive: true });
        
        // Enhanced error structure
        const errorReport = {
          timestamp: new Date().toISOString(),
          error: 'Failed to extract endpoints',
          toolUsed: toolName,
          projectId: PROJECT_ID,
          tokenFormat: TOKEN?.includes(':') ? 'invalid (contains colon)' : 'appears valid',
          rawResponse: data
        };
        
        await fs.writeFile(dumpPath, JSON.stringify(errorReport, null, 2), 'utf8');
        
        // Extract useful error info if present
        let errorMsg = 'Tool did not return endpoints array or convertible OpenAPI document.';
        if (data && typeof data === 'object') {
          if (data.errorCode || data.errorMessage) {
            errorMsg += `\n   Apidog Error ${data.errorCode || ''}: ${data.errorMessage || ''}`;
          }
          if (data.AxiosError) {
            errorMsg += `\n   HTTP Error: ${data.AxiosError}`;
          }
          if (data.message) {
            errorMsg += `\n   Message: ${data.message}`;
          }
        }
        errorMsg += '\n   Raw response saved to apidog/generated/oas_raw.json';
        errorMsg += '\n   Run: npm run apidog:auth-check';
        
        throw new Error(errorMsg);
      }
      endpoints = converted;
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
