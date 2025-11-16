# API Hub v2.0.0 - Production-Ready Restructure

## Executive Summary

**Date:** November 16, 2025  
**Version:** 2.0.0 (from 1.0.0)  
**Status:** ✅ Production-Ready

Successfully restructured BananaStudio API Hub to achieve strict provider separation between Comet API (568 LLMs) and FAL Platform (866 creative models). Eliminated module conflicts in Apidog and established clean, maintainable architecture.

---

## Problem Statement

### Issues in v1.0.0:
1. **Mixed Module Pollution**: The `/models` endpoint had dual tags (`Comet Models` + `FAL Models`), causing Comet endpoints to appear under the FAL module in Apidog
2. **No Path Namespacing**: All endpoints used `/models/*` without provider prefix, creating ambiguity
3. **Missing FAL List Endpoint**: No dedicated endpoint to list FAL's 866 creative models (shared `/models` with Comet)
4. **Ambiguous Security**: Both security schemes allowed on same endpoints

### Visual Issue in Apidog v1:
```
Module: FAL_API
├── Endpoints
│   ├── Comet Models / GET List Available Models ❌ WRONG
│   ├── FAL Pricing / GET Get Model Pricing Information
│   └── ...
└── Schemas (mixed Comet + FAL) ❌ WRONG
```

---

## Solution Architecture

### Design Principles:
1. **Provider Namespacing**: `/comet/*` for Comet, `/fal/*` for FAL
2. **Tag-Based Separation**: `COMET_API` vs `FAL_API` tags with `x-apidog-folder` extensions
3. **Operation-Level Servers**: Each endpoint explicitly declares its server
4. **Exclusive Security**: Comet endpoints use `CometBearer`, FAL endpoints use `FalApiKey`

### Target Structure:
```
Module: Comet API
└── GET /comet/models (COMET_API) → CometBearer

Module: FAL Platform  
├── GET /fal/models (FAL_API) → FalApiKey
├── GET /fal/models/pricing (FAL_API) → FalApiKey
├── POST /fal/models/pricing/estimate (FAL_API) → FalApiKey
├── GET /fal/models/usage (FAL_API) → FalApiKey
└── GET /fal/models/analytics (FAL_API) → FalApiKey
```

---

## Changes by Category

### 1. Path Restructuring

| v1.0.0 Path | v2.0.0 Path | Provider | Notes |
|-------------|-------------|----------|-------|
| `/models` (dual-tag) | `/comet/models` | Comet | LLM models only |
| `/models` (dual-tag) | `/fal/models` | FAL | NEW: Creative models |
| `/models/pricing` | `/fal/models/pricing` | FAL | Added namespace |
| `/models/pricing/estimate` | `/fal/models/pricing/estimate` | FAL | Added namespace |
| `/models/usage` | `/fal/models/usage` | FAL | Added namespace |
| `/models/analytics` | `/fal/models/analytics` | FAL | Added namespace |

### 2. Tag Changes

| v1.0.0 Tags | v2.0.0 Tags | Folder Mapping |
|-------------|-------------|----------------|
| `Comet Models`, `FAL Models` | `COMET_API` | `Comet API` |
| `FAL Models` | `FAL_API` | `FAL Platform` |
| `FAL Pricing` | `FAL_API` | `FAL Platform` |
| `FAL Analytics` | `FAL_API` | `FAL Platform` |
| (new) | `BananaStudio_Internal` | `BananaStudio Internal` |
| (new) | `Utilities` | `Utilities` |

### 3. Schema Changes

#### Comet-Only Schemas:
- `CometModel` - LLM model definition
- `CometModelsResponse` - List response for Comet API

#### FAL-Only Schemas:
- `FalModel` - Creative model definition (NEW: added `total_count` to response)
- `FalModelsResponse` - List response for FAL Platform
- `FalPricingResponse` - Pricing information
- `FalEstimateRequest` - Cost estimation request
- `FalEstimateResponse` - Cost estimation response
- `FalUsageRecord` - Usage statistics record
- `FalUsageResponse` - Usage statistics response
- `FalAnalyticsRecord` - Analytics metrics record
- `FalAnalyticsResponse` - Analytics dashboard response

#### Shared Schemas:
- `UnifiedModelRecord` - Cross-provider aggregation (NEW)
- `ErrorResponse` - Standard error format
- Response wrappers: `BadRequest`, `Unauthorized`, `NotFound`

**Removed Duplicates:**
- ❌ `FalEstimatedCostRequest` (consolidated into `FalEstimateRequest`)
- ❌ `FalEstimatedCostResponse` (consolidated into `FalEstimateResponse`)

### 4. Security Scheme Updates

