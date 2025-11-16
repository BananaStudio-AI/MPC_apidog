# API Client Examples

This directory contains example scripts demonstrating various capabilities of the BananaStudio API Hub.

## Available Examples

### `use_api_client.js`
Demonstrates using the generated TypeScript/JavaScript client to:
- Fetch model pricing information
- Search for available models
- Handle API responses with strong typing

### `cloud-agent-delegation.ts` ⭐ NEW
Advanced multi-agent orchestration example showcasing:
- **OpenAI Agents SDK integration** with API Hub
- **Intelligent model selection** across 1,434 models
- **Cost optimization** with automated analysis
- **Multi-agent coordination** via handoffs
- **Tool-based architecture** for API interactions

**Quick Start:**
```bash
export OPENAI_API_KEY=your-openai-key
npm run agent:delegate
```

See [Cloud Agent Delegation Guide](../docs/CLOUD_AGENT_DELEGATION.md) for comprehensive documentation.

## Running Examples

### API Client Example
```bash
# Set your API key
export FAL_API_KEY="your-key-here"

# Run the example
node examples/use_api_client.js
```

### Cloud Agent Delegation
```bash
# Set OpenAI API key
export OPENAI_API_KEY=your-openai-key

# Optional: Set Apidog token for MCP integration
export APIDOG_ACCESS_TOKEN=your-token

# Run the agent demo
npm run agent:delegate
# or
npm run agent:demo
```

## What You'll Learn

### From `use_api_client.js`
- Direct API client usage
- Type-safe API calls
- Error handling patterns

### From `cloud-agent-delegation.ts`
- Multi-agent orchestration
- Intelligent decision making
- Cost-aware model selection
- Agent handoffs and coordination
- Tool implementation patterns
- Production deployment strategies

## Client Regeneration

If the OpenAPI spec changes, regenerate the client:

```bash
npm run apidog:pull          # Pull latest spec from Apidog
npm run oas:sync             # Copy to openapi/
npm run generate:client      # Regenerate TypeScript client
```

## Adding New Examples

1. Create a new `.js` or `.ts` file in this directory
2. Import the client: `import { ApiClient } from '../apis/client';`
3. Document what the example demonstrates
4. Add to this README
5. Add npm script to `package.json` if needed

## Documentation

- **Cloud Agent Delegation**: [docs/CLOUD_AGENT_DELEGATION.md](../docs/CLOUD_AGENT_DELEGATION.md)
- **API Hub Guide**: [docs/API_HUB_README.md](../docs/API_HUB_README.md)
- **MCP Configuration**: [docs/MCP_CONFIGURATION.md](../docs/MCP_CONFIGURATION.md)
- **Architecture**: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
