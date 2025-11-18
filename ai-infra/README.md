# AI Infrastructure

This directory contains the Docker-based infrastructure for the AI services including MPC-API and LiteLLM Gateway.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- PowerShell (for management script)
- API keys for OpenAI and/or Anthropic

### Setup

1. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env with your API keys**
   ```bash
   # Required
   OPENAI_API_KEY=sk-your-key
   LITELLM_MASTER_KEY=your-master-key
   MPC_API_KEY=your-api-key
   ```

3. **Start services**
   ```bash
   # Using management script (Windows)
   .\ai-infra-manage.ps1 up

   # Or using Docker Compose directly
   docker-compose up -d
   ```

4. **Verify services are running**
   ```bash
   # Using management script
   .\ai-infra-manage.ps1 health

   # Or manually
   curl http://localhost:4000/health  # LiteLLM
   curl http://localhost:3000/health  # MPC-API
   ```

## Services

### LiteLLM Gateway (Port 4000)
Unified LLM provider proxy supporting OpenAI, Anthropic, Azure, and more.

**Endpoints:**
- `GET /health` - Health check
- `GET /models` - List available models
- `POST /chat/completions` - Chat completions (OpenAI-compatible)

### MPC-API (Port 3000)
Main API service for content generation.

**Endpoints:**
- `GET /health` - Health check
- `POST /generate/script` - Generate video scripts
- `POST /generate/thumbnail-prompt` - Generate thumbnail prompts
- `POST /generate/metadata` - Generate SEO metadata

### Redis (Port 6379)
In-memory data store for caching and rate limiting.

## Directory Structure

```
ai-infra/
├── litellm/
│   └── config/           # LiteLLM provider configurations
│       ├── README.md     # Configuration guide
│       ├── openai-only.yaml
│       ├── anthropic-only.yaml
│       ├── multi-provider.yaml
│       └── production-fallback.yaml
│
└── mpc-api/              # MPC-API service
    ├── Dockerfile        # Docker image
    ├── package.json      # Node.js dependencies
    ├── server.js         # Express server
    └── errors.js         # Error handling interface
```

## Management Script

The `ai-infra-manage.ps1` script provides convenient commands for managing services.

### Common Commands

```powershell
# Start all services
.\ai-infra-manage.ps1 up

# Stop all services
.\ai-infra-manage.ps1 down

# View logs
.\ai-infra-manage.ps1 logs -Follow

# Restart a service
.\ai-infra-manage.ps1 restart mpc-api

# Rebuild a service
.\ai-infra-manage.ps1 rebuild litellm -NoCache

# Check health
.\ai-infra-manage.ps1 health

# Clean up unused resources
.\ai-infra-manage.ps1 prune

# Complete reset (removes all data)
.\ai-infra-manage.ps1 reset
```

### Service-Specific Commands

```powershell
# View logs for specific service
.\ai-infra-manage.ps1 logs mpc-api
.\ai-infra-manage.ps1 logs litellm -Follow

# Restart specific service
.\ai-infra-manage.ps1 restart redis

# Rebuild specific service
.\ai-infra-manage.ps1 rebuild mpc-api
```

## Configuration

### LiteLLM Configuration

Choose a configuration based on your needs:

1. **Development/Testing**: Use default `litellm_config.yaml`
2. **OpenAI Only**: `ai-infra/litellm/config/openai-only.yaml`
3. **Anthropic Only**: `ai-infra/litellm/config/anthropic-only.yaml`
4. **Multi-Provider**: `ai-infra/litellm/config/multi-provider.yaml`
5. **Production**: `ai-infra/litellm/config/production-fallback.yaml`

To use a different config, update `docker-compose.yml`:

```yaml
litellm:
  volumes:
    - ./ai-infra/litellm/config/multi-provider.yaml:/app/config.yaml:ro
```

See `ai-infra/litellm/config/README.md` for detailed configuration guide.

### Environment Variables

Required variables in `.env`:

```bash
# Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Service Authentication
LITELLM_MASTER_KEY=...
MPC_API_KEY=...

# Optional
NODE_ENV=production
LOG_LEVEL=info
REDIS_HOST=redis
REDIS_PORT=6379
```

## API Usage

### MPC-API Examples

