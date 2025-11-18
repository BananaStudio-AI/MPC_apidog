# AI Infrastructure Setup Guide

Complete guide to setting up the local Docker-based AI infrastructure on Windows with Docker Desktop.

## Prerequisites

### Required Software
1. **Windows 10/11** with WSL 2 enabled
2. **Docker Desktop for Windows** (latest version)
   - Download: https://www.docker.com/products/docker-desktop/
   - Ensure WSL 2 backend is enabled
   - Allocate at least 8GB RAM and 4 CPUs in Docker Desktop settings
3. **PowerShell 5.1+** (included with Windows)
4. **~1TB free storage** for models, data, and volumes

### Recommended
- **Git for Windows** for repository management
- **VS Code** or **Cursor** for editing configurations
- **Windows Terminal** for better PowerShell experience

## Architecture Overview

The infrastructure consists of five main services:

```
┌─────────────────────────────────────────────────────┐
│           Windows + Docker Desktop                  │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Dify        │  │ Langflow     │  │Activepieces│ │
│  │ :80         │  │ :7860        │  │ :8080      │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬─────┘ │
│         │                │                  │        │
│         └────────────────┼──────────────────┘        │
│                          │                           │
│                  ┌───────▼────────┐                  │
│                  │  LiteLLM       │                  │
│                  │  Gateway :4000 │                  │
│                  └───────┬────────┘                  │
│                          │                           │
│                  ┌───────▼────────┐                  │
│                  │  MPC-API       │                  │
│                  │  :3000         │                  │
│                  └────────────────┘                  │
│                                                       │
└───────────────────────────────────────────────────── ┘
                          │
                          │ External API calls
                          ▼
              ┌───────────────────────┐
              │ OpenAI, Anthropic, etc│
              └───────────────────────┘
```

## Setup Steps

### 1. Clone Repository

```powershell
cd C:\Users\[YourUsername]\Documents
git clone https://github.com/BananaStudio-AI/MPC_apidog.git
cd MPC_apidog
```

### 2. Configure Environment Variables

Copy the environment template and configure API keys:

```powershell
# Root directory
copy .env.example .env

# MPC-API directory
cd mpc-api
copy .env.example .env
cd ..
```

Edit `.env` files with your API keys:
- `OPENAI_API_KEY` - Required for OpenAI models
- `ANTHROPIC_API_KEY` - Required for Claude models
- `LITELLM_MASTER_KEY` - Authentication for LiteLLM (use default or set your own)

### 3. Start All Services

Navigate to the AI infrastructure directory:

```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action start
```

This will:
1. Create the shared Docker network `ai-infra-net`
2. Start all services in the correct order
3. Wait for health checks to pass

**First-time startup** may take 5-10 minutes as Docker pulls all images.

### 4. Verify Services

Check that all services are running:

```powershell
.\ai-infra-manage.ps1 -Action status
```

Expected output:
```
Docker Container Status:

NAMES              STATUS          PORTS
dify-nginx         Up 2 minutes    0.0.0.0:80->80/tcp
dify-web           Up 2 minutes    
dify-api           Up 2 minutes    
langflow           Up 2 minutes    0.0.0.0:7860->7860/tcp
activepieces       Up 2 minutes    0.0.0.0:8080->80/tcp
litellm            Up 2 minutes    0.0.0.0:4000->4000/tcp
mpc-api            Up 2 minutes    0.0.0.0:3000->3000/tcp
```

### 5. Access Services

Open your browser and navigate to:

- **Dify**: http://localhost
- **Langflow**: http://localhost:7860
- **Activepieces**: http://localhost:8080
- **LiteLLM Gateway**: http://localhost:4000/health
- **MPC-API**: http://localhost:3000/health

### 6. Test MPC-API → LiteLLM Connection

```powershell
# Test from PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/models" -Method GET

# Or use curl
curl http://localhost:3000/api/models
```