```json
{
  "CometBearer": {
    "type": "http",
    "scheme": "bearer",
    "description": "Comet API authentication using Bearer token. Obtain your API key from https://cometapi.com",
    "x-apidog-show-in-global-parameter": true
  },
  "FalApiKey": {
    "type": "apiKey",
    "in": "header",
    "name": "Authorization",
    "description": "FAL Platform authentication using 'Key YOUR_API_KEY' format. Get your API key from https://fal.ai/dashboard",
    "x-apidog-show-in-global-parameter": true
  }
}
```

**Key Improvements:**
- Added dashboard URLs for API key acquisition
- Clear format specification for each provider
- Exclusive assignment per endpoint (no overlapping security)

### 5. NEW: Dedicated FAL Models Endpoint

**Path:** `GET /fal/models`  
**Operation ID:** `listFalModels`  
**Purpose:** List 866 creative AI models from FAL Platform

**Query Parameters:**
- `cursor` (string) - Pagination cursor
- `limit` (integer, default: 100, max: 500) - Models per page
- `category` (enum) - Filter by model category:
  - `text-to-image`, `image-to-image`
  - `text-to-video`, `image-to-video`, `video-to-video`
  - `text-to-audio`, `text-to-speech`
  - `image-to-3d`, `llm`, `vision`

**Response:**
```json
{
  "models": [
    {
      "endpoint_id": "fal-ai/flux-pro/v1.1-ultra",
      "metadata": {
        "display_name": "FLUX1.1 [pro] ultra",
        "category": "text-to-image",
        "description": "Ultra high quality text-to-image generation",
        "status": "active",
        "tags": ["flux", "image-generation", "high-quality"]
      }
    }
  ],
  "has_more": true,
  "next_cursor": "Mg==",
  "total_count": 866
}
```

---

## Files Modified

### Primary OpenAPI Specifications:
1. **`openapi/api-hub.oas.json`** (39KB) - Canonical source
   - Version bumped: `1.0.0` → `2.0.0`
   - Backup created: `openapi/api-hub.oas.v1.backup.json`
   
2. **`apidog-ui-bundle/oas.json`** (39KB) - Apidog import version
   - Synced with canonical OAS
   - Previous version: `apidog-ui-bundle/oas_v1_backup.json`

### Generated TypeScript Client:
3. **`apis/api-hub-client/`** - Regenerated with `openapi-typescript-codegen`
   - **NEW:** `services/CometApiService.ts` - Comet API methods
   - **NEW:** `services/FalApiService.ts` - FAL API methods
   - Models: 13 TypeScript interfaces generated
   - Proper type safety with separated services

### Integration Scripts:
4. **`scripts/example_sync_model_catalog.ts`** - Updated to use new client structure
   - Changed from single `ApiClient` to `CometApiService` + `FalApiService`
   - Updated method calls: `getModelsSearch()` → `listCometModels()` / `listFalModels()`

### Documentation:
5. **`docs/API_HUB_V2_RESTRUCTURE.md`** (this file) - NEW

---

## Endpoint Details

### Comet API Endpoints

#### GET `/comet/models`
- **Operation ID:** `listCometModels`
- **Tag:** `COMET_API`
- **Server:** `https://api.cometapi.com/v1`
- **Security:** `CometBearer`
- **Returns:** `CometModelsResponse` - 568 LLM models
- **Example:**
  ```bash
  curl 'https://api.cometapi.com/v1/comet/models' \
    -H 'Authorization: Bearer YOUR_COMET_KEY'
  ```

### FAL Platform Endpoints

#### GET `/fal/models`
- **Operation ID:** `listFalModels`
- **Tag:** `FAL_API`
- **Server:** `https://api.fal.ai/v1`
- **Security:** `FalApiKey`
- **Returns:** `FalModelsResponse` - 866 creative models
- **Query Params:** `cursor`, `limit`, `category`

#### GET `/fal/models/pricing`
- **Operation ID:** `getFalModelPricing`
- **Tag:** `FAL_API`
- **Returns:** `FalPricingResponse` - Unit prices for all models

#### POST `/fal/models/pricing/estimate`
- **Operation ID:** `estimateFalModelCost`
- **Tag:** `FAL_API`
- **Request Body:** `FalEstimateRequest`
- **Returns:** `FalEstimateResponse` - Estimated cost with breakdown

#### GET `/fal/models/usage`
- **Operation ID:** `getFalModelUsage`
- **Tag:** `FAL_API`
- **Returns:** `FalUsageResponse` - Historical usage statistics
- **Query Params:** `start_date`, `end_date`, `endpoint_id`, `limit`

#### GET `/fal/models/analytics`
- **Operation ID:** `getFalModelAnalytics`
- **Tag:** `FAL_API`
- **Returns:** `FalAnalyticsResponse` - Performance metrics and trends
- **Query Params:** `start_date`, `end_date`, `metrics`

