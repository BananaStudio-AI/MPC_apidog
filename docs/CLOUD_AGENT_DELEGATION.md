# Cloud Agent Delegation Guide

## Overview

Cloud agent delegation enables you to orchestrate complex AI workflows using OpenAI Agents that can access the BananaStudio API Hub. This approach provides:

- **Intelligent orchestration**: Agents coordinate between different AI models
- **Cost optimization**: Automatic selection of cost-effective models
- **Multi-agent workflows**: Specialized agents handle specific tasks
- **MCP integration**: Direct access to API Hub through Model Context Protocol

## Architecture

```
┌─────────────────────────────────────────────────────┐
│          BananaStudio Cloud Orchestrator            │
│              (Main Entry Point)                     │
└────────────┬───────────────────────┬────────────────┘
             │                       │
     ┌───────▼────────┐     ┌───────▼──────────┐
     │ Model Selection│     │ Cost Optimization│
     │     Agent      │     │      Agent       │
     └───────┬────────┘     └───────┬──────────┘
             │                       │
             └───────────┬───────────┘
                         │
          ┌──────────────▼──────────────┐
          │    BananaStudio API Hub     │
          │  (MCP Server Integration)   │
          └──────────────┬──────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Comet   │    │   FAL   │    │  Model  │
    │   API   │    │   API   │    │Registry │
    │568 LLMs │    │866 Models│   │1434 Total│
    └─────────┘    └─────────┘    └─────────┘
```

## Core Concepts

### 1. Agent Hierarchy

**Orchestrator Agent** (Top Level)
- Entry point for all requests
- Coordinates between specialized agents
- Maintains conversation context
- Routes tasks to appropriate specialists

**Specialized Agents** (Task-Specific)
- **Model Selection Agent**: Chooses optimal AI models based on requirements
- **Cost Optimization Agent**: Analyzes and reduces operational costs
- **Analytics Agent**: Provides insights on usage patterns (future)
- **Pipeline Agent**: Creates multi-step AI workflows (future)

### 2. Handoffs

Agents use **handoffs** to transfer control:
```typescript
const orchestrator = Agent.create({
  name: 'Main Orchestrator',
  handoffs: [modelSelectionAgent, costOptimizationAgent],
  instructions: 'Route requests to specialists...'
});
```

When the orchestrator encounters a specialized task, it hands off to the appropriate agent.

### 3. Tools

Agents have access to **tools** (functions) that interact with the API Hub:

- `get_comet_models`: Query 568 LLMs from Comet API
- `get_fal_models`: Query 866 creative models from FAL
- `estimate_model_cost`: Calculate usage costs
- `analyze_model_registry`: Intelligent model selection

### 4. MCP Integration

Tools can connect to the **Apidog MCP Server** for real-time data:

```typescript
// Connect to MCP server
const mcpClient = await Client.connect({
  command: 'npx',
  args: ['-y', 'apidog-mcp-server@latest', '--project-id=1128155'],
  env: { APIDOG_ACCESS_TOKEN: process.env.APIDOG_ACCESS_TOKEN }
});

// Use MCP tools in agent functions
const result = await mcpClient.request({
  method: 'tools/call',
  params: { name: 'list_comet_models' }
});
```

## Quick Start

### Prerequisites

```bash
# Required environment variables
export OPENAI_API_KEY=your-openai-key
export APIDOG_ACCESS_TOKEN=your-apidog-token
export APIDOG_PROJECT_ID=1128155
```

### Run the Example

```bash
# Install dependencies (if not already done)
npm install

# Run the cloud agent delegation example
npx tsx examples/cloud-agent-delegation.ts
```

### Expected Output

