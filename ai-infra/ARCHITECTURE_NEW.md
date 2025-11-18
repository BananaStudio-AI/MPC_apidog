# New Architecture - Local Docker Infrastructure

## Overview

The repository has been refactored from a cloud-centric Apidog/OpenAPI management tool into a complete local Docker-based AI infrastructure stack. All services now run locally on Windows with Docker Desktop, with LiteLLM Gateway serving as the central interface for model provider calls.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Windows Host (Docker Desktop)                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Docker Network: ai-infra-net                   │ │
│  │                                                              │ │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │ │
│  │  │   Dify       │   │  Langflow    │   │ Activepieces │   │ │
│  │  │   :80        │   │   :7860      │   │   :8080      │   │ │
│  │  │              │   │              │   │              │   │ │
│  │  │ AI workflow  │   │ Visual flow  │   │ Workflow     │   │ │
│  │  │ orchestrator │   │ builder      │   │ automation   │   │ │
│  │  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │ │
│  │         │                  │                  │            │ │
│  │         │                  │                  │            │ │
│  │         └──────────────────┼──────────────────┘            │ │
│  │                            │                               │ │
│  │                    ┌───────▼────────┐                      │ │
│  │                    │  LiteLLM       │                      │ │
│  │                    │  Gateway       │                      │ │
│  │                    │  :4000         │                      │ │
│  │                    │                │                      │ │
│  │                    │ Unified model  │                      │ │
│  │                    │ provider API   │                      │ │
│  │                    └───────┬────────┘                      │ │
│  │                            │                               │ │
│  │                    ┌───────▼────────┐                      │ │
│  │                    │  MPC-API       │                      │ │
│  │                    │  :3000         │                      │ │
│  │                    │                │                      │ │
│  │                    │ Express.js API │                      │ │
│  │                    │ (proxies to    │                      │ │
│  │                    │  LiteLLM)      │                      │ │
│  │                    └────────────────┘                      │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │ External API calls
                                │ (via LiteLLM)
                                ▼
                ┌───────────────────────────────┐
                │  External Model Providers     │
                │                                │
                │  • OpenAI (GPT models)        │
                │  • Anthropic (Claude)         │
                │  • Cohere, Replicate, etc.    │
                └───────────────────────────────┘
```

## Service Breakdown

### 1. Dify (Port 80)
**Purpose**: AI workflow orchestration and agent builder platform

**Components**:
- PostgreSQL database (internal)
- Redis cache (internal)
- API backend (port 5001, internal)
- Web frontend (port 3000, internal)
- Nginx reverse proxy (port 80, exposed)

**Key Features**:
- Visual agent/workflow builder
- Multi-agent orchestration
- Built-in prompt engineering tools
- Model provider management

**Access**: http://localhost

**Integration**:
- Can call LiteLLM at `http://litellm:4000` for model inference
- Can call MPC-API at `http://mpc-api:3000` for custom endpoints

### 2. Langflow (Port 7860)
**Purpose**: Visual flow-based AI application builder

**Components**:
- Single container with embedded SQLite or external PostgreSQL
- Web UI for flow creation

**Key Features**:
- Drag-and-drop flow builder
- Pre-built components for LLMs, embeddings, agents
- Integration with various model providers
- Export flows as Python code

**Access**: http://localhost:7860

**Integration**:
- Configured to use LiteLLM as default model provider
- Can use custom endpoints (MPC-API) in flows

### 3. Activepieces (Port 8080)
**Purpose**: Workflow automation and integration platform

**Components**:
- PostgreSQL database (internal)
- Redis queue (internal)
- Application server (port 80, exposed as 8080)

**Key Features**:
- 200+ integrations (APIs, databases, services)
- Visual workflow builder
- Triggers, actions, and conditions
- API-driven automation

**Access**: http://localhost:8080

**Integration**:
- Can call MPC-API or LiteLLM for AI operations
- Webhook support for event-driven workflows

### 4. LiteLLM Gateway (Port 4000)
**Purpose**: Unified gateway for multiple LLM providers

**Components**:
- Single lightweight container
- Configuration via YAML file (`litellm_config.yaml`)

**Key Features**:
- OpenAI-compatible API for all providers
- Load balancing and fallback support
- Request logging and analytics
- Rate limiting and cost tracking

**Access**: http://localhost:4000

**Endpoints**:
- `GET /models` - List available models
- `POST /chat/completions` - Chat completions
- `POST /completions` - Text completions
- `POST /embeddings` - Generate embeddings
- `GET /health` - Health check

**Configuration**:
Edit `litellm_config.yaml` to add/modify providers and models

### 5. MPC-API (Port 3000)
**Purpose**: Custom API service that proxies requests to LiteLLM