#### Generate Script

```bash
curl -X POST http://localhost:3000/generate/script \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MPC_API_KEY}" \
  -d '{
    "prompt": "Create a video about space exploration",
    "style": "documentary",
    "duration": 60
  }'
```

#### Generate Thumbnail Prompt

```bash
curl -X POST http://localhost:3000/generate/thumbnail-prompt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MPC_API_KEY}" \
  -d '{
    "script_content": "Exploring the wonders of space...",
    "style_preferences": {"art_style": "cinematic"},
    "keywords": ["space", "stars", "galaxy"]
  }'
```

#### Generate Metadata

```bash
curl -X POST http://localhost:3000/generate/metadata \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MPC_API_KEY}" \
  -d '{
    "title": "Space Exploration",
    "content": "A journey through the cosmos..."
  }'
```

### LiteLLM Examples

#### Chat Completion

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${LITELLM_MASTER_KEY}" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

#### List Models

```bash
curl http://localhost:4000/models \
  -H "Authorization: Bearer ${LITELLM_MASTER_KEY}"
```

## Error Handling

MPC-API uses a standardized error interface. All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "details": {
      "additional": "context"
    }
  }
}
```

Success responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "result": "data"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Troubleshooting

### Services won't start

```bash
# Check logs
.\ai-infra-manage.ps1 logs

# Check Docker daemon
docker ps

# Check port availability
netstat -ano | findstr "3000"
netstat -ano | findstr "4000"
```

### Health checks failing

```bash
# Check service health manually
curl http://localhost:4000/health
curl http://localhost:3000/health

# Check container logs
docker logs litellm-gateway
docker logs mpc-api
```

### API requests failing

```bash
# Verify API keys
cat .env | grep API_KEY

# Test LiteLLM directly
curl http://localhost:4000/health

# Check MPC-API can reach LiteLLM
docker exec mpc-api curl http://litellm:4000/health
```

### Redis connection issues

```bash
# Check Redis is running
docker ps | grep redis

# Test Redis
docker exec mpc-redis redis-cli ping
```

## Development

### Making Changes to MPC-API

1. Edit files in `ai-infra/mpc-api/`
2. Rebuild the service:
   ```bash
   .\ai-infra-manage.ps1 rebuild mpc-api
   ```

### Adding New Endpoints

Edit `ai-infra/mpc-api/server.js`:

```javascript
import { ErrorTypes, asyncHandler, successResponse } from './errors.js';

app.post('/your-endpoint', requireApiKey, asyncHandler(async (req, res) => {
  // Your logic here
  const result = await yourFunction(req.body);
  res.json(successResponse(result, 'Success message'));
}));
```

### Testing Changes

```bash
# Rebuild and restart
.\ai-infra-manage.ps1 rebuild mpc-api

# Watch logs
.\ai-infra-manage.ps1 logs mpc-api -Follow

# Test endpoint
curl -X POST http://localhost:3000/your-endpoint \
  -H "Authorization: Bearer ${MPC_API_KEY}" \
  -d '{"test": "data"}'
```

## Production Deployment

### Checklist

- [ ] Set strong, unique API keys
- [ ] Use production LiteLLM config with fallbacks
- [ ] Configure request logging database
- [ ] Set up monitoring and alerting
- [ ] Use HTTPS with reverse proxy
- [ ] Implement rate limiting
- [ ] Enable Redis persistence
- [ ] Set up backup strategy
- [ ] Review security settings
- [ ] Document deployment procedures

### Reverse Proxy Example (nginx)

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /litellm/ {
        proxy_pass http://localhost:4000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /mpc-api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Documentation

- **Full Architecture**: `../docs/ARCHITECTURE_NEW.md`
- **LiteLLM Config Guide**: `litellm/config/README.md`
- **Error Handling**: See `mpc-api/errors.js` for error interface
- **Docker Compose**: `../docker-compose.yml`

## Support

For issues or questions:
1. Check logs: `.\ai-infra-manage.ps1 logs`
2. Review documentation in `docs/ARCHITECTURE_NEW.md`
3. Check LiteLLM docs: https://docs.litellm.ai/
4. Review service health: `.\ai-infra-manage.ps1 health`

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-18
