#!/usr/bin/env node
/**
 * Debug MCP connection to Apidog.
 * Tests the MCP server directly and shows detailed error information.
 */
import { platform } from 'node:os';

async function connectAndDebug() {
  const TOKEN = process.env.APIDOG_ACCESS_TOKEN;
  const PROJECT_ID = process.env.APIDOG_PROJECT_ID || '1128155';

  if (!TOKEN) {
    console.error('❌ APIDOG_ACCESS_TOKEN not set');
    process.exit(1);
  }

  console.log('🔍 Testing Apidog MCP Connection');
  console.log(`   Project ID: ${PROJECT_ID}`);
  console.log(`   Token: ${TOKEN.substring(0, 20)}...`);
  console.log();

  let Client, StdioClientTransport;
  try {
    ({ Client } = await import('@modelcontextprotocol/sdk/client'));
    ({ StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js'));
  } catch (err) {
    console.error('❌ Missing @modelcontextprotocol/sdk');
    process.exit(1);
  }

  const isWindows = platform() === 'win32';
  const command = isWindows ? 'cmd' : 'npx';
  const args = isWindows
    ? ['/c', 'npx', '-y', 'apidog-mcp-server@latest', `--project-id=${PROJECT_ID}`]
    : ['-y', 'apidog-mcp-server@latest', `--project-id=${PROJECT_ID}`];

  console.log('📡 Spawning MCP server:');
  console.log(`   Command: ${command}`);
  console.log(`   Args: ${args.join(' ')}`);
  console.log();

  const transport = new StdioClientTransport({
    command,
    args,
    env: { ...process.env, APIDOG_ACCESS_TOKEN: TOKEN },
  });

  const client = new Client({ name: 'Debug Client', version: '1.0.0' });

  try {
    console.log('🔌 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected!');
    console.log();

    console.log('📋 Listing available tools...');
    const tools = await client.listTools();
    console.log(`✅ Found ${tools.tools.length} tools:`);
    for (const tool of tools.tools) {
      console.log(`   - ${tool.name}: ${tool.description || '(no description)'}`);
    }
    console.log();

    // Try to call a tool
    const listTool = tools.tools.find(t => 
      t.name.includes('list') || t.name.includes('List')
    );

    if (listTool) {
      console.log(`🧪 Testing tool: ${listTool.name}`);
      try {
        const result = await client.callTool({ name: listTool.name, arguments: {} });
        console.log('✅ Tool call succeeded!');
        console.log('   Result type:', result.content?.[0]?.type);
        if (result.content?.[0]?.type === 'text') {
          console.log('   Preview:', result.content[0].text.substring(0, 200));
        } else if (result.content?.[0]?.type === 'json') {
          console.log('   Data:', JSON.stringify(result.content[0].json).substring(0, 200));
        }
      } catch (err) {
        console.error('❌ Tool call failed:', err.message);
        if (err.message.includes('403')) {
          console.log();
          console.log('⚠️  403 Forbidden - Token lacks permissions for this project');
          console.log('   - Verify token has access to project 1128155 in Apidog dashboard');
          console.log('   - Check: Settings > API Tokens > Permissions');
          console.log('   - May need to regenerate token with correct scope');
        }
      }
    }

    await client.close();
    console.log();
    console.log('✅ Debug complete');

  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

connectAndDebug();