**Components**:
- Node.js/Express.js server
- TypeScript with type safety
- Pino logger for structured logging

**Key Features**:
- Thin proxy layer over LiteLLM
- Health checks for dependencies
- Request/response logging
- Extensible for custom business logic

**Access**: http://localhost:3000

**Endpoints**:
- `GET /health` - Health check (includes LiteLLM status)
- `GET /api/models` - List models from LiteLLM
- `POST /api/chat/completions` - Chat completions via LiteLLM

**Why MPC-API?**
- Provides a stable internal API that won't change if LiteLLM changes
- Allows custom business logic, authentication, rate limiting
- Can aggregate data from multiple sources
- Maintains compatibility with existing clients

## Data Flow

### Typical Chat Completion Request

```
User Request → Dify/Langflow/Activepieces → MPC-API → LiteLLM → OpenAI/Anthropic
     ↓                                           ↓         ↓           ↓
   Web UI                                    Port 3000  Port 4000   External
                                                ↓         ↓           ↓
                                            Express.js  Proxy      API Call
                                                ↓         ↓           ↓
                                              Logs    Routing     Response
                                                ↓         ↓           ↓
                                            Response ← Response ← Response
```

### Model Provider Selection Flow

1. User selects a model (e.g., "gpt-4o-mini") in Dify/Langflow
2. Request sent to MPC-API: `POST /api/chat/completions`
3. MPC-API forwards to LiteLLM: `POST http://litellm:4000/chat/completions`
4. LiteLLM checks `litellm_config.yaml` for model mapping
5. LiteLLM routes to appropriate provider (e.g., OpenAI)
6. Response flows back through the chain

## Network Architecture

### Docker Network: ai-infra-net
All services are on a shared Docker bridge network, allowing:
- Service discovery by name (e.g., `http://litellm:4000`)
- Isolated communication (not exposed to host by default)
- Explicit port mapping only for external access

### Exposed Ports to Host
- `80` → Dify
- `7860` → Langflow
- `8080` → Activepieces
- `4000` → LiteLLM
- `3000` → MPC-API

### Internal-Only Services
- PostgreSQL databases (Dify, Activepieces)
- Redis caches (Dify, Activepieces)
- Dify API backend (port 5001)
- Dify Web frontend (port 3000)

## Configuration Management

### Environment Variables

**Root `.env`** (for legacy scripts):
```bash
# API keys for direct provider access (if needed)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
FAL_API_KEY=
COMET_API_KEY=

# Legacy Apidog (not used in runtime)
APIDOG_ACCESS_TOKEN=
APIDOG_PROJECT_ID=
```

**`mpc-api/.env`**:
```bash
PORT=3000
NODE_ENV=production
LITELLM_BASE_URL=http://litellm:4000
LITELLM_MASTER_KEY=sk-1234
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

**Service docker-compose files**:
Each service has its own `docker-compose.yml` with environment configuration.

### LiteLLM Model Configuration

Edit `litellm_config.yaml` at repository root:

```yaml
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: ${OPENAI_API_KEY}
  
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: ${ANTHROPIC_API_KEY}
```

After editing, restart LiteLLM:
```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action restart -Service litellm
```

## Data Persistence

### Docker Volumes

All data is persisted in Docker volumes:

**Dify**:
- `dify_db_data` - PostgreSQL database
- `dify_redis_data` - Redis cache
- `dify_app_storage` - File uploads and storage

**Langflow**:
- `langflow_data` - Application data and SQLite database

**Activepieces**:
- `activepieces_db_data` - PostgreSQL database
- `activepieces_redis_data` - Redis queue data
- `activepieces_data` - Application data

**LiteLLM**:
- `litellm_logs` - Request logs

**MPC-API**:
- No persistent volumes (stateless service)

### Backup Strategy

To backup volumes:
```powershell
docker run --rm \
  -v dify_db_data:/data \
  -v ${PWD}/backups:/backup \
  alpine tar czf /backup/dify_db.tar.gz /data
```

## Migration from Old Architecture

### What Changed

**Before (Cloud-Centric)**:
- Apidog MCP server managed API specifications
- Scripts made direct calls to FAL, Comet, OpenAI APIs
- No Docker infrastructure
- No local AI orchestration services

**After (Local Docker)**:
- All services run in Docker on Windows
- LiteLLM Gateway handles all model provider calls
- Dify, Langflow, Activepieces for AI workflows
- MPC-API provides stable API interface
- Apidog scripts moved to `legacy/` folder

### Apidog Status

**Now**: Documentation and reference only
- OpenAPI specs preserved in `openapi/` directory
- Apidog scripts available under `legacy:apidog:*` npm scripts
- No runtime dependencies on Apidog
- Can still pull specs for documentation: `npm run legacy:apidog:pull`

### Model Catalog Scripts

Scripts in `scripts/` like `sync_model_catalog.ts` still work but:
- Should be updated to call through LiteLLM instead of direct APIs
- Currently make direct calls (legacy behavior)
- Not critical for runtime operations

## Management & Operations

### Start/Stop Stack

```powershell
cd ai-infra

