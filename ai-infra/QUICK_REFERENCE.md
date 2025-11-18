# Quick Reference Guide

Essential commands and endpoints for the local AI infrastructure.

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Dify | http://localhost | AI workflow orchestration and agent builder |
| Langflow | http://localhost:7860 | Visual flow-based AI application builder |
| Activepieces | http://localhost:8080 | Workflow automation platform |
| LiteLLM Gateway | http://localhost:4000 | Unified LLM provider gateway |
| MPC-API | http://localhost:3000 | Custom API gateway (proxies to LiteLLM) |

## Management Commands

```powershell
# Navigate to infrastructure directory
cd C:\Users\[YourUsername]\Documents\MPC_apidog\ai-infra

# Start all services
.\ai-infra-manage.ps1 -Action start

# Stop all services
.\ai-infra-manage.ps1 -Action stop

# Restart all services
.\ai-infra-manage.ps1 -Action restart

# Check status
.\ai-infra-manage.ps1 -Action status

# View logs (must specify service)
.\ai-infra-manage.ps1 -Action logs -Service mpc-api
.\ai-infra-manage.ps1 -Action logs -Service litellm

# Start/stop individual services
.\ai-infra-manage.ps1 -Action start -Service dify
.\ai-infra-manage.ps1 -Action stop -Service langflow
```

## API Examples

### MPC-API Endpoints

#### Health Check
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET

# Curl
curl http://localhost:3000/health
```

#### List Models
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/models" -Method GET

# Curl
curl http://localhost:3000/api/models
```

#### Chat Completion
```powershell
# PowerShell
$body = @{
    model = "gpt-4o-mini"
    messages = @(
        @{
            role = "user"
            content = "Hello! What can you do?"
        }
    )
    temperature = 0.7
    max_tokens = 150
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/chat/completions" -Method POST -Body $body -ContentType "application/json"

# Curl
curl -X POST http://localhost:3000/api/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello! What can you do?"}
    ],
    "temperature": 0.7,
    "max_tokens": 150
  }'
```

### LiteLLM Gateway Direct

#### Health Check
```powershell
curl http://localhost:4000/health
```

#### List Models
```powershell
curl http://localhost:4000/models
```

#### Chat Completion (with authentication)
```powershell
# Curl (replace sk-1234 with your LITELLM_MASTER_KEY)
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Python Example (Using gateway_client.py)

```python
# From repository root
from gateway_client import GatewayClient

# Initialize client
client = GatewayClient(base_url="http://localhost:4000")

# Check health
health = client.health()
print(f"Gateway health: {health}")

# List models
models = client.models()
for model in models['data']:
    print(f"Available model: {model['id']}")

# Chat completion
response = client.chat_completion(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is 2+2?"}
    ],
    model="gpt-4o-mini",
    max_tokens=50
)

print(f"Response: {response['choices'][0]['message']['content']}")
```

## Environment Variables

### Required for Model Providers
```bash
# OpenAI (for GPT models)
OPENAI_API_KEY=sk-...

# Anthropic (for Claude models)
ANTHROPIC_API_KEY=sk-ant-...

# LiteLLM authentication (optional)
LITELLM_MASTER_KEY=sk-1234
```

### Service Configuration
```bash
# MPC-API
PORT=3000
LITELLM_BASE_URL=http://litellm:4000

# Dify (optional overrides)
DIFY_SECRET_KEY=your-secret-key

# Activepieces (optional overrides)
AP_JWT_SECRET=your-jwt-secret
AP_ENCRYPTION_KEY=exactly-32-characters-long-key!
```

## Docker Commands

### View Running Containers
```powershell
docker ps --filter "network=ai-infra-net"
```

### View All Containers (including stopped)
```powershell
docker ps -a --filter "network=ai-infra-net"
```

### View Logs for Specific Container
```powershell
docker logs [container-name] --tail 100 -f
```

### Restart Single Container
```powershell
docker restart [container-name]
```

### Execute Command in Container
```powershell
docker exec -it [container-name] /bin/sh
```

### View Network Details
```powershell
docker network inspect ai-infra-net
```

## Testing Connectivity

### Test MPC-API → LiteLLM
```powershell
# From repository root
cd mpc-api
npm install
npm run dev

# In another terminal
curl http://localhost:3000/health
```

### Test Dify → LiteLLM
1. Open Dify at http://localhost
2. Go to Settings → Model Providers
3. Add "Custom" provider with base URL: http://litellm:4000
4. Test connection

### Test Langflow → MPC-API
1. Open Langflow at http://localhost:7860
2. Create a new flow
3. Add LLM component with base URL: http://mpc-api:3000
4. Test flow execution

## Common Issues & Quick Fixes

### Service Won't Start
```powershell
# Check logs
.\ai-infra-manage.ps1 -Action logs -Service [service-name]

# Restart service
.\ai-infra-manage.ps1 -Action restart -Service [service-name]
```

### Port Conflict
```powershell
# Find process using port
netstat -ano | findstr :[port]

# Kill process (replace [PID])
taskkill /PID [PID] /F
```

### Reset Service Data
```powershell
# Stop service
.\ai-infra-manage.ps1 -Action stop -Service [service-name]

# Remove volumes
cd [service-directory]
docker-compose down -v

# Restart
cd ..
.\ai-infra-manage.ps1 -Action start -Service [service-name]
```

### Network Issues
```powershell
# Recreate network
docker network rm ai-infra-net
docker network create ai-infra-net

# Restart all
.\ai-infra-manage.ps1 -Action restart
```

## Model Providers in LiteLLM

Edit `litellm_config.yaml` to add providers:

```yaml
model_list:
  # OpenAI
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: ${OPENAI_API_KEY}
  
  # Anthropic
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: ${ANTHROPIC_API_KEY}
  
  # Add more providers as needed
```

After editing, restart LiteLLM:
```powershell
.\ai-infra-manage.ps1 -Action restart -Service litellm
```

## Monitoring & Logs

### Real-time Logs
```powershell
# All services (in separate terminals)
.\ai-infra-manage.ps1 -Action logs -Service dify
.\ai-infra-manage.ps1 -Action logs -Service langflow
.\ai-infra-manage.ps1 -Action logs -Service activepieces
.\ai-infra-manage.ps1 -Action logs -Service litellm
.\ai-infra-manage.ps1 -Action logs -Service mpc-api
```

### Docker Stats
```powershell
docker stats --filter "network=ai-infra-net"
```

### Disk Usage
```powershell
docker system df
```

## Backup & Restore

### Backup Volumes
```powershell
# Create backup directory
mkdir backups

# Backup Dify data
docker run --rm -v dify_db_data:/data -v ${PWD}/backups:/backup alpine tar czf /backup/dify_db.tar.gz /data

# Backup Langflow data
docker run --rm -v langflow_data:/data -v ${PWD}/backups:/backup alpine tar czf /backup/langflow.tar.gz /data
```

### Restore Volumes
```powershell
# Restore Dify data
docker run --rm -v dify_db_data:/data -v ${PWD}/backups:/backup alpine sh -c "cd /data && tar xzf /backup/dify_db.tar.gz --strip 1"
```

---

**For detailed setup instructions**, see [AI_INFRA_SETUP.md](./AI_INFRA_SETUP.md)

**For deployment validation**, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

**Last Updated**: November 2025