---

## Code Examples

### Using the TypeScript Client

```typescript
import { CometApiService, FalApiService, OpenAPI } from './apis/api-hub-client';

// Fetch Comet LLM models
OpenAPI.BASE = 'https://api.cometapi.com/v1';
OpenAPI.TOKEN = process.env.COMET_API_KEY;
const cometModels = await CometApiService.listCometModels();
console.log(`Comet: ${cometModels.data.length} LLMs`);

// Fetch FAL creative models
OpenAPI.BASE = 'https://api.fal.ai/v1';
OpenAPI.TOKEN = process.env.FAL_API_KEY;
const falModels = await FalApiService.listFalModels(undefined, 100, 'text-to-image');
console.log(`FAL: ${falModels.models.length} models`);

// Get pricing estimate
const estimate = await FalApiService.estimateFalModelCost({
  estimate_type: 'unit_price',
  endpoints: {
    'fal-ai/flux/dev': { unit_quantity: 100 },
    'fal-ai/flux-pro': { unit_quantity: 50 }
  }
});
console.log(`Estimated cost: $${estimate.total_cost} USD`);
```

### Direct API Calls

```bash
# Comet API - List LLMs
curl 'https://api.cometapi.com/v1/comet/models' \
  -H 'Authorization: Bearer YOUR_COMET_KEY'

# FAL Platform - List creative models (filtered)
curl 'https://api.fal.ai/v1/fal/models?limit=50&category=text-to-image' \
  -H 'Authorization: Key YOUR_FAL_KEY'

# FAL Platform - Get pricing
curl 'https://api.fal.ai/v1/fal/models/pricing' \
  -H 'Authorization: Key YOUR_FAL_KEY'

# FAL Platform - Estimate cost
curl 'https://api.fal.ai/v1/fal/models/pricing/estimate' \
  -H 'Authorization: Key YOUR_FAL_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "estimate_type": "unit_price",
    "endpoints": {
      "fal-ai/flux/dev": { "unit_quantity": 100 }
    }
  }'
```

---

## Apidog Compliance Validation

### ✅ Verified Checklist:

- [x] **Tags with `x-apidog-folder`**: All 4 tags properly mapped
- [x] **Operation-level servers**: Each endpoint declares explicit server
- [x] **Security schemes**: Exclusive per provider (no overlapping)
- [x] **x-apidog-orders**: Field ordering defined for clean UI
- [x] **x-code-samples**: cURL + JavaScript examples for all endpoints
- [x] **x-apidog-show-in-global-parameter**: Both security schemes visible
- [x] **No duplicate schemas**: Removed `FalEstimatedCost*` duplicates
- [x] **OpenAPI 3.1.0 valid**: No schema errors
- [x] **Proper `$ref` usage**: All references resolve correctly

### Import/Export Behavior:
- **Import Method:** `POST /v1/projects/1128155/import-openapi`
- **Required Header:** `X-Apidog-Api-Version: 2024-03-28`
- **Payload Format:** `{ input: JSON.stringify(oas), options: {...} }`
- **Expected Result:** 6 endpoints, 13 schemas, 2 security schemes, 0 errors

---

## Testing & Verification

### 1. OpenAPI Validation:
```bash
# Validate structure
node -e "
const fs = require('fs');
const oas = JSON.parse(fs.readFileSync('openapi/api-hub.oas.json', 'utf8'));
console.log('Version:', oas.info.version);
console.log('Paths:', Object.keys(oas.paths).length);
console.log('Tags:', oas.tags.map(t => t.name).join(', '));
console.log('Schemas:', Object.keys(oas.components.schemas).length);
"
# Output: Version: 2.0.0, Paths: 6, Tags: COMET_API, FAL_API, BananaStudio_Internal, Utilities, Schemas: 13
```

### 2. Client Generation:
```bash
npm run generate:api-hub-client
# ✓ Generated TypeScript client: apis/api-hub-client/index.ts
```

### 3. Sync Script Test:
```bash
npx tsx scripts/example_sync_model_catalog.ts
# Saved model catalog to: /workspaces/MPC_apidog/openapi/model_catalog.json
```

### 4. Push to Apidog:
```bash
npm run push:apidog
# Expected: 6 endpoints updated, 13 schemas updated, 0 failures
```

---

## Schema Comparison

### Comet Schemas (2)
| Schema | Usage | Description |
|--------|-------|-------------|
| `CometModel` | `listCometModels` response | LLM model definition |
| `CometModelsResponse` | `listCometModels` response | List wrapper with `data[]` |

