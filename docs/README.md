# API Hub Documentation

Comprehensive documentation for BananaStudio API Hub - unified integration of Comet API (568 LLMs) and FAL Platform (866 creative models).

## 📚 Core Documentation

### Getting Started
- **[API Hub v2.0 Guide](./API_HUB_V2_RESTRUCTURE.md)** - Complete restructure guide with architecture, migration, and deployment
- **[API Hub README](./API_HUB_README.md)** - Usage examples and integration patterns for BananaStudio agents
- **[Production Checklist](./PRODUCTION_CHECKLIST.md)** - Pre-deployment validation steps

### Configuration & Setup
- **[MCP Configuration](./MCP_CONFIGURATION.md)** - VS Code/Cursor MCP server setup
- **[Apidog Workflows](./APIDOG_WORKFLOWS.md)** - OAS pull/push automation
- **[Architecture](./ARCHITECTURE.md)** - System design and integration patterns

## 🔌 API References

### Comet API (LLM Gateway)
- **Base URL**: `https://api.cometapi.com/v1`
- **Models**: 568 language models (GPT-4, Claude, Gemini, DeepSeek, Llama)
- **Authentication**: Bearer token
- **Endpoints**: `/comet/models`

### FAL Platform (Creative AI)
- **Base URL**: `https://api.fal.ai/v1`
- **Models**: 866 creative models (FLUX, Stable Diffusion, video, audio) 
- **Authentication**: Key header
- **Endpoints**: `/fal/models`, `/fal/models/pricing`, `/fal/models/pricing/estimate`, `/fal/models/usage`, `/fal/models/analytics`

## 🛠️ Developer Resources

- **OpenAPI Spec**: [`../openapi/api-hub.oas.json`](../openapi/api-hub.oas.json) - Canonical v2.0.0 specification
- **TypeScript Client**: [`../apis/api-hub-client/`](../apis/api-hub-client/) - Auto-generated from OAS
- **Model Registry**: [`../apis/model_registry/`](../apis/model_registry/) - Unified 1,434-model catalog service
- **Scripts**: [`../scripts/`](../scripts/) - Automation tools for sync, validation, and client generation

## 📊 Quick Reference

```bash
# Generate client from OAS
npm run generate:api-hub-client

# Sync model registry from APIs
npm run sync:model-registry

# Validate API connectivity
npm run health:api-hub

# Push OAS to Apidog
npm run push:apidog
```

## 🎯 Use Cases

- **AI Agent Orchestration**: Model selection and routing
- **Cost Management**: Pricing estimation and usage tracking
- **Creative Workflows**: Generative AI pipeline integration
- **Model Discovery**: Semantic search across 1,434 models
- **API Governance**: MCP-driven specification management

---

**Version:** 2.0.0  
**Last Updated:** November 16, 2025
