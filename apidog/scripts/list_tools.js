#!/usr/bin/env node
/*
  List available MCP tools exposed by the Apidog MCP server.
  Helpful for selecting the correct listing/updating tools.
*/
import { platform } from 'node:os';

async function main() {
  const token = process.env.APIDOG_ACCESS_TOKEN;
  const projectId = process.env.APIDOG_PROJECT_ID || '1128155';
  if (!token) {
    console.error('Missing APIDOG_ACCESS_TOKEN in env. Set it in .env');
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
  const command = isWin ? 'cmd' : 'npx';
  const args = isWin
    ? ['/c', 'npx', '-y', 'apidog-mcp-server@latest', `--project-id=${projectId}`]
    : ['-y', 'apidog-mcp-server@latest', `--project-id=${projectId}`];

  const transport = new StdioClientTransport({ command, args, env: { ...process.env, APIDOG_ACCESS_TOKEN: token } });
  const client = new Client({ name: 'BananaStudio Tool Lister', version: '1.0.0' });
  await client.connect(transport);
  try {
    const res = await client.listTools();
    const tools = (res.tools || []).map(t => ({ name: t.name, description: t.description || '' }));
    console.log(JSON.stringify({ count: tools.length, tools }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch(err => { console.error(err?.stack || err?.message || String(err)); process.exit(1); });
