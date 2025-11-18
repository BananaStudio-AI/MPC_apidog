# AI Infrastructure

Local Docker-based AI infrastructure for Windows Docker Desktop (1TB storage).

## Services

| Service | Port | Description |
|---------|------|-------------|
| **Dify** | 80 | Open-source LLM app development platform |
| **Dify API** | 5001 | Dify backend API |
| **Langflow** | 7860 | Visual AI workflow builder |
| **Activepieces** | 8080 | Workflow automation platform |
| **LiteLLM Gateway** | 4000 | Unified LLM provider gateway |
| **MPC-API** | 3000 | Express.js proxy service to LiteLLM |

## Architecture

All services communicate over a shared Docker network: `ai-infra-net`

```
┌─────────────────┐
│  Dify (Port 80) │
└─────────────────┘
         │
┌────────▼─────────────┐      ┌──────────────────┐
│ Langflow (Port 7860) │      │ Activepieces     │
└──────────────────────┘      │ (Port 8080)      │
                              └─────────┬────────┘
                                        │
                              ┌─────────▼─────────┐
                              │   MPC-API         │
                              │   (Port 3000)     │
                              └─────────┬─────────┘
                                        │
                              ┌─────────▼─────────┐
                              │  LiteLLM Gateway  │
                              │  (Port 4000)      │
                              └─────────┬─────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
          ┌─────────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
          │   OpenAI API     │ │ Anthropic API  │ │  Other Providers│
          └──────────────────┘ └────────────────┘ └─────────────────┘
```

## Quick Start

### Prerequisites

1. Windows with Docker Desktop installed
2. At least 1TB storage available
3. API keys for LLM providers (OpenAI, Anthropic, etc.)

### Setup

1. **Create environment file:**
   ```bash
   cp ../.env.template ../.env
   # Edit .env and add your API keys
   ```

2. **Start all services:**
   ```powershell
   # Using PowerShell manager
   .\ai-infra-manage.ps1 -Action start -Service all
   
   # Or start individually
   cd dify && docker compose up -d
   cd ../langflow && docker compose up -d
   cd ../activepieces && docker compose up -d
   cd ../litellm && docker compose up -d
   cd ../mpc-api && docker compose up -d
   ```

3. **Check status:**
   ```powershell
   .\ai-infra-manage.ps1 -Action status
   ```

4. **Run health checks:**
   ```powershell
   .\ai-infra-manage.ps1 -Action health
   ```

## Management Script

The PowerShell management script (`ai-infra-manage.ps1`) provides unified control:

```powershell
# Start services
.\ai-infra-manage.ps1 -Action start -Service all
.\ai-infra-manage.ps1 -Action start -Service litellm

# Stop services
.\ai-infra-manage.ps1 -Action stop -Service all

# Restart services
.\ai-infra-manage.ps1 -Action restart -Service mpc-api

# View status
.\ai-infra-manage.ps1 -Action status

# View logs
.\ai-infra-manage.ps1 -Action logs -Service litellm
.\ai-infra-manage.ps1 -Action logs -Service all -Follow

# Health checks
.\ai-infra-manage.ps1 -Action health

# Network info
.\ai-infra-manage.ps1 -Action network

# Clean up (stops all and removes volumes)
.\ai-infra-manage.ps1 -Action clean
```

## Service Details

### Dify

Open-source LLM application development platform.

- **Web UI:** http://localhost
- **API:** http://localhost:5001
- **Location:** `./dify/`

### Langflow

Visual AI workflow builder with drag-and-drop interface.

- **Web UI:** http://localhost:7860
- **Location:** `./langflow/`

### Activepieces

Open-source workflow automation platform (alternative to Zapier).

- **Web UI:** http://localhost:8080
- **Location:** `./activepieces/`

### LiteLLM Gateway

Unified gateway for multiple LLM providers with OpenAI-compatible API.

- **API:** http://localhost:4000
- **Health:** http://localhost:4000/health
- **Models:** http://localhost:4000/models
- **Location:** `./litellm/`
- **Config:** `./litellm/config.yaml`

Supported providers:
- OpenAI (GPT-4o, GPT-4o-mini, GPT-4-turbo)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- Additional providers can be added to config.yaml

### MPC-API

Express.js/TypeScript service that proxies requests to LiteLLM Gateway.

- **API:** http://localhost:3000
- **Health:** http://localhost:3000/health
- **Models:** http://localhost:3000/api/models
- **Chat:** http://localhost:3000/api/chat/completions
- **Location:** `../mpc-api/`

## Network

All services share the `ai-infra-net` Docker network for service-to-service communication.

The network is created automatically when starting services.

Services can communicate using container names:
- `http://litellm:4000` - LiteLLM Gateway
- `http://mpc-api:3000` - MPC-API
- `http://dify-api:5001` - Dify API
- etc.

## Troubleshooting

### Service won't start

```powershell
# Check logs
.\ai-infra-manage.ps1 -Action logs -Service <service-name>

# Restart service
.\ai-infra-manage.ps1 -Action restart -Service <service-name>
```

### Port already in use

Check if another service is using the port:
```powershell
netstat -ano | findstr :<port>
```

### Network issues

```powershell
# Check network
.\ai-infra-manage.ps1 -Action network

# Recreate network
docker network rm ai-infra-net
docker network create ai-infra-net
```

### Reset everything

```powershell
# Stop and remove all containers and volumes
.\ai-infra-manage.ps1 -Action clean

# Start fresh
.\ai-infra-manage.ps1 -Action start -Service all
```

## Environment Variables

See `../.env.template` for all required environment variables.

Key variables:
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `LITELLM_MASTER_KEY` - Optional LiteLLM authentication
- `POSTGRES_PASSWORD` - Database password (shared)

## Integration Testing

Run the integration test suite:

```bash
# Test MPC-API → LiteLLM connectivity
node ../test_mpc_api_litellm.mjs
```

## Data Persistence

Each service uses Docker volumes for data persistence:
- `dify-db-data` - Dify database
- `dify-redis-data` - Dify cache
- `langflow-data` - Langflow files
- `langflow-db-data` - Langflow database
- `activepieces-db-data` - Activepieces database
- `activepieces-redis-data` - Activepieces cache

Volumes persist across container restarts unless explicitly removed with the `clean` action.

## Additional Resources

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Dify Documentation](https://docs.dify.ai/)
- [Langflow Documentation](https://docs.langflow.org/)
- [Activepieces Documentation](https://www.activepieces.com/docs)

---

**Last Updated:** 2025-11-18