# Start all services
.\ai-infra-manage.ps1 -Action start

# Stop all services
.\ai-infra-manage.ps1 -Action stop

# Restart all services
.\ai-infra-manage.ps1 -Action restart

# Check status
.\ai-infra-manage.ps1 -Action status
```

### Individual Service Management

```powershell
# Start specific service
.\ai-infra-manage.ps1 -Action start -Service litellm

# View logs
.\ai-infra-manage.ps1 -Action logs -Service mpc-api

# Restart service
.\ai-infra-manage.ps1 -Action restart -Service dify
```

### Health Monitoring

Each service exposes health endpoints:
- Dify: `http://localhost/health`
- Langflow: `http://localhost:7860/health`
- Activepieces: `http://localhost:8080/api/v1/health`
- LiteLLM: `http://localhost:4000/health`
- MPC-API: `http://localhost:3000/health`

## Development Workflow

### Adding a New Model Provider

1. Add credentials to `.env` files:
   ```bash
   REPLICATE_API_KEY=your-key
   ```

2. Update `litellm_config.yaml`:
   ```yaml
   model_list:
     - model_name: llama-2-70b
       litellm_params:
         model: replicate/meta/llama-2-70b-chat
         api_key: ${REPLICATE_API_KEY}
   ```

3. Restart LiteLLM:
   ```powershell
   .\ai-infra-manage.ps1 -Action restart -Service litellm
   ```

4. Test:
   ```powershell
   curl -X POST http://localhost:4000/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model": "llama-2-70b", "messages": [...]}'
   ```

### Extending MPC-API

1. Add new route in `mpc-api/src/routes/`
2. Update `mpc-api/src/index.ts` to include route
3. Rebuild and restart:
   ```powershell
   cd mpc-api
   npm run build
   docker-compose up -d --build
   ```

### Debugging

View logs in real-time:
```powershell
.\ai-infra-manage.ps1 -Action logs -Service [service-name]
```

Execute commands in container:
```powershell
docker exec -it [container-name] /bin/sh
```

## Security Considerations

### API Keys
- All API keys stored in `.env` files (gitignored)
- LiteLLM master key should be changed from default
- Consider using Docker secrets in production

### Network Isolation
- Internal services (databases, Redis) not exposed to host
- Only necessary ports exposed
- All inter-service communication over private Docker network

### Authentication
- Dify, Langflow, Activepieces have built-in auth
- LiteLLM supports master key authentication
- MPC-API can be extended with auth middleware

## Future Enhancements

### Potential Additions
1. **Monitoring**: Add Prometheus + Grafana for metrics
2. **Logging**: Centralized logging with ELK stack
3. **Model Caching**: Add semantic cache for LiteLLM
4. **Load Balancing**: Multiple LiteLLM instances with load balancer
5. **SSL/TLS**: Add reverse proxy with SSL termination
6. **Database Backup**: Automated backup scripts for volumes

### Migration Considerations
- Update model catalog scripts to use LiteLLM
- Add integration tests for MPC-API
- Create deployment scripts for production
- Document security hardening steps

## Troubleshooting

### Common Issues

**Services won't start**:
- Check Docker Desktop is running
- Verify ports are not in use
- Check logs: `.\ai-infra-manage.ps1 -Action logs -Service [name]`

**Can't connect to LiteLLM**:
- Verify LiteLLM container is running
- Check health endpoint: `curl http://localhost:4000/health`
- Verify API keys are set in environment

**Dify/Langflow can't reach MPC-API**:
- Ensure both are on `ai-infra-net` network
- Use service name (`http://mpc-api:3000`), not `localhost`
- Check network: `docker network inspect ai-infra-net`

## Manual Steps After Cloning

When a team member clones this repository:

1. Install Docker Desktop for Windows
2. Clone repository to local path
3. Copy `.env.example` to `.env` and configure API keys
4. Copy `mpc-api/.env.example` to `mpc-api/.env` and configure
5. Navigate to `ai-infra/` directory
6. Run: `.\ai-infra-manage.ps1 -Action start`
7. Wait 5-10 minutes for initial setup
8. Verify services at URLs listed in Quick Reference

See [AI_INFRA_SETUP.md](./AI_INFRA_SETUP.md) for detailed setup instructions.

---

**Architecture Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: ✅ Ready for Deployment
