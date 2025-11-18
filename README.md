# BananaStudio AI Infrastructure

Complete local Docker-based AI infrastructure for Windows featuring **Dify**, **Langflow**, **Activepieces**, **LiteLLM Gateway**, and **MPC-API** - replacing cloud-centric Apidog/OpenAPI architecture with local model orchestration.

## 🚀 Quick Start

### Prerequisites
- **Windows 10/11** with WSL 2
- **Docker Desktop** (with 8GB+ RAM allocated)
- **PowerShell 5.1+**

### Setup

```powershell
# Clone repository
git clone https://github.com/BananaStudio-AI/MPC_apidog.git
cd MPC_apidog

# Configure environment
copy .env.example .env
# Edit .env with your API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)

# Configure MPC-API
cd mpc-api
copy .env.example .env
cd ..

# Start all services
cd ai-infra
.\ai-infra-manage.ps1 -Action start
```

### Access Services

- **Dify**: http://localhost - AI workflow orchestration
- **Langflow**: http://localhost:7860 - Visual flow builder
- **Activepieces**: http://localhost:8080 - Workflow automation
- **LiteLLM Gateway**: http://localhost:4000 - Unified model API
- **MPC-API**: http://localhost:3000 - Custom API gateway

## 📚 Documentation

### AI Infrastructure (New)
- **[Setup Guide](ai-infra/AI_INFRA_SETUP.md)** - Complete setup instructions for Windows + Docker
- **[Quick Reference](ai-infra/QUICK_REFERENCE.md)** - Commands, URLs, and API examples
- **[Deployment Checklist](ai-infra/DEPLOYMENT_CHECKLIST.md)** - Validation and testing guide
- **[New Architecture](ai-infra/ARCHITECTURE_NEW.md)** - Docker infrastructure design
- **[Current Architecture Analysis](ai-infra/ARCHITECTURE_CURRENT.md)** - Migration context

### Legacy Documentation (Reference)
- **[API Hub v2.0 Guide](docs/API_HUB_V2_RESTRUCTURE.md)** - Historical API management
- **[MCP Configuration](docs/MCP_CONFIGURATION.md)** - Apidog MCP setup (deprecated)
- **[Legacy Apidog Tools](legacy/README.md)** - Deprecated Apidog scripts

## 🔑 Key Features

- **Complete Local Stack**: All AI services run locally on Windows via Docker Desktop
- **LiteLLM Gateway**: Unified interface for OpenAI, Anthropic, and 100+ model providers
- **AI Orchestration**: Dify for agents, Langflow for visual flows, Activepieces for automation
- **MPC-API**: Custom TypeScript/Express.js gateway proxying to LiteLLM
- **Docker Management**: PowerShell script for easy start/stop/status/logs
- **Model Registry**: Preserved 1,434-model catalog from FAL and Comet APIs (legacy)

## 🏗️ Project Structure

```
├── ai-infra/                 # Docker infrastructure (NEW)
│   ├── dify/                 # Dify AI orchestration platform
│   ├── langflow/             # Langflow visual builder
│   ├── activepieces/         # Activepieces workflow automation
│   ├── litellm/              # LiteLLM gateway configuration
│   ├── ai-infra-manage.ps1   # PowerShell management script
│   └── *.md                  # Setup and reference docs
├── mpc-api/                  # Custom API gateway (NEW)
│   ├── src/                  # TypeScript source code
│   ├── Dockerfile            # Container build definition
│   └── docker-compose.yml    # Service configuration
├── legacy/                   # Deprecated Apidog tools
│   └── apidog/               # Moved from root (not used in runtime)
├── apis/                     # Generated clients (legacy reference)
├── openapi/                  # OpenAPI specs (documentation only)
├── scripts/                  # Model catalog sync scripts (legacy)
└── data/                     # Model registry (historical)
```

## 🔧 Available Commands

### Infrastructure Management (PowerShell)
```powershell
cd ai-infra

# Start all services
.\ai-infra-manage.ps1 -Action start

# Stop all services
.\ai-infra-manage.ps1 -Action stop

# Check status
.\ai-infra-manage.ps1 -Action status

# View logs
.\ai-infra-manage.ps1 -Action logs -Service mpc-api
```

### Legacy Scripts (npm - Documentation Only)
```bash
# Model catalog sync (consider updating to use LiteLLM)
npm run sync:model-registry      # Fetch model catalog
npm run health:api-hub           # Validate API connectivity

# Legacy Apidog integration (not used in runtime)
npm run legacy:apidog:pull       # Pull OpenAPI specs from Apidog
npm run legacy:apidog:list-tools # List MCP tools
```

## 🌐 API Endpoints

### MPC-API (http://localhost:3000)
- `GET /health` - Health check (includes LiteLLM connectivity)
- `GET /api/models` - List available models from LiteLLM
- `POST /api/chat/completions` - Chat completions (proxies to LiteLLM)

### LiteLLM Gateway (http://localhost:4000)
- `GET /models` - List configured models
- `POST /chat/completions` - OpenAI-compatible chat completions
- `POST /completions` - Text completions
- `POST /embeddings` - Generate embeddings
- `GET /health` - Gateway health status

### Example: Chat Completion via MPC-API
```powershell
$body = @{
    model = "gpt-4o-mini"
    messages = @(@{ role = "user"; content = "Hello!" })
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/chat/completions" -Method POST -Body $body -ContentType "application/json"
```

## 📦 Environment Variables

### Root `.env` (for legacy scripts)
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
FAL_API_KEY=...          # Optional, for legacy model catalog sync
COMET_API_KEY=...        # Optional, for legacy model catalog sync
```

### `mpc-api/.env` (for API service)
```bash
PORT=3000
LITELLM_BASE_URL=http://litellm:4000
LITELLM_MASTER_KEY=sk-1234
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### `litellm_config.yaml` (model configuration)
Edit to add/remove model providers. See [Quick Reference](ai-infra/QUICK_REFERENCE.md).

## 🎯 Use Cases

- **Local AI Development**: Complete AI stack without cloud dependencies
- **Multi-Agent Workflows**: Build complex agents with Dify
- **Visual Flow Design**: Create AI applications with Langflow
- **Process Automation**: Automate business workflows with Activepieces
- **Unified Model Access**: Call any LLM provider through LiteLLM Gateway
- **Cost Control**: Local execution, external API calls only for model inference

## 🔄 Migration from Apidog

This repository has been refactored from cloud API management to local infrastructure:

**What's New**:
- ✅ Complete Docker infrastructure for local deployment
- ✅ LiteLLM Gateway for unified model provider access
- ✅ MPC-API custom gateway service
- ✅ AI orchestration platforms (Dify, Langflow, Activepieces)

**What's Deprecated**:
- ❌ Apidog MCP runtime dependencies (moved to `legacy/`)
- ❌ Direct external API calls (now via LiteLLM)
- ❌ Cloud-centric architecture

**What's Preserved**:
- ✅ OpenAPI specifications (documentation reference)
- ✅ Model registry data (historical catalog)
- ✅ TypeScript client generation tools (optional use)

See [ARCHITECTURE_NEW.md](ai-infra/ARCHITECTURE_NEW.md) for complete migration details.

---

**Version:** 3.0.0 (Local Infrastructure)  
**Status:** ✅ Ready for Deployment  
**Updated:** November 2025