## Management Commands

All commands use the PowerShell management script:

### Start Services
```powershell
.\ai-infra-manage.ps1 -Action start              # Start all
.\ai-infra-manage.ps1 -Action start -Service dify        # Start specific service
```

### Stop Services
```powershell
.\ai-infra-manage.ps1 -Action stop               # Stop all
.\ai-infra-manage.ps1 -Action stop -Service litellm     # Stop specific service
```

### Restart Services
```powershell
.\ai-infra-manage.ps1 -Action restart            # Restart all
.\ai-infra-manage.ps1 -Action restart -Service mpc-api  # Restart specific service
```

### View Status
```powershell
.\ai-infra-manage.ps1 -Action status
```

### View Logs
```powershell
.\ai-infra-manage.ps1 -Action logs -Service mpc-api     # View MPC-API logs
.\ai-infra-manage.ps1 -Action logs -Service litellm     # View LiteLLM logs
```

### Clean Up (Remove Volumes)
```powershell
.\ai-infra-manage.ps1 -Action clean
```
⚠️ This will delete all data volumes. Use with caution.

## Configuration Files

### LiteLLM Configuration
Edit `litellm_config.yaml` in the repository root to:
- Add/remove model providers
- Configure model mappings
- Set rate limits and quotas

### Service-Specific Configs
- **Dify**: `ai-infra/dify/docker-compose.yml` and `ai-infra/dify/nginx.conf`
- **Langflow**: `ai-infra/langflow/docker-compose.yml`
- **Activepieces**: `ai-infra/activepieces/docker-compose.yml`
- **LiteLLM**: `ai-infra/litellm/docker-compose.yml`
- **MPC-API**: `mpc-api/docker-compose.yml` and `mpc-api/.env`

## Troubleshooting

### Docker Not Running
```
Error: Docker is not running
```
**Solution**: Start Docker Desktop from the Start menu

### Port Already in Use
```
Error: Port 3000 is already allocated
```
**Solution**: 
1. Find and stop the process using the port
2. Or change the port in the service's docker-compose.yml

```powershell
# Find process on port 3000
netstat -ano | findstr :3000
# Kill process (replace PID)
taskkill /PID [PID] /F
```

### Service Won't Start
```powershell
# Check logs for specific service
.\ai-infra-manage.ps1 -Action logs -Service [service-name]

# Restart service
.\ai-infra-manage.ps1 -Action restart -Service [service-name]
```

### Network Issues
If services can't communicate:
```powershell
# Recreate network
docker network rm ai-infra-net
docker network create ai-infra-net

# Restart all services
.\ai-infra-manage.ps1 -Action restart
```

### Out of Memory
If Docker runs out of memory:
1. Open Docker Desktop Settings
2. Go to Resources
3. Increase Memory allocation (recommend 8GB minimum)
4. Restart Docker Desktop

## Data Persistence

All service data is stored in Docker volumes:
- `dify_db_data`, `dify_redis_data`, `dify_app_storage`
- `langflow_data`
- `activepieces_db_data`, `activepieces_redis_data`, `activepieces_data`
- `litellm_logs`

These persist across container restarts. To reset a service completely, use the clean command.

## Updating Services

To update a service to the latest version:

```powershell
# Stop service
.\ai-infra-manage.ps1 -Action stop -Service [service-name]

# Pull latest images
cd [service-directory]
docker-compose pull

# Start service
cd ..
.\ai-infra-manage.ps1 -Action start -Service [service-name]
```

## Next Steps

1. Configure model providers in Dify (http://localhost)
2. Create workflows in Langflow (http://localhost:7860)
3. Set up automations in Activepieces (http://localhost:8080)
4. Test model calls through MPC-API

For API usage examples, see [QUICK_REFERENCE.md](./QUICK_REFERENCE.md).

For deployment validation, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md).

---

**Last Updated**: November 2025  
**Version**: 1.0.0
