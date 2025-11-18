# Local AI Infrastructure Architecture

Comprehensive guide to the BananaStudio local-first AI infrastructure.

## Overview

The infrastructure consists of five core services running on Windows Docker Desktop:

1. **Dify** - LLM application development platform
2. **Langflow** - Visual AI workflow builder
3. **Activepieces** - Workflow automation platform
4. **LiteLLM Gateway** - Unified LLM provider gateway
5. **MPC-API** - Express.js proxy service

## Design Principles

### 1. Local-First
- All services run locally on Docker Desktop
- No cloud dependencies for core functionality
- Provider API keys only used for model access
- Data stays on local machine (1TB storage)

### 2. Centralized Model Access
- **All model calls route through LiteLLM Gateway**
- No direct provider API calls from application code
- Consistent authentication and rate limiting
- Unified logging and cost tracking

### 3. Service Isolation
- Each service runs in its own Docker container
- Services communicate over shared `ai-infra-net` network
- Independent scaling and updates
- Persistent data through Docker volumes

### 4. Windows-Optimized
- PowerShell management script
- Docker Desktop integration
- Windows-specific paths and configurations
- 1TB local storage optimization

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Windows Docker Desktop                   │
│                         (1TB Storage)                        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │      ai-infra-net network     │
              └───────────────┬───────────────┘
                              │
        ┏━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━┓
        ┃                                             ┃
┌───────▼────────┐  ┌──────────────┐  ┌──────────────▼──┐
│  Dify (Port 80)│  │   Langflow   │  │  Activepieces   │
│  + PostgreSQL  │  │ (Port 7860)  │  │  (Port 8080)    │
│  + Redis       │  │ + PostgreSQL │  │  + PostgreSQL   │
└───────┬────────┘  └──────┬───────┘  │  + Redis        │
        │                  │          └──────────┬───────┘
        │                  │                     │
        └──────────────────┼─────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │     MPC-API      │
                  │   (Port 3000)    │
                  │   Express.js/TS  │
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │ LiteLLM Gateway  │
                  │   (Port 4000)    │
                  └────────┬─────────┘
                           │
        ┏━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━┓
        ┃          Internet (API Calls)        ┃
        ┗━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━┛
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐      ┌─────▼──────┐    ┌─────▼─────┐
    │ OpenAI │      │ Anthropic  │    │  Others   │
    │  API   │      │    API     │    │   APIs    │
    └────────┘      └────────────┘    └───────────┘
```

## Service Details

### Dify (Port 80)

**Purpose:** LLM application development platform

**Components:**
- `dify-web` - Frontend (Port 80)
- `dify-api` - Backend API (Port 5001)
- `dify-worker` - Background worker
- `dify-db` - PostgreSQL database
- `dify-redis` - Redis cache

**Configuration:**
- Location: `ai-infra/dify/docker-compose.yml`
- Data volumes: `dify-db-data`, `dify-redis-data`
- Environment: `.env` (DIFY_SECRET_KEY, POSTGRES_PASSWORD)

**Use Cases:**
- Build LLM-powered applications
- Create chatbots and assistants
- Design multi-agent systems

### Langflow (Port 7860)

**Purpose:** Visual AI workflow builder

**Components:**
- `langflow` - Main application
- `langflow-db` - PostgreSQL database

**Configuration:**
- Location: `ai-infra/langflow/docker-compose.yml`
- Data volumes: `langflow-data`, `langflow-db-data`
- Environment: `.env` (POSTGRES_PASSWORD, API keys)

**Use Cases:**
- Drag-and-drop AI pipeline creation
- Visual workflow design
- Rapid prototyping

### Activepieces (Port 8080)

**Purpose:** Workflow automation platform

**Components:**
- `activepieces` - Main application (Port 8080)
- `activepieces-db` - PostgreSQL database
- `activepieces-redis` - Redis cache

**Configuration:**
- Location: `ai-infra/activepieces/docker-compose.yml`
- Data volumes: `activepieces-db-data`, `activepieces-redis-data`
- Environment: `.env` (ACTIVEPIECES_API_KEY, etc.)

**Use Cases:**
- Automate workflows with AI
- Integrate with external services (Notion, etc.)
- Schedule and trigger AI tasks

### LiteLLM Gateway (Port 4000)

**Purpose:** Unified gateway for multiple LLM providers

**Components:**
- `litellm` - Gateway service

**Configuration:**
- Location: `ai-infra/litellm/docker-compose.yml`
- Config file: `ai-infra/litellm/config.yaml`
- Environment: `.env` (OPENAI_API_KEY, ANTHROPIC_API_KEY)

**Supported Providers:**
- OpenAI (GPT-4o, GPT-4o-mini, GPT-4-turbo)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- Easily extensible to other providers

**API Endpoints:**
- `GET /health` - Health check
- `GET /models` - List available models
- `POST /chat/completions` - Chat completions
- `POST /completions` - Text completions
- `POST /embeddings` - Generate embeddings

### MPC-API (Port 3000)

**Purpose:** Express.js proxy service to LiteLLM

**Components:**
- `mpc-api` - Express.js/TypeScript service
- Multi-stage Docker build

**Configuration:**
- Location: `mpc-api/docker-compose.yml`
- Source: `mpc-api/src/index.ts`
- Environment: `.env` (LITELLM_BASE_URL, PORT)

**API Endpoints:**
- `GET /health` - Health check with LiteLLM status
- `GET /api/models` - Proxy to LiteLLM models
- `POST /api/chat/completions` - Proxy to LiteLLM chat

**Routing:**
```
Client → http://localhost:3000/api/chat/completions
         ↓
