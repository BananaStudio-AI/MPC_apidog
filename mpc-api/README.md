# MPC-API

MPC API Gateway that proxies requests to LiteLLM and other AI infrastructure services.

## Features

- Proxies chat completion requests to LiteLLM Gateway
- Lists available models from LiteLLM
- Health checks for all dependent services
- TypeScript with Express.js
- Docker-ready

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run production build
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `PORT` - API server port (default: 3000)
- `LITELLM_BASE_URL` - LiteLLM Gateway URL (default: http://litellm:4000)
- `LITELLM_MASTER_KEY` - Authentication key for LiteLLM

## API Endpoints

### Health Check
```
GET /health
```

### List Models
```
GET /api/models
```

### Chat Completion
```
POST /api/chat/completions
Content-Type: application/json

{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

## Docker

```bash
# Build image
docker build -t mpc-api .

# Run with docker-compose
docker-compose up
```
