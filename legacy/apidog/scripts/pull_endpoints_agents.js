import './lib/load_env.js';
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
  
  if (!process.env.APIDOG_ACCESS_TOKEN) {
    console.error('APIDOG_ACCESS_TOKEN not set. The MCP connector requires authorization.');
    process.exit(1);
  }

  const { Agent, run, hostedMcpTool } = await getAgents();

  const outDir = path.resolve('./apidog/api_specs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const mcpTools = hostedMcpTool({
    serverLabel: 'BananaStudio API Hub',
    connectorId: 'connector_apidog',
    authorization: process.env.APIDOG_ACCESS_TOKEN,
    allowedTools: ['listModules', 'listEndpoints', 'getEndpoint'],
    requireApproval: 'auto'
  });

  const agent = new Agent({
    name: 'Apidog Sync Agent',
    instructions: 'You are an API documentation agent. Use the MCP tools to fetch module and endpoint data.',
    tools: [mcpTools]
  });

  console.log('📡 Fetching modules...');
  const modulesResult = await run(agent, 'List all modules using the listModules tool');
  
  // Extract the tool call result from final message
  const lastMsg = modulesResult.messages[modulesResult.messages.length - 1];
  const modulesContent = lastMsg?.content;
  const modules = typeof modulesContent === 'string' ? JSON.parse(modulesContent) : modulesContent;
  if (!modules || !Array.isArray(modules.modules)) {
    console.error('Unexpected response from listModules:', modules);
    process.exit(1);
  }

  const moduleList = Array.isArray(modules?.modules) ? modules.modules : [];
  
  for (const mod of moduleList) {
    console.log(`📦 Module: ${mod.name || mod.id}`);
    const endpointsResult = await run(agent, `List endpoints for module ${mod.id} using the listEndpoints tool with moduleId=${mod.id}`);
    const endpointsMsg = endpointsResult.messages[endpointsResult.messages.length - 1];
    const endpointsContent = endpointsMsg?.content;
    const endpoints = typeof endpointsContent === 'string' ? JSON.parse(endpointsContent) : endpointsContent;
    const list = Array.isArray(endpoints?.endpoints) ? endpoints.endpoints : [];

    for (const ep of list) {
      const detailResult = await run(agent, `Get endpoint details for ${ep.id} using the getEndpoint tool with endpointId=${ep.id}`);
      const detailMsg = detailResult.messages[detailResult.messages.length - 1];
      const detailContent = detailMsg?.content;
      const detail = typeof detailContent === 'string' ? JSON.parse(detailContent) : detailContent;
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
