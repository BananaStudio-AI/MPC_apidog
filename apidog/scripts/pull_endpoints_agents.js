#!/usr/bin/env node
/**
 * Pull endpoints via OpenAI Agents + Hosted MCP connector for Apidog.
 *
 * Prerequisites:
 * - OPENAI_API_KEY set in your environment
 * - An OpenAI Agents MCP connector configured for Apidog with:
 *   - serverLabel: "BananaStudio API Hub"
 *   - connectorId: "connector_apidog" (or adjust below)
 *   - allowed tools include: listModules, listEndpoints, getEndpoint
 *
 * This script will:
 * - List Apidog modules
 * - For each module, list endpoints and fetch details
 * - Save each endpoint JSON into apidog/api_specs/
 */
import fs from 'node:fs';
import path from 'node:path';

// Lazy import to avoid crashing when package isn't installed yet
async function getAgents() {
  try {
    const mod = await import('@openai/agents');
    return mod;
  } catch (e) {
    console.error('Missing @openai/agents. Install with:');
    console.error('  npm i -S @openai/agents');
    process.exit(1);
  }
}

function sanitize(name) {
  return String(name || 'endpoint')
    .replace(/[^a-z0-9-_\.]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120) || 'endpoint';
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set. Export your key first.');
    process.exit(1);
  }

  const { Runner, hostedMcpTool } = await getAgents();

  const apidog = hostedMcpTool({
    serverLabel: 'BananaStudio API Hub',
    allowedTools: ['listModules', 'listEndpoints', 'getEndpoint'],
    connectorId: 'connector_apidog',
    requireApproval: 'auto'
  });

  const runner = new Runner();
  const outDir = path.resolve('./apidog/api_specs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('📡 Fetching modules...');
  const modules = await runner.callTool(apidog, 'listModules', {});
  if (!modules || !Array.isArray(modules.modules)) {
    console.error('Unexpected response from listModules:', modules);
    process.exit(1);
  }

  for (const mod of modules.modules) {
    console.log(`📦 Module: ${mod.name || mod.id}`);
    const endpoints = await runner.callTool(apidog, 'listEndpoints', { moduleId: mod.id });
    const list = Array.isArray(endpoints?.endpoints) ? endpoints.endpoints : [];

    for (const ep of list) {
      const detail = await runner.callTool(apidog, 'getEndpoint', { endpointId: ep.id });
      const base = sanitize(ep.name || `${ep.method}-${ep.path || ep.id}`);
      const filePath = path.join(outDir, `${base}.json`);
      fs.writeFileSync(filePath, JSON.stringify(detail, null, 2));
      console.log(`   ✔ Saved ${path.basename(filePath)}`);
    }
  }

  console.log('🎉 Sync complete.');
}

main().catch((err) => {
  console.error('❌ Error:', err?.stack || err?.message || String(err));
  process.exit(1);
});