MPC-API → http://litellm:4000/chat/completions
         ↓
LiteLLM → https://api.openai.com/v1/chat/completions
```

## Network Architecture

### Docker Network: ai-infra-net

All services communicate over a shared bridge network.

**Internal Hostnames:**
- `dify-api:5001` - Dify API
- `langflow:7860` - Langflow
- `activepieces:80` - Activepieces
- `litellm:4000` - LiteLLM Gateway
- `mpc-api:3000` - MPC-API

**Port Mapping:**
- External (host) ports: 80, 3000, 4000, 7860, 8080
- Internal (container) ports: match service defaults

**Network Creation:**
```bash
docker network create ai-infra-net
```

Services automatically join the network via docker-compose.yml:
```yaml
networks:
  ai-infra-net:
    name: ai-infra-net
    external: true
```

## Data Persistence

### Docker Volumes

Each service uses Docker volumes for persistent storage:

| Volume | Service | Purpose |
|--------|---------|---------|
| `dify-db-data` | Dify | PostgreSQL database |
| `dify-redis-data` | Dify | Redis cache |
| `langflow-data` | Langflow | Application files |
| `langflow-db-data` | Langflow | PostgreSQL database |
| `activepieces-db-data` | Activepieces | PostgreSQL database |
| `activepieces-redis-data` | Activepieces | Redis cache |

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect dify-db-data

# Backup volume
docker run --rm -v dify-db-data:/data -v ${PWD}:/backup alpine tar czf /backup/dify-db-backup.tar.gz /data

# Restore volume
docker run --rm -v dify-db-data:/data -v ${PWD}:/backup alpine tar xzf /backup/dify-db-backup.tar.gz -C /

# Remove unused volumes (careful!)
docker volume prune
```

## Security Considerations

### 1. API Key Management
- Store keys in `.env` file (not tracked in git)
- Use `.env.template` as reference
- Rotate keys regularly
- Use separate keys for dev/prod

### 2. Service Authentication
- LiteLLM: Optional master key via `LITELLM_MASTER_KEY`
- MPC-API: Can require auth token if needed
- Activepieces: Internal secrets for encryption

### 3. Network Isolation
- Services only accessible via Docker network internally
- External access only through mapped ports
- No direct provider API calls from applications

### 4. Container Security
- Non-root users in custom containers (MPC-API)
- Health checks for automatic recovery
- Resource limits can be added to docker-compose.yml

## Performance Optimization

### 1. Resource Allocation

Recommended Docker Desktop settings:
- **Memory:** 8GB minimum, 16GB recommended
- **CPU:** 4 cores minimum, 8 cores recommended
- **Disk:** 1TB (as specified)
- **Swap:** 2GB

### 2. Caching
- Redis used by Dify and Activepieces
- LiteLLM can cache responses (configure in config.yaml)
- Docker layer caching for faster builds

