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

## 🐳 Docker Infrastructure (New!)

Run the complete AI infrastructure stack with Docker:

```bash
# Start all services (LiteLLM Gateway + MPC-API + Redis)
.\ai-infra-manage.ps1 up

# Check service health
.\ai-infra-manage.ps1 health

# View logs
.\ai-infra-manage.ps1 logs -Follow

# Stop services
.\ai-infra-manage.ps1 down
```

**Services:**
- **LiteLLM Gateway** (Port 4000) - Unified LLM provider proxy
- **MPC-API** (Port 3000) - Content generation API
- **Redis** (Port 6379) - Caching and rate limiting

See **[ai-infra/README.md](ai-infra/README.md)** for full infrastructure documentation.

## 📚 Documentation

- **[New Infrastructure Architecture](docs/ARCHITECTURE_NEW.md)** - Docker services and deployment
- **[AI Infrastructure Guide](ai-infra/README.md)** - Service management and API usage
- **[LiteLLM Config Examples](ai-infra/litellm/config/README.md)** - Provider configurations
- **[API Hub v2.0 Guide](docs/API_HUB_V2_RESTRUCTURE.md)** - Complete restructure and usage guide
- **[API Hub README](docs/API_HUB_README.md)** - Usage examples for BananaStudio agents
- **[MCP Configuration](docs/MCP_CONFIGURATION.md)** - VS Code/Cursor MCP setup
- **[Production Checklist](docs/PRODUCTION_CHECKLIST.md)** - Deployment validation
- **[Architecture](docs/ARCHITECTURE.md)** - System design and patterns

## 🔑 Key Features

- **Strict Provider Separation**: `/comet/*` for LLMs, `/fal/*` for creative models
- **TypeScript Client**: Auto-generated from OpenAPI 3.1 spec with full type safety
- **Model Registry**: Unified 1,434-model catalog with semantic search capabilities
- **MCP Integration**: Apidog MCP server for automated API management
- **Health Monitoring**: Built-in connectivity and data integrity validation

## 🏗️ Project Structure

```
├── ai-infra/                 # Docker infrastructure (NEW!)
│   ├── litellm/             # LiteLLM Gateway configs
│   │   └── config/          # Provider-specific configs
│   └── mpc-api/             # MPC-API service
├── apis/
│   ├── api-hub-client/      # Generated TypeScript client
│   └── model_registry/      # Unified model catalog service
├── openapi/
│   └── api-hub.oas.json     # Canonical OpenAPI spec (v2.0.0)
├── scripts/                 # Automation and sync scripts
├── docs/                    # Comprehensive documentation
├── data/
│   └── model_registry.json  # 1,434 unified model records
├── docker-compose.yml       # Service orchestration (NEW!)
└── ai-infra-manage.ps1      # Infrastructure management script (NEW!)
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
# API Hub
COMET_API_KEY=your_comet_key
FAL_API_KEY=your_fal_key
APIDOG_ACCESS_TOKEN=your_apidog_token
APIDOG_PROJECT_ID=1128155

# Docker Infrastructure (NEW!)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LITELLM_MASTER_KEY=your-master-key
MPC_API_KEY=your-api-key
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