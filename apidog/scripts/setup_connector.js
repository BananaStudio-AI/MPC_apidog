#!/usr/bin/env node
/**
 * Register an MCP connector for Apidog with OpenAI Agents.
 * 
 * This creates a hosted MCP connector that your agents-based scripts can use.
 * 
 * Prerequisites:
 * - OPENAI_API_KEY set in environment
 * - APIDOG_ACCESS_TOKEN for authentication with Apidog
 * 
 * Usage:
 *   node setup_connector.js
 */

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set');
    process.exit(1);
  }
  
  if (!process.env.APIDOG_ACCESS_TOKEN) {
    console.error('❌ APIDOG_ACCESS_TOKEN not set');
    process.exit(1);
  }

  try {
    const { default: fetch } = await import('node-fetch');
    
    const connectorConfig = {
      id: 'connector_apidog',
      name: 'BananaStudio API Hub',
      description: 'MCP connector for Apidog project 1128155',
      type: 'mcp',
      config: {
        command: 'npx',
        args: ['-y', 'apidog-mcp-server@latest', '--project-id=1128155'],
        env: {
          APIDOG_ACCESS_TOKEN: process.env.APIDOG_ACCESS_TOKEN
        }
      }
    };

    console.log('🔧 Creating MCP connector...');
    console.log(`   ID: ${connectorConfig.id}`);
    console.log(`   Name: ${connectorConfig.name}`);

    // Note: The actual OpenAI API endpoint for registering connectors may differ
    // This is a placeholder - adjust based on OpenAI's actual connector management API
    const response = await fetch('https://api.openai.com/v1/mcp/connectors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'agents=v2'
      },
      body: JSON.stringify(connectorConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to create connector:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${error}`);
      
      if (response.status === 404) {
        console.log('\n💡 Note: The connector registration endpoint may not be publicly available yet.');
        console.log('   You may need to create the connector via:');
        console.log('   - OpenAI Dashboard (if available)');
        console.log('   - Contact OpenAI support for connector setup');
        console.log('   - Use local MCP instead (npm run apidog:pull)');
      }
      
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Connector created successfully!');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🎉 Next steps:');
    console.log('   npm run apidog:pull:agents   # Pull endpoints');
    console.log('   npm run apidog:validate       # Validate specs');

  } catch (err) {
    console.error('❌ Error:', err.message);
    
    if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('node-fetch')) {
      console.log('\n💡 Install node-fetch: npm i -S node-fetch');
    }
    
    process.exit(1);
  }
}

main();
