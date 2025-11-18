# BananaStudio AI Infrastructure

**Local-first Docker-based AI infrastructure** running on Windows with Docker Desktop (1TB).

Fully local AI stack with **Dify**, **Langflow**, **Activepieces**, **LiteLLM Gateway**, and **MPC-API** - no cloud dependencies.

## 🚀 Quick Start

### Prerequisites
- Windows with Docker Desktop
- At least 1TB storage
- API keys for LLM providers (OpenAI, Anthropic, etc.)

### Setup

```bash
# 1. Configure environment
cp .env.template .env
# Edit .env and add your API keys

# 2. Start all services (PowerShell)
cd ai-infra
.\ai-infra-manage.ps1 -Action start -Service all

# 3. Check status
.\ai-infra-manage.ps1 -Action status

# 4. Run integration tests
cd ..
node test_mpc_api_litellm.mjs
```

### Access Services
- **Dify**: http://localhost
- **Langflow**: http://localhost:7860
- **Activepieces**: http://localhost:8080
- **LiteLLM Gateway**: http://localhost:4000
- **MPC-API**: http://localhost:3000

## 📚 Documentation

### Core Infrastructure
- **[AI Infrastructure](ai-infra/README.md)** - Docker services setup and management
- **[MPC-API](mpc-api/README.md)** - Express.js proxy service to LiteLLM
- **[Local Architecture](docs/LOCAL_INFRASTRUCTURE.md)** - System design and patterns

### Legacy Content
- **[Legacy Apidog](legacy/apidog/README.md)** - Original cloud-based API Hub (deprecated)
- **[API Hub v2.0 Guide](docs/API_HUB_V2_RESTRUCTURE.md)** - Historical reference
- **[MCP Configuration](docs/MCP_CONFIGURATION.md)** - VS Code/Cursor MCP setup

## 🔑 Key Features

- **Local-First Architecture**: All services run locally on Docker Desktop - no cloud dependencies
- **Unified LLM Gateway**: LiteLLM provides consistent API for OpenAI, Anthropic, and more
- **Service Orchestration**: MPC-API proxies all model calls through LiteLLM
- **Visual Workflows**: Langflow for drag-and-drop AI pipeline building
- **Automation Platform**: Activepieces for workflow automation
- **LLM App Development**: Dify for building LLM applications
- **Docker Networking**: All services communicate over shared `ai-infra-net` network

## 🏗️ Architecture

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Dify      │  │   Langflow   │  │ Activepieces │
│  (Port 80)   │  │  (Port 7860) │  │  (Port 8080) │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       └─────────────────┼──────────────────┘
                         │
                ┌────────▼─────────┐
                │     MPC-API      │
                │   (Port 3000)    │
                └────────┬─────────┘
                         │
                ┌────────▼─────────┐
                │ LiteLLM Gateway  │
                │   (Port 4000)    │
                └────────┬─────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼────┐    ┌─────▼──────┐   ┌────▼────┐
    │ OpenAI │    │ Anthropic  │   │ Others  │
    └────────┘    └────────────┘   └─────────┘
```

### Service Routing

All model calls **must** go through LiteLLM Gateway:
1. Application → MPC-API → LiteLLM → Provider
2. No direct provider API calls
3. Consistent authentication and rate limiting
4. Unified logging and monitoring

## 🔧 Management Commands

### PowerShell (Windows)

```powershell
cd ai-infra

# Start all services
.\ai-infra-manage.ps1 -Action start -Service all

# Stop all services
.\ai-infra-manage.ps1 -Action stop -Service all

# Check status
.\ai-infra-manage.ps1 -Action status

# View logs
.\ai-infra-manage.ps1 -Action logs -Service mpc-api -Follow

# Health checks
.\ai-infra-manage.ps1 -Action health

# Clean up (removes volumes)
.\ai-infra-manage.ps1 -Action clean
```

### Docker Compose

```bash
# Start individual services
cd ai-infra/litellm && docker compose up -d
cd ai-infra/mpc-api && docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Integration Testing

```bash
# Test MPC-API → LiteLLM connectivity
node test_mpc_api_litellm.mjs

# Test with custom URLs
MPC_API_URL=http://localhost:3000 \
LITELLM_URL=http://localhost:4000 \
node test_mpc_api_litellm.mjs
```

## 🌐 API Endpoints

### MPC-API (Port 3000)

```bash
# Health check
GET /health

# List available models
GET /api/models

# Chat completions (proxied to LiteLLM)
POST /api/chat/completions
Content-Type: application/json

{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

### LiteLLM Gateway (Port 4000)

OpenAI-compatible API:
- `GET /models` - List models
- `POST /chat/completions` - Chat completions
- `POST /completions` - Text completions
- `POST /embeddings` - Generate embeddings
- `GET /health` - Health check

## 📦 Environment Variables

See `.env.template` for all configuration options.

### Required Variables

```bash
# LLM Provider Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# LiteLLM Configuration
LITELLM_BASE_URL=http://litellm:4000
LITELLM_MASTER_KEY=optional-auth-key

# Database (shared across services)
POSTGRES_PASSWORD=postgres
```

### Optional Variables

```bash
# Service-specific secrets
DIFY_SECRET_KEY=change-me
ACTIVEPIECES_API_KEY=change-me
ACTIVEPIECES_ENCRYPTION_KEY=change-me
ACTIVEPIECES_JWT_SECRET=change-me

# Redis password (optional)
REDIS_PASSWORD=
```

## 🎯 Use Cases

- **Local AI Development**: Build and test AI applications without cloud dependencies
- **Multi-Provider Access**: Single API for OpenAI, Anthropic, and other providers
- **Workflow Automation**: Orchestrate complex AI workflows with Activepieces
- **Visual AI Pipelines**: Create AI flows with Langflow's drag-and-drop interface
- **LLM App Building**: Develop production LLM apps with Dify
- **Cost Optimization**: Track and control AI spending through centralized gateway
- **Privacy & Security**: Keep all data and API calls within your local network

## 🔄 Migration from Cloud

This repository has been migrated from a cloud-centric Apidog/OpenAPI architecture to a fully local Docker-based infrastructure.

**Legacy content** is preserved in `legacy/apidog/` for reference.

**Key changes:**
- ✅ All services now run locally on Docker
- ✅ Model calls route through LiteLLM (no direct provider calls)
- ✅ MPC-API provides unified proxy layer
- ✅ Docker networking replaces cloud API orchestration
- ✅ PowerShell management script for Windows

See [Legacy Apidog README](legacy/apidog/README.md) for historical context.

---

**Version:** 2.0.0 (Local Infrastructure)  
**Status:** ✅ Production Ready  
**Platform:** Windows Docker Desktop  
**Updated:** November 18, 2025