```
╔═══════════════════════════════════════════════════════╗
║   BananaStudio Cloud Agent Delegation Demo          ║
║   Multi-Agent AI Orchestration with API Hub         ║
╚═══════════════════════════════════════════════════════╝

=== Example 1: Model Selection ===

Response: For an image generation service handling 1000 images per day, 
I recommend using fal-ai/flux/dev at $0.025 per image. Total daily cost: 
$25.00, monthly cost: $750.00. This model provides excellent quality with 
reasonable pricing...

Run details: { turns: 8, tokensUsed: { input: 2450, output: 890 } }

=== Example 2: Cost Optimization ===

Response: To reduce costs while maintaining quality, consider batch processing 
to negotiate volume discounts, implementing caching for common requests, and 
evaluating fal-ai/stable-diffusion-xl which costs 40% less...

✅ All examples completed successfully!
```

## Use Cases

### 1. Smart Model Selection

**Scenario**: User needs to choose between 1,434 available models.

```typescript
const result = await run(
  orchestratorAgent,
  'I need to generate marketing images for social media. Quality is important but I have a limited budget.'
);
```

**Agent Flow**:
1. Orchestrator receives request
2. Hands off to Model Selection Agent
3. Agent queries FAL models with `get_fal_models`
4. Agent analyzes requirements with `analyze_model_registry`
5. Agent estimates costs with `estimate_model_cost`
6. Returns recommendation with rationale

### 2. Cost Optimization

**Scenario**: User wants to reduce AI operational costs.

```typescript
const result = await run(
  orchestratorAgent,
  'I\'m spending $500/month on image generation. Can you analyze my usage and suggest optimizations?'
);
```

**Agent Flow**:
1. Orchestrator routes to Cost Optimization Agent
2. Agent analyzes current usage patterns
3. Agent compares alternative models
4. Agent calculates potential savings
5. Returns optimization strategy

### 3. Multi-Modal Workflows

**Scenario**: User needs multiple AI capabilities.

```typescript
const result = await run(
  orchestratorAgent,
  'Build a content creation pipeline: chatbot for ideation, image generation for visuals, and video creation for final output.'
);
```

**Agent Flow**:
1. Orchestrator coordinates multiple handoffs
2. Model Selection Agent chooses best LLM for chat
3. Model Selection Agent chooses image generator
4. Model Selection Agent chooses video model
5. Cost Optimization Agent validates budget
6. Returns complete pipeline specification

## Integration with MCP Server

### Connect to Live API Hub Data

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Initialize MCP client
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', 'apidog-mcp-server@latest', '--project-id=1128155'],
  env: { APIDOG_ACCESS_TOKEN: process.env.APIDOG_ACCESS_TOKEN }
});

const mcpClient = new Client({
  name: 'bananastudio-agent',
  version: '1.0.0',
}, { capabilities: {} });

await mcpClient.connect(transport);

// Create tool that uses MCP
const liveModelsTool = tool({
  name: 'get_live_models',
  description: 'Get real-time model data from API Hub via MCP',
  parameters: z.object({}),
  execute: async () => {
    const result = await mcpClient.request({
      method: 'tools/call',
      params: { name: 'list_api_hub_endpoints', arguments: {} }
    });
    return result;
  },
});
```

### Agent with MCP Tools

```typescript
const mcpAgent = new Agent({
  name: 'MCP-Connected Agent',
  instructions: 'You have access to live API Hub data through MCP',
  tools: [liveModelsTool, /* other MCP-based tools */],
});
```

## Deployment Options

### 1. Local Development

Run agents locally during development:

```bash
npx tsx examples/cloud-agent-delegation.ts
```

### 2. Cloud Deployment

Deploy to cloud platforms for 24/7 availability:

**Vercel Edge Functions**:
```typescript
// api/agent.ts
import { orchestratorAgent } from '../lib/agents';

export default async function handler(req: Request) {
  const { message } = await req.json();
  const result = await run(orchestratorAgent, message);
  return new Response(JSON.stringify(result));
}
```

**AWS Lambda**:
```typescript
// lambda/handler.ts
export const handler = async (event: any) => {
  const { message } = JSON.parse(event.body);
  const result = await run(orchestratorAgent, message);
  return { statusCode: 200, body: JSON.stringify(result) };
};
```

### 3. Container Deployment

```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npx", "tsx", "examples/cloud-agent-delegation.ts"]
```

## Monitoring & Tracing

OpenAI Agents SDK provides built-in tracing:

```typescript
import { run } from '@openai/agents';

const result = await run(orchestratorAgent, 'Your message', {
  // Enable detailed tracing
  tracer: console.log,
});

// Access run metadata
console.log('Total turns:', result.runContext.messages.length);
console.log('Token usage:', result.runContext.usage);
console.log('Tool calls:', result.runContext.toolCalls);
```

### Integration with Observability Tools

```typescript
// Send traces to observability platform
import * as Sentry from '@sentry/node';

const result = await run(orchestratorAgent, message, {
  tracer: (event) => {
    Sentry.addBreadcrumb({
      category: 'agent',
      message: `${event.type}: ${event.data}`,
      level: 'info',
    });
  },
});
```

## Best Practices

### 1. Agent Design

- **Single Responsibility**: Each agent handles one domain
- **Clear Handoff Descriptions**: Help orchestrator choose correctly
- **Comprehensive Instructions**: Guide agent behavior explicitly

### 2. Tool Implementation

- **Idempotent**: Tools should be safe to retry
- **Fast**: Keep tool execution under 30 seconds
- **Error Handling**: Return structured errors, not exceptions
- **Validation**: Use Zod schemas for type safety

### 3. Cost Management

- **Set Max Turns**: Prevent infinite loops
  ```typescript
  const result = await run(agent, message, { maxTurns: 10 });
  ```

- **Monitor Token Usage**: Track costs per run
  ```typescript
  console.log('Cost estimate:', result.runContext.usage);
  ```

- **Cache Results**: Reuse expensive computations

### 4. Security

- **Environment Variables**: Never hardcode API keys
- **Input Validation**: Sanitize user inputs
- **Rate Limiting**: Protect against abuse
- **Guardrails**: Use built-in safety checks
  ```typescript
  const agent = new Agent({
    guardrails: {
      inputGuardrail: async (input) => {
        if (input.includes('malicious')) throw new Error('Blocked');
      }
    }
  });
  ```

## Troubleshooting

### Common Issues

**Error: OPENAI_API_KEY not set**
```bash
export OPENAI_API_KEY=sk-...
```

**Error: MCP connection failed**
```bash
# Verify Apidog token
export APIDOG_ACCESS_TOKEN=your-token
npm run apidog:auth-check
```

**Error: Max turns exceeded**
```typescript
// Increase max turns or simplify agent logic
const result = await run(agent, message, { maxTurns: 20 });
```

**Error: Tool execution timeout**
```typescript
// Optimize tool implementation or use async processing
const tool = tool({
  execute: async (input) => {
    // Add timeout
    const result = await Promise.race([
      expensiveOperation(input),
      timeout(25000),
    ]);
    return result;
  }
});
```

## Next Steps

1. **Explore Examples**: Run `npx tsx examples/cloud-agent-delegation.ts`
2. **Create Custom Agents**: Define agents for your specific use cases
3. **Integrate MCP**: Connect agents to live API Hub data
4. **Deploy to Cloud**: Set up serverless functions for production
5. **Monitor Performance**: Add tracing and observability
6. **Scale Up**: Handle high-volume agent orchestration

## Resources

- [OpenAI Agents SDK Documentation](https://openai.github.io/openai-agents-js)
- [Apidog MCP Server](https://www.npmjs.com/package/apidog-mcp-server)
- [BananaStudio API Hub](../README.md)
- [MCP Configuration Guide](./MCP_CONFIGURATION.md)
- [API Hub Architecture](./ARCHITECTURE.md)

## Support

For questions or issues:
- **GitHub Issues**: [BananaStudio/MPC_apidog](https://github.com/BananaStudio/MPC_apidog/issues)
- **Email**: support@bananastudio.ai
- **Documentation**: [docs/](../docs/)