### 3. Database Tuning
- PostgreSQL shared across services
- Consider connection pooling for high load
- Regular VACUUM and ANALYZE for maintenance

## Monitoring & Logging

### Health Checks

Built-in Docker health checks:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Log Access

```powershell
# View all logs
cd ai-infra
.\ai-infra-manage.ps1 -Action logs -Service all

# Follow specific service
.\ai-infra-manage.ps1 -Action logs -Service mpc-api -Follow

# Docker commands
docker compose logs -f litellm
docker compose logs --tail=100 mpc-api
```

### Metrics Collection

Future enhancements:
- Prometheus for metrics
- Grafana for dashboards
- ELK stack for log aggregation

## Troubleshooting

### Service Won't Start

1. Check logs:
   ```powershell
   .\ai-infra-manage.ps1 -Action logs -Service <service>
   ```

2. Check Docker Desktop status

3. Verify environment variables in `.env`

4. Check port availability:
   ```powershell
   netstat -ano | findstr :<port>
   ```

### Cannot Connect Between Services

1. Verify network:
   ```powershell
   .\ai-infra-manage.ps1 -Action network
   ```

2. Check service health:
   ```powershell
   .\ai-infra-manage.ps1 -Action health
   ```

3. Verify internal hostnames (e.g., `http://litellm:4000` not `http://localhost:4000`)

### High Resource Usage

1. Check container stats:
   ```bash
   docker stats
   ```

2. Limit resources in docker-compose.yml:
   ```yaml
   services:
     mpc-api:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
   ```

3. Scale down unnecessary services

## Deployment Workflow

### Initial Setup

```powershell
# 1. Clone repository
git clone <repo-url>
cd MPC_apidog

# 2. Configure environment
cp .env.template .env
# Edit .env with your keys

# 3. Create network
docker network create ai-infra-net

# 4. Start services
cd ai-infra
.\ai-infra-manage.ps1 -Action start -Service all

# 5. Verify
.\ai-infra-manage.ps1 -Action health

# 6. Run tests
cd ..
node test_mpc_api_litellm.mjs
```

### Updates & Maintenance

```powershell
# Pull latest images
docker compose pull

# Restart services with new images
.\ai-infra-manage.ps1 -Action restart -Service all

# Backup data
# (See Data Persistence section)
```

### Scaling

To run multiple instances:
```yaml
# In docker-compose.yml
services:
  mpc-api:
    deploy:
      replicas: 3
```

Or use Docker Swarm/Kubernetes for advanced orchestration.

## Integration Examples

### Calling MPC-API from Python

```python
import requests

response = requests.post(
    'http://localhost:3000/api/chat/completions',
    json={
        'model': 'gpt-4o-mini',
        'messages': [
            {'role': 'user', 'content': 'Hello!'}
        ]
    }
)

print(response.json())
```

### Calling MPC-API from JavaScript

```javascript
const response = await fetch('http://localhost:3000/api/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: 'Hello!' }
    ]
  })
});

const data = await response.json();
console.log(data);
```

### From Langflow

Add HTTP Request component:
- URL: `http://mpc-api:3000/api/chat/completions`
- Method: POST
- Body: `{"model": "gpt-4o-mini", "messages": [...]}`

### From Activepieces

Add HTTP Request step:
- URL: `{{env.MPC_API_BASE_URL}}/api/chat/completions`
- Method: POST
- Headers: `Content-Type: application/json`
- Body: See ACTIVEPIECES_MCP_API_INTEGRATION.md

## Future Enhancements

### Short-term
- [ ] Add request caching in MPC-API
- [ ] Implement rate limiting
- [ ] Add cost tracking per model
- [ ] WebSocket support for streaming

### Medium-term
- [ ] Prometheus/Grafana monitoring
- [ ] ELK stack for logs
- [ ] Automated backups
- [ ] Load balancing for MPC-API

### Long-term
- [ ] Kubernetes deployment option
- [ ] Multi-node clustering
- [ ] Advanced security (mTLS, etc.)
- [ ] Custom model fine-tuning pipeline

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Dify Documentation](https://docs.dify.ai/)
- [Langflow Documentation](https://docs.langflow.org/)
- [Activepieces Documentation](https://www.activepieces.com/docs)

---

**Last Updated:** 2025-11-18
