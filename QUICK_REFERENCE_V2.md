# API Hub v2.0.0 - Quick Reference

## Endpoints at a Glance

### Comet API (LLMs)
```
GET /comet/models
└─ 568 language models (GPT-4, Claude, Gemini, etc.)
└─ Auth: Bearer token
```

### FAL Platform (Creative AI)
```
GET  /fal/models
└─ 866 creative models (image, video, audio)
└─ Filters: category, limit, cursor

GET  /fal/models/pricing
└─ Unit prices for all models

POST /fal/models/pricing/estimate
└─ Calculate estimated costs

GET  /fal/models/usage
└─ Historical usage statistics

GET  /fal/models/analytics
└─ Performance metrics & trends

└─ Auth: Key YOUR_API_KEY (all endpoints)
```

---

## TypeScript Client Usage

```typescript
import { CometApiService, FalApiService, OpenAPI } from './apis/api-hub-client';

// Comet LLMs
OpenAPI.BASE = 'https://api.cometapi.com/v1';
OpenAPI.TOKEN = process.env.COMET_API_KEY;
const llms = await CometApiService.listCometModels();

// FAL Creative Models
OpenAPI.BASE = 'https://api.fal.ai/v1';
OpenAPI.TOKEN = process.env.FAL_API_KEY;
const creative = await FalApiService.listFalModels();

// Get Pricing
const pricing = await FalApiService.getFalModelPricing();

// Estimate Cost
const estimate = await FalApiService.estimateFalModelCost({
  estimate_type: 'unit_price',
  endpoints: {
    'fal-ai/flux/dev': { unit_quantity: 100 }
  }
});
```

---

## cURL Examples

```bash
# Comet - List LLMs
curl 'https://api.cometapi.com/v1/comet/models' \
  -H 'Authorization: Bearer YOUR_COMET_KEY'

# FAL - List creative models
curl 'https://api.fal.ai/v1/fal/models?limit=50&category=text-to-image' \
  -H 'Authorization: Key YOUR_FAL_KEY'

# FAL - Get pricing
curl 'https://api.fal.ai/v1/fal/models/pricing' \
  -H 'Authorization: Key YOUR_FAL_KEY'

# FAL - Estimate cost
curl -X POST 'https://api.fal.ai/v1/fal/models/pricing/estimate' \
  -H 'Authorization: Key YOUR_FAL_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"estimate_type":"unit_price","endpoints":{"fal-ai/flux/dev":{"unit_quantity":100}}}'
```

---

## Key Changes from v1.0.0

| Aspect | v1.0.0 | v2.0.0 |
|--------|--------|--------|
| **Comet Path** | `/models` (shared) | `/comet/models` |
| **FAL List** | `/models` (shared) | `/fal/models` (NEW) |
| **Tags** | Mixed (Comet+FAL) | Separated (COMET_API, FAL_API) |
| **Client** | Single `ApiClient` | `CometApiService` + `FalApiService` |
| **Security** | Mixed | Exclusive per provider |

---

## File Locations

- **Canonical OAS:** `openapi/api-hub.oas.json`
- **Apidog Bundle:** `apidog-ui-bundle/oas.json`
- **TypeScript Client:** `apis/api-hub-client/`
- **Sync Script:** `scripts/example_sync_model_catalog.ts`
- **Full Docs:** `docs/API_HUB_V2_RESTRUCTURE.md`

---

## Common Tasks

### Regenerate Client
```bash
npm run generate:api-hub-client
```

### Sync Model Catalog
```bash
npx tsx scripts/example_sync_model_catalog.ts
```

### Push to Apidog
```bash
npm run push:apidog
```

### Validate OAS
```bash
node -e "const oas=require('./openapi/api-hub.oas.json'); console.log('v'+oas.info.version, Object.keys(oas.paths).length, 'endpoints')"
```

---

## Environment Variables

```bash
COMET_API_KEY=your-comet-bearer-token
FAL_API_KEY=your-fal-api-key
APIDOG_ACCESS_TOKEN=your-apidog-token
APIDOG_PROJECT_ID=1128155
```

---

## Support

- **Docs:** `docs/API_HUB_V2_RESTRUCTURE.md`
- **Apidog Project:** https://apidog.com/project/1128155
- **Email:** support@bananastudio.ai