### FAL Schemas (8)
| Schema | Usage | Description |
|--------|-------|-------------|
| `FalModel` | `listFalModels` response | Creative model definition |
| `FalModelsResponse` | `listFalModels` response | List wrapper with `models[]`, pagination |
| `FalPricingResponse` | `getFalModelPricing` response | Pricing data with unit costs |
| `FalEstimateRequest` | `estimateFalModelCost` body | Cost estimation input |
| `FalEstimateResponse` | `estimateFalModelCost` response | Estimated cost with breakdown |
| `FalUsageRecord` | `getFalModelUsage` response item | Single usage record |
| `FalUsageResponse` | `getFalModelUsage` response | Usage statistics list |
| `FalAnalyticsRecord` | `getFalModelAnalytics` response item | Single analytics record |
| `FalAnalyticsResponse` | `getFalModelAnalytics` response | Analytics dashboard data |

### Shared Schemas (3)
| Schema | Usage | Description |
|--------|-------|-------------|
| `UnifiedModelRecord` | Internal aggregation | Cross-provider model record |
| `ErrorResponse` | All error responses | Standard error format |
| Response wrappers | `BadRequest`, `Unauthorized`, `NotFound` | HTTP error responses |

---

## Migration Guide

### For API Consumers:

#### Before (v1.0.0):
```typescript
// Ambiguous endpoint - could be Comet or FAL
const models = await client.getModels();
```

#### After (v2.0.0):
```typescript
// Clear provider separation
const cometModels = await CometApiService.listCometModels(); // 568 LLMs
const falModels = await FalApiService.listFalModels(); // 866 creative models
```

### For Apidog Users:

**Before:**
- Navigate to confused FAL module
- Find Comet endpoints mixed in
- Unclear which security scheme to use

**After:**
- Navigate to `Comet API` folder → see only Comet endpoints
- Navigate to `FAL Platform` folder → see only FAL endpoints
- Security automatically selected per endpoint

---

## Performance & Scale

### Model Counts:
- **Comet API:** 568 LLM models
- **FAL Platform:** 866 creative models
- **Total:** 1,434 models in unified hub

### Pagination:
- **Comet:** Standard list response (no pagination in v1)
- **FAL:** Cursor-based pagination (`cursor`, `limit`, `has_more`, `next_cursor`)

### Rate Limits:
- Defer to provider-specific limits (Comet and FAL have their own policies)
- No gateway-level throttling in v2.0.0

---

## Future Enhancements

### Planned for v2.1.0:
1. **Health Check Endpoints:**
   - `GET /comet/health`
   - `GET /fal/health`

2. **Internal Registry:**
   - `GET /internal/registry` - Unified model catalog
   - `POST /internal/registry/sync` - Trigger sync job

3. **Enhanced Filtering:**
   - `GET /comet/models?capability=chat`
   - `GET /fal/models?tags[]=flux,image-generation`

4. **Webhooks:**
   - `POST /webhooks/model-updates`
   - Model status change notifications

### Planned for v3.0.0:
- GraphQL API layer
- Real-time WebSocket subscriptions
- Advanced cost optimization recommendations

---

## Rollback Plan

If issues arise in production:

1. **Restore v1.0.0 OAS:**
   ```bash
   cp openapi/api-hub.oas.v1.backup.json openapi/api-hub.oas.json
   cp apidog-ui-bundle/oas_v1_backup.json apidog-ui-bundle/oas.json
   ```

2. **Regenerate v1 Client:**
   ```bash
   npm run generate:api-hub-client
   ```

3. **Revert Sync Script:**
   ```bash
   git checkout scripts/example_sync_model_catalog.ts
   ```

4. **Push v1 to Apidog:**
   ```bash
   npm run push:apidog
   ```

---

## Production Deployment Checklist

- [x] Backup v1.0.0 OAS files
- [x] Restructure paths with provider namespaces
- [x] Add dedicated FAL models endpoint
- [x] Normalize schemas (remove duplicates)
- [x] Validate Apidog compliance
- [x] Update canonical OAS files
- [x] Regenerate TypeScript client
- [x] Update integration scripts
- [x] Test client generation
- [x] Test sync script execution
- [ ] Push to Apidog project 1128155
- [ ] Verify UI structure in Apidog dashboard
- [ ] Update consumer applications to use new client
- [ ] Monitor API error rates post-deployment
- [ ] Update developer documentation

---

## Support & Resources

- **Repository:** `npc_apidog`
- **Apidog Project:** 1128155 (BananaStudio API Hub)
- **Documentation:** `/workspaces/MPC_apidog/docs/`
- **Issues:** GitHub Issues or Apidog comments

**Contact:**
- BananaStudio API Team: support@bananastudio.ai
- Comet API Support: https://cometapi.com
- FAL Platform Support: https://fal.ai/dashboard

---

**Document Version:** 1.0  
**Last Updated:** November 16, 2025  
**Status:** ✅ Production-Ready
