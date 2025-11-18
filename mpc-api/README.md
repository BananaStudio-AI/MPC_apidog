# MPC-API

Express.js/TypeScript service that routes all model calls through LiteLLM Gateway.

## Overview

MPC-API is a lightweight proxy service that provides a unified interface for AI model interactions. All requests are routed through the LiteLLM Gateway, ensuring consistent access to multiple LLM providers without direct provider calls.

## Architecture

```
Client Application
        ↓
    MPC-API (Port 3000)
        ↓
 LiteLLM Gateway (Port 4000)
        ↓
    Provider APIs (OpenAI, Anthropic, etc.)
```

## Endpoints

### Health Check
```bash
GET /health
```

Returns service health status and configuration.

**Response:**
```json
{
  "status": "ok",
  "service": "mpc-api",
  "timestamp": "2025-11-18T12:00:00.000Z",
  "litellm_url": "http://litellm:4000"
}
```

### List Models
```bash
GET /api/models
```

Returns list of available models from LiteLLM Gateway.

**Response:**
```json
{
  "data": [
    {
      "id": "gpt-4o-mini",
      "object": "model",
      "created": 1234567890,
      "owned_by": "openai"
    }
  ]
}
```

### Chat Completions
```bash
POST /api/chat/completions
```

Creates a chat completion using the specified model.

**Request:**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
```

**Response:**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you for asking!"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Access to LiteLLM Gateway (running on localhost:4000 or via Docker network)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Create .env file
   cat > .env << EOF
   PORT=3000
   LITELLM_BASE_URL=http://localhost:4000
   LITELLM_API_KEY=optional-if-litellm-requires-auth
   NODE_ENV=development
   EOF
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

### Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test models endpoint
curl http://localhost:3000/api/models

# Test chat completions
curl -X POST http://localhost:3000/api/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Docker

### Build Image

```bash
docker build -t mpc-api:latest .
```

### Run Container

```bash
docker run -d \
  --name mpc-api \
  -p 3000:3000 \
  -e LITELLM_BASE_URL=http://litellm:4000 \
  -e LITELLM_API_KEY=your-key \
  --network ai-infra-net \
  mpc-api:latest
```

### Docker Compose

```bash
# Start MPC-API and LiteLLM together
docker compose up -d

# View logs
docker compose logs -f mpc-api

# Stop services
docker compose down
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port for MPC-API server |
| `LITELLM_BASE_URL` | `http://litellm:4000` | Base URL for LiteLLM Gateway |
| `LITELLM_API_KEY` | - | Optional API key for LiteLLM authentication |
| `NODE_ENV` | `production` | Node environment (development/production) |

## Integration with AI Services

### From Dify

Configure Dify to use MPC-API as the model provider:
```
API Base URL: http://mpc-api:3000/api
API Key: (if configured)
```

### From Langflow

Add HTTP Request component with:
```
URL: http://mpc-api:3000/api/chat/completions
Method: POST
Headers: Content-Type: application/json
```

### From Activepieces

Add HTTP Request step:
```
URL: {{env.MPC_API_BASE_URL}}/api/chat/completions
Method: POST
Headers:
  Content-Type: application/json
Body: {
  "model": "gpt-4o-mini",
  "messages": [...]
}
```

## Error Handling

MPC-API provides consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `404` - Endpoint not found
- `502` - Bad Gateway (LiteLLM error)
- `500` - Internal server error

## Service-to-Service Communication

When running in Docker, MPC-API communicates with LiteLLM using the internal network:

```typescript
// MPC-API configuration
LITELLM_BASE_URL=http://litellm:4000

// Internal request flow
POST http://mpc-api:3000/api/chat/completions
  → POST http://litellm:4000/chat/completions
    → Provider API (OpenAI, Anthropic, etc.)
```

This ensures:
- No direct provider calls from application code
- Centralized model access through LiteLLM
- Consistent API interface across all providers
- Easy provider switching and load balancing

## Monitoring

### Health Checks

Docker Compose includes built-in health checks:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Logs

View logs in real-time:
```bash
docker compose logs -f mpc-api
```

### Metrics

Request logging includes:
- Timestamp
- HTTP method
- Endpoint path
- Response status

## Security

- **No direct provider keys exposed** - All provider keys stored in LiteLLM Gateway
- **Optional authentication** - Add `LITELLM_API_KEY` if LiteLLM requires auth
- **Non-root user** - Docker container runs as non-root user (uid 1001)
- **Input validation** - Request validation before proxying to LiteLLM

## Troubleshooting

### Cannot connect to LiteLLM

**Problem:** MPC-API returns 502 errors

**Solutions:**
1. Check LiteLLM is running:
   ```bash
   curl http://localhost:4000/health
   ```

2. Check Docker network:
   ```bash
   docker network inspect ai-infra-net
   ```

3. Verify environment variable:
   ```bash
   docker compose exec mpc-api env | grep LITELLM
   ```

### Port already in use

**Problem:** Cannot start on port 3000

**Solutions:**
1. Change port in `.env`:
   ```
   PORT=3001
   ```

2. Or kill existing process:
   ```bash
   netstat -ano | findstr :3000
   taskkill /PID <pid> /F
   ```

### Model not found

**Problem:** LiteLLM returns "model not found" error

**Solutions:**
1. Check available models:
   ```bash
   curl http://localhost:3000/api/models
   ```

2. Verify model is configured in `ai-infra/litellm/config.yaml`

3. Ensure provider API keys are set in `.env`

## Development Roadmap

- [ ] Add request caching
- [ ] Implement rate limiting
- [ ] Add request/response logging to database
- [ ] Support for streaming responses
- [ ] WebSocket support for real-time interactions
- [ ] Metrics dashboard
- [ ] Cost tracking per model/user

## Contributing

When contributing to MPC-API:

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Ensure Docker build succeeds
5. Test integration with LiteLLM Gateway

## License

Part of the BananaStudio AI Infrastructure project.

---

**Last Updated:** 2025-11-18
