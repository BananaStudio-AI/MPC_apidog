# BananaStudio API Hub

AI-driven creative pipeline integrating **Comet API** (568 LLMs) and **FAL Platform** (866 creative models) with unified OpenAPI specification, TypeScript client, and MCP server integration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Generate TypeScript client
npm run generate:api-hub-client

# Sync model registry
npm run sync:model-registry

# Validate APIs
npm run health:api-hub
```

## 📚 Documentation

- **[API Hub v2.0 Guide](docs/API_HUB_V2_RESTRUCTURE.md)** - Complete restructure and usage guide
- **[API Hub README](docs/API_HUB_README.md)** - Usage examples for BananaStudio agents
- **[MCP Configuration](docs/MCP_CONFIGURATION.md)** - VS Code/Cursor MCP setup
- **[Production Checklist](docs/PRODUCTION_CHECKLIST.md)** - Deployment validation
- **[Architecture](docs/ARCHITECTURE.md)** - System design and patterns
- **[AI Providers & Platform Stack](docs/AI_PROVIDERS_AND_PLATFORM_STACK.md)** - Canonical provider and platform stack

### MPC-API Backend and Model Brain v1.0

MPC-API is the central gateway for all model traffic in this project. It exposes a Node.js + TypeScript Express backend on port `3000`, backed by a typed model catalog and an orchestration endpoint for job-type workflows. All tools and automations (including Dify, Langflow, Activepieces, and internal scripts) are expected to route model calls through MPC-API, which in turn proxies to LiteLLM.

The recommended deployment is via Docker, with MPC-API and LiteLLM running together on the shared `ai-infra-net` Docker network. MPC-API listens on `3000:3000`, LiteLLM listens on `4000:4000`, and MPC-API talks to LiteLLM at `http://litellm:4000` inside the network.

Supported and planned providers include OpenAI, Anthropic, Google, Mistral, Groq, Comet API, FAL, Replicate, HF Inference, DeepInfra, Together.ai, OpenRouter, and other HTTP providers — all routed via LiteLLM behind MPC-API. For a full list of supported and planned providers, see [docs/PROVIDER_INTEGRATION_MATRIX.md](docs/PROVIDER_INTEGRATION_MATRIX.md).

[See docs/MODEL_BRAIN_ARCHITECTURE.md for full architecture details.](docs/MODEL_BRAIN_ARCHITECTURE.md)

## 🔑 Key Features

- **Strict Provider Separation**: `/comet/*` for LLMs, `/fal/*` for creative models
- **TypeScript Client**: Auto-generated from OpenAPI 3.1 spec with full type safety
- **Model Registry**: Unified 1,434-model catalog with semantic search capabilities
- **MCP Integration**: Apidog MCP server for automated API management
- **Health Monitoring**: Built-in connectivity and data integrity validation

## 🏗️ Project Structure

```
├── apis/
│   ├── api-hub-client/      # Generated TypeScript client
│   └── model_registry/       # Unified model catalog service
├── openapi/
│   └── api-hub.oas.json     # Canonical OpenAPI spec (v2.0.0)
├── scripts/                  # Automation and sync scripts
├── docs/                     # Comprehensive documentation
└── data/
    └── model_registry.json  # 1,434 unified model records
```

## 🔧 Available Commands

```bash
# API Management
npm run generate:api-hub-client  # Regenerate TypeScript client
npm run sync:model-registry      # Fetch and sync model catalog
npm run health:api-hub           # Validate API connectivity

# Apidog Integration
npm run push:apidog              # Push OAS to Apidog project
npm run apidog:list-tools        # List available MCP tools
npm run apidog:pull              # Pull latest OAS from Apidog
```

## 🌐 Endpoints

### Comet API (LLMs)
- `GET /comet/models` - List 568 language models

### FAL Platform (Creative AI)
- `GET /fal/models` - List 866 creative models
- `GET /fal/models/pricing` - Get pricing information
- `POST /fal/models/pricing/estimate` - Estimate costs
- `GET /fal/models/usage` - Usage statistics
- `GET /fal/models/analytics` - Performance metrics

## 📦 Environment Variables

```bash
COMET_API_KEY=your_comet_key
FAL_API_KEY=your_fal_key
APIDOG_ACCESS_TOKEN=your_apidog_token
APIDOG_PROJECT_ID=1128155
```

## 🎯 Use Cases

- **Agent Selection**: Unified model registry for AI orchestration
- **Cost Optimization**: Pricing estimation and usage tracking
- **Workflow Automation**: MCP-driven API management
- **Creative Pipelines**: FAL platform integration for generative AI
- **LLM Gateway**: Comet API for language model access

---

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Updated:** November 16, 2025
