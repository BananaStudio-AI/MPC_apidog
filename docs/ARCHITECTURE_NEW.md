# New Infrastructure Architecture

This document describes the newly added Docker infrastructure for the AI services including MPC-API, LiteLLM Gateway, and Redis.

## Overview

The AI infrastructure consists of three main services orchestrated with Docker Compose:

1. **LiteLLM Gateway** - Unified LLM provider proxy
2. **MPC-API** - Main API service for content generation
3. **Redis** - Caching and rate limiting support

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
│                   (ai-infra-network)                    │
│                                                         │
│  ┌──────────────┐      ┌──────────────┐      ┌──────┐ │
│  │  MPC-API     │─────▶│  LiteLLM     │─────▶│ LLM  │ │
│  │  :3000       │      │  Gateway     │      │ APIs │ │
│  │              │      │  :4000       │      │      │ │
│  └──────────────┘      └──────────────┘      └──────┘ │
│         │                      │                        │
│         │              ┌───────▼──────┐                 │
│         └─────────────▶│    Redis     │                 │
│                        │    :6379     │                 │
│                        └──────────────┘                 │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   External Clients
```

## Service Details

### 1. LiteLLM Gateway

**Purpose**: Provides a unified OpenAI-compatible API for multiple LLM providers.

**Features**:
- Multi-provider support (OpenAI, Anthropic, Azure, etc.)
- Load balancing and failover
- Rate limiting
- Request logging
- Health monitoring

**Port**: 4000  
**Health Check**: `GET /health`  
**Configuration**: `litellm_config.yaml` or `ai-infra/litellm/config/*.yaml`

**Health Check Strategy**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

### 2. MPC-API Service

**Purpose**: Main API service for AI-powered content generation.

**Features**:
- Script generation
- Thumbnail prompt generation
- Metadata generation
- Standardized error handling
- API key authentication

**Port**: 3000  
**Health Check**: `GET /health`  
**Depends On**: LiteLLM Gateway (with health condition)

**Endpoints**:
- `POST /generate/script` - Generate video scripts
- `POST /generate/thumbnail-prompt` - Generate thumbnail prompts
- `POST /generate/metadata` - Generate SEO metadata
- `GET /health` - Health check

**Health Check Strategy**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 20s
depends_on:
  litellm:
    condition: service_healthy
```

### 3. Redis

**Purpose**: Provides caching and rate limiting support.

**Features**:
- Fast in-memory data store
- Used by LiteLLM for load balancing
- Session storage
- Rate limiting counters

**Port**: 6379  
**Health Check**: `redis-cli ping`

**Health Check Strategy**:
```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 5s
```

## Service Dependencies

The services have the following dependency chain:

```
Redis (independent)
  ↓
LiteLLM Gateway (optional Redis dependency)
  ↓
MPC-API (requires LiteLLM to be healthy)
```

**Key Design Decision**: MPC-API uses `depends_on` with a `condition: service_healthy` to ensure LiteLLM is ready before accepting requests.

## Directory Structure

```
MPC_apidog/
├── docker-compose.yml              # Main orchestration file
├── ai-infra-manage.ps1            # Management script
├── litellm_config.yaml            # Default LiteLLM config
├── .env.example                   # Environment template
│
├── ai-infra/
│   ├── litellm/
│   │   └── config/               # Provider-specific configs
│   │       ├── README.md
│   │       ├── openai-only.yaml
│   │       ├── anthropic-only.yaml
│   │       ├── multi-provider.yaml
│   │       └── production-fallback.yaml
│   │
│   └── mpc-api/                  # MPC-API service
│       ├── Dockerfile
│       ├── package.json
│       ├── server.js            # Main server
│       └── errors.js            # Error handling
│
└── docs/
    └── ARCHITECTURE_NEW.md      # This file
```

## Management Script

The `ai-infra-manage.ps1` PowerShell script provides convenient management commands:

### Commands

| Command | Description | Example |
|---------|-------------|---------|
| `up` | Start all services | `.\ai-infra-manage.ps1 up` |
| `down` | Stop and remove services | `.\ai-infra-manage.ps1 down` |
| `restart` | Restart services | `.\ai-infra-manage.ps1 restart mpc-api` |
| `logs` | View service logs | `.\ai-infra-manage.ps1 logs -Follow` |
| `ps` | Show service status | `.\ai-infra-manage.ps1 ps` |
| `prune` | Clean up unused resources | `.\ai-infra-manage.ps1 prune` |
| `reset` | Complete reset (destructive) | `.\ai-infra-manage.ps1 reset` |
| `rebuild` | Rebuild and restart | `.\ai-infra-manage.ps1 rebuild mpc-api` |
| `health` | Check service health | `.\ai-infra-manage.ps1 health` |

### Examples

```powershell
# Start all services
.\ai-infra-manage.ps1 up

# View logs for MPC-API
.\ai-infra-manage.ps1 logs mpc-api -Follow

# Restart LiteLLM with new config
.\ai-infra-manage.ps1 restart litellm

# Rebuild MPC-API without cache
.\ai-infra-manage.ps1 rebuild mpc-api -NoCache

# Check health of all services
.\ai-infra-manage.ps1 health

# View last 50 lines of all logs
.\ai-infra-manage.ps1 logs -Tail 50

# Complete reset (removes all data)
.\ai-infra-manage.ps1 reset
```

## Standardized Error Interface

All MPC-API errors follow a consistent structure defined in `ai-infra/mpc-api/errors.js`.

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "details": {
      "field": "additional context"
    }
  }
}
```

### Error Types

| Error Code | Status | Description |
|------------|--------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `LLM_ERROR` | 502 | LLM provider error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down |
| `GATEWAY_TIMEOUT` | 504 | Request timeout |
| `GENERATION_FAILED` | 500 | Content generation failed |

### Success Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    "result": "data"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Usage Example

```javascript
import { ErrorTypes, asyncHandler, successResponse } from './errors.js';

app.post('/endpoint', asyncHandler(async (req, res) => {
  if (!req.body.field) {
    throw ErrorTypes.BAD_REQUEST('Field is required', { field: 'field' });
  }
  
  const result = await processData(req.body);
  res.json(successResponse(result, 'Operation successful'));
}));
```

## LiteLLM Configuration

### Default Configuration

The repository includes `litellm_config.yaml` with basic OpenAI and Anthropic setup.

### Example Configurations

Located in `ai-infra/litellm/config/`:

1. **openai-only.yaml** - OpenAI models only
2. **anthropic-only.yaml** - Anthropic Claude models only
3. **multi-provider.yaml** - Multiple providers with load balancing
4. **production-fallback.yaml** - Production setup with automatic fallbacks

### Using Custom Configurations

Update `docker-compose.yml` to use a different config:

```yaml
litellm:
  volumes:
    - ./ai-infra/litellm/config/multi-provider.yaml:/app/config.yaml:ro
```

Or mount at runtime:
```bash
docker run -v ./ai-infra/litellm/config/production-fallback.yaml:/app/config.yaml litellm
```

## Environment Variables

### Required Variables

```bash
OPENAI_API_KEY=sk-...              # OpenAI API key
ANTHROPIC_API_KEY=sk-ant-...       # Anthropic API key
LITELLM_MASTER_KEY=...             # LiteLLM auth key
MPC_API_KEY=...                    # MPC-API auth key
```

### Optional Variables

```bash
NODE_ENV=production                # Environment mode
LOG_LEVEL=info                     # Logging level
REDIS_HOST=redis                   # Redis hostname
REDIS_PORT=6379                    # Redis port
LITELLM_DATABASE_URL=...          # Request logging DB
AZURE_API_BASE=...                # Azure OpenAI endpoint
AZURE_API_KEY=...                 # Azure API key
SLACK_WEBHOOK_URL=...             # Alerting webhook
```

## Health Checks

All services implement health checks for reliability:

### Health Check Intervals

| Service | Interval | Timeout | Retries | Start Period |
|---------|----------|---------|---------|--------------|
| LiteLLM | 30s | 10s | 3 | 10s |
| MPC-API | 30s | 10s | 3 | 20s |
| Redis | 10s | 5s | 3 | 5s |

### Testing Health

```bash
# LiteLLM
curl http://localhost:4000/health

# MPC-API
curl http://localhost:3000/health

# Redis
redis-cli ping

# Or use management script
.\ai-infra-manage.ps1 health
```

## Networking

All services run on a custom bridge network: `ai-infra-network`

**Benefits**:
- Services can communicate using service names (e.g., `http://litellm:4000`)
- Isolated from other Docker networks
- Can be shared with other services (e.g., Activepieces)

**Internal URLs**:
- LiteLLM: `http://litellm:4000`
- MPC-API: `http://mpc-api:3000`
- Redis: `redis://redis:6379`

## Data Persistence

### Volumes

```yaml
volumes:
  redis_data:
    name: mpc-redis-data
```

**What's Persisted**:
- Redis data (cache, rate limits)

**What's Not Persisted**:
- Application logs (use external logging)
- LiteLLM request logs (unless database configured)

## Security Considerations

### Authentication

1. **LiteLLM**: Requires `LITELLM_MASTER_KEY` for requests
2. **MPC-API**: Requires `MPC_API_KEY` in `Authorization: Bearer` header
3. **Redis**: No authentication by default (internal network only)

### Best Practices

- ✅ Use strong, unique API keys
- ✅ Never commit `.env` files to git
- ✅ Rotate API keys periodically
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Monitor API usage
- ❌ Don't expose Redis port to public
- ❌ Don't hardcode credentials

## Deployment

### Development

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# At minimum, set OPENAI_API_KEY and LITELLM_MASTER_KEY

# Start services
.\ai-infra-manage.ps1 up

# View logs
.\ai-infra-manage.ps1 logs -Follow
```

### Production

1. **Set production environment variables**
2. **Use production LiteLLM config** (with fallbacks)
3. **Configure database for request logging**
4. **Set up monitoring and alerting**
5. **Use HTTPS with reverse proxy**
6. **Implement rate limiting**
7. **Enable Redis persistence**
8. **Set up backup strategy**

### Scaling

**Horizontal Scaling**:
```yaml
mpc-api:
  deploy:
    replicas: 3
```

**Load Balancing**:
- Use nginx or Traefik as reverse proxy
- LiteLLM handles provider-level load balancing

## Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check logs
.\ai-infra-manage.ps1 logs

# Check service status
.\ai-infra-manage.ps1 ps

# Verify environment variables
cat .env
```

#### Health Checks Failing

```bash
# Check individual service
curl http://localhost:4000/health
curl http://localhost:3000/health

# Check detailed logs
docker logs litellm-gateway
docker logs mpc-api
```

#### Connection Issues

```bash
# Verify network
docker network inspect ai-infra-network

# Test internal connectivity
docker exec mpc-api curl http://litellm:4000/health
```

#### Port Conflicts

```bash
# Check if ports are in use
netstat -ano | findstr "3000"
netstat -ano | findstr "4000"

# Modify ports in docker-compose.yml if needed
```

### Debug Mode

Enable debug logging:

```bash
# LiteLLM
docker run ... --debug

# MPC-API
NODE_ENV=development LOG_LEVEL=debug
```

## Monitoring

### Metrics

**LiteLLM Metrics** (if Prometheus enabled):
- Request latency
- Token usage
- Error rates
- Provider availability

**MPC-API Metrics**:
- Request count
- Response times
- Error rates
- Endpoint usage

### Logging

**Log Locations**:
```bash
# View all logs
.\ai-infra-manage.ps1 logs

# Service-specific
docker logs litellm-gateway
docker logs mpc-api
docker logs mpc-redis
```

**Log Formats**:
- LiteLLM: JSON logs (if `json_logs: true`)
- MPC-API: Structured JSON logs
- Redis: Standard Redis logs

## Future Enhancements

### Planned Improvements

1. **Observability**
   - Prometheus metrics
   - Grafana dashboards
   - Distributed tracing (OpenTelemetry)

2. **Security**
   - Redis authentication
   - mTLS between services
   - API rate limiting per key

3. **Features**
   - Request caching
   - Webhook support
   - Batch processing
   - Queue-based async processing

4. **Deployment**
   - Kubernetes manifests
   - Helm charts
   - Terraform configurations

## References

### Documentation

- [LiteLLM Docs](https://docs.litellm.ai/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Express.js Docs](https://expressjs.com/)

### Configuration Examples

- `ai-infra/litellm/config/README.md` - LiteLLM configuration guide
- `docker-compose.yml` - Service definitions
- `.env.example` - Environment variables

### Related Documents

- `docs/ARCHITECTURE.md` - Original architecture
- `docs/ACTIVEPIECES_MCP_API_INTEGRATION.md` - Activepieces integration
- `GATEWAY_README.md` - LiteLLM gateway usage

---

**Last Updated**: 2024-11-18  
**Version**: 1.0.0  
**Maintainer**: BananaStudio AI Team
