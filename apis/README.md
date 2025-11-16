# API Clients & Services

Auto-generated TypeScript client and unified model registry for BananaStudio API Hub.

## 📦 Contents

### `api-hub-client/`
TypeScript client auto-generated from `openapi/api-hub.oas.json` using `openapi-typescript-codegen`.

**Services:**
- `CometApiService` - Comet API operations (list LLM models)
- `FalApiService` - FAL Platform operations (models, pricing, usage, analytics)

**Models:**
- Provider-specific types: `CometModel`, `FalModel`, `FalPricingResponse`, etc.
- Unified types: `UnifiedModelRecord`, `ErrorResponse`

### `model_registry/`
Unified model catalog service aggregating Comet (568) + FAL (866) models.

**Features:**
- Fetch functions: `fetchCometModels()`, `fetchFalModels()`, `fetchAllModels()`
- Registry service: Load, filter, search across 1,434 models
- JSON caching: `data/model_registry.json`

## 🚀 Usage

### TypeScript Client

```typescript
import { CometApiService, FalApiService, OpenAPI } from './api-hub-client';

// Comet API
OpenAPI.BASE = 'https://api.cometapi.com/v1';
OpenAPI.TOKEN = process.env.COMET_API_KEY;
const cometModels = await CometApiService.listCometModels();

// FAL Platform
OpenAPI.BASE = 'https://api.fal.ai/v1';
OpenAPI.TOKEN = process.env.FAL_API_KEY;
const falModels = await FalApiService.listFalModels();
const pricing = await FalApiService.getFalModelPricing();
```

### Model Registry

```typescript
import { ModelRegistry } from './model_registry/service';

const registry = new ModelRegistry();
await registry.load();

const cometModels = registry.findModelsBySource('comet');
const fluxModels = registry.searchModelsByIdOrName('flux');
```

## 🔧 Generation

```bash
# Regenerate TypeScript client
npm run generate:api-hub-client

# Sync model registry
npm run sync:model-registry
```

## 📚 Documentation

See [`api-hub-client/README.md`](./api-hub-client/README.md) for detailed client usage.
