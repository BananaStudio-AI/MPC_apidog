# LiteLLM Provider Configuration Examples

This directory contains example configuration files for different LiteLLM deployment scenarios.

## Available Configurations

### 1. `openai-only.yaml`
**Use Case:** OpenAI-only deployment
- GPT-4o, GPT-4o-mini
- GPT-4 Turbo, GPT-4
- GPT-3.5 Turbo

**Usage:**
```bash
litellm --config ai-infra/litellm/config/openai-only.yaml --port 4000
```

### 2. `anthropic-only.yaml`
**Use Case:** Anthropic Claude-only deployment
- Claude 3.5 Sonnet
- Claude 3 Opus, Sonnet, Haiku

**Usage:**
```bash
litellm --config ai-infra/litellm/config/anthropic-only.yaml --port 4000
```

### 3. `multi-provider.yaml`
**Use Case:** Multiple providers with load balancing
- OpenAI (GPT-4o, GPT-4o-mini)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- Azure OpenAI (optional)
- Load balancing with Redis
- Rate limiting per model

**Usage:**
```bash
litellm --config ai-infra/litellm/config/multi-provider.yaml --port 4000
```

**Requirements:**
- Redis must be running (for load balancing)
- Set `REDIS_HOST` and `REDIS_PORT` environment variables

### 4. `production-fallback.yaml`
**Use Case:** Production deployment with automatic fallbacks
- Primary and fallback providers for each model
- Automatic failover
- Request logging
- Alerting integration (Slack, Prometheus)
- Retry logic

**Usage:**
```bash
litellm --config ai-infra/litellm/config/production-fallback.yaml --port 4000
```

**Requirements:**
- Redis for coordination
- Database URL for request logging (optional)
- Slack webhook for alerts (optional)

## Environment Variables

All configurations require specific environment variables:

### Required (at least one provider)
```bash
OPENAI_API_KEY=sk-...                    # OpenAI API key
ANTHROPIC_API_KEY=sk-ant-...             # Anthropic API key
LITELLM_MASTER_KEY=your-secret-key       # Gateway auth key
```

### Optional (for advanced features)
```bash
# Azure OpenAI
AZURE_API_BASE=https://your-resource.openai.azure.com
AZURE_API_KEY=your-azure-key

# Redis (for load balancing)
REDIS_HOST=localhost
REDIS_PORT=6379

# Database (for logging)
DATABASE_URL=postgresql://user:pass@localhost:5432/litellm

# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

## Using with Docker Compose

To use a different config in docker-compose.yml:

```yaml
litellm:
  volumes:
    - ./ai-infra/litellm/config/multi-provider.yaml:/app/config.yaml:ro
```

## Creating Custom Configurations

### Basic Structure
```yaml
model_list:
  - model_name: my-model
    litellm_params:
      model: provider/model-name
      api_key: ${API_KEY}

general_settings:
  master_key: ${LITELLM_MASTER_KEY}

litellm_settings:
  drop_params: true
  json_logs: true
```

### Supported Providers
- OpenAI (`openai/model-name`)
- Anthropic (`anthropic/model-name`)
- Azure OpenAI (`azure/deployment-name`)
- Cohere (`cohere/model-name`)
- Replicate (`replicate/model-name`)
- HuggingFace (`huggingface/model-name`)
- And many more...

See [LiteLLM documentation](https://docs.litellm.ai/docs/providers) for full provider list.

## Testing Configurations

### Health Check
```bash
curl http://localhost:4000/health
```

### List Models
```bash
curl http://localhost:4000/models
```

### Test Chat Completion
```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${LITELLM_MASTER_KEY}" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Troubleshooting

### Config not loading
- Check YAML syntax with: `yamllint config.yaml`
- Verify all environment variables are set
- Check file path in docker-compose.yml or command line

### Provider errors
- Verify API keys are valid and have credits
- Check provider-specific rate limits
- Review logs: `docker logs litellm-gateway`

### Load balancing not working
- Ensure Redis is running
- Verify Redis connection settings
- Check `router_settings` in config

## Best Practices

1. **Use environment variables** for all secrets
2. **Enable rate limiting** to avoid provider quota issues
3. **Set up fallbacks** for critical models in production
4. **Monitor usage** with logging and metrics
5. **Test thoroughly** before deploying to production
6. **Keep configs in version control** (without secrets)

## Additional Resources

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Supported Providers](https://docs.litellm.ai/docs/providers)
- [Load Balancing Guide](https://docs.litellm.ai/docs/routing)
- [Rate Limiting](https://docs.litellm.ai/docs/proxy/rate_limiting)
