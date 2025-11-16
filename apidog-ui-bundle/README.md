# Apidog UI Bundle v2.0

Complete production-ready bundle for **BananaStudio API Hub** with strict Comet/FAL provider separation and full Apidog best practices compliance.

## 📦 Bundle Contents

| File | Purpose | Status |
|------|---------|--------|
| `oas.json` | **OpenAPI 3.1.0 spec with complete Apidog extensions** | ✅ v2.0.0 |
| `oas_v1_backup.json` | Backup of v1.0 (pre-restructure) | 📦 Archive |
| `folder_map.json` | Folder structure reference | 📋 Reference |
| `request_examples.json` | Request examples | 📋 Reference |
| `response_examples.json` | Response examples | 📋 Reference |
| `ui_metadata.json` | UI automation metadata | 📋 Reference |

**Primary File:** `oas.json` - Self-contained with all Apidog extensions

## 🎯 Version 2.0 Features

### ✅ Strict Provider Separation
- **Path Namespacing**: `/comet/*` for Comet, `/fal/*` for FAL
- **Exclusive Tags**: `COMET_API` and `FAL_API` (no mixing)
- **Provider-Specific Security**: `CometBearer` for Comet, `FalApiKey` for FAL
- **Separate Schemas**: 2 Comet + 9 FAL + 2 shared = 13 total

### ✅ Apidog Best Practices Compliance
- `x-apidog-orders` on all operations and schemas
- `x-code-samples` with cURL examples on all endpoints
- `x-apidog-folder` for automatic folder organization
- `x-apidog-server-id` on all servers
- `x-apidog-show-in-global-parameter` on security schemes
- Rich examples with multiple scenarios per endpoint

### ✅ Complete API Coverage
1. **Comet API** (1 endpoint): LLM model listing
2. **FAL Platform** (5 endpoints): Models, pricing, usage, analytics, cost estimation
3. **Total**: 6 endpoints, 13 schemas, 2 security schemes

## 📊 API Structure

### Endpoints (6 total)
- `GET /comet/models` - List 568 LLM models (GPT-4, Claude, Gemini, etc.)
- `GET /fal/models` - List 866 creative AI models (FLUX, Stable Diffusion, video, audio)
- `GET /fal/models/pricing` - Get pricing information for FAL models
- `POST /fal/models/pricing/estimate` - Estimate costs for planned usage
- `GET /fal/models/usage` - Historical usage statistics
- `GET /fal/models/analytics` - Performance metrics and trends

### Schemas (13 total)

**Comet-Specific (2):**
- `CometModel`, `CometModelsResponse`

**FAL-Specific (9):**
- `FalModel`, `FalModelsResponse`
- `FalPricingResponse`
- `FalEstimateRequest`, `FalEstimateResponse`
- `FalUsageRecord`, `FalUsageResponse`
- `FalAnalyticsRecord`, `FalAnalyticsResponse`

**Shared (2):**
- `UnifiedModelRecord` - Cross-provider aggregation
- `ErrorResponse` - Standard error format

### Security
- **Comet API**: `CometBearer` - Bearer token (`Authorization: Bearer YOUR_COMET_KEY`)
- **FAL Platform**: `FalApiKey` - Key header (`Authorization: Key YOUR_FAL_KEY`)

## 🚀 Usage

### Push to Apidog
```bash
# Using npm script (recommended)
npm run push:apidog

# Project 1128155 will be updated with v2.0 spec
```

### Verify Import
1. Visit: `https://apidog.com/project/1128155`
2. Check folders: **Comet API** and **FAL Platform** (no mixing!)
3. Verify 6 endpoints with proper provider separation
4. Test with provided code samples

## 📁 Apidog UI Structure

```
📦 BananaStudio API Hub (Project 1128155)
├── 🧠 Comet API
│   └── GET /comet/models [COMET_API] 🔐 CometBearer
│       (568 LLM models: GPT-4, Claude, Gemini, DeepSeek, Llama)
│
├── 🎨 FAL Platform
│   ├── GET /fal/models [FAL_API] 🔐 FalApiKey
│   │   (866 creative models: FLUX, Stable Diffusion, video, audio)
│   ├── GET /fal/models/pricing [FAL_API] 🔐 FalApiKey
│   ├── POST /fal/models/pricing/estimate [FAL_API] 🔐 FalApiKey
│   ├── GET /fal/models/usage [FAL_API] 🔐 FalApiKey
│   └── GET /fal/models/analytics [FAL_API] 🔐 FalApiKey
│
├── 🏢 BananaStudio Internal (reserved)
└── 🔧 Utilities (reserved)
```

## ✅ Best Practices Checklist

- [x] Path namespacing (`/comet/*`, `/fal/*`)
- [x] Exclusive tags per provider
- [x] Provider-specific security schemes
- [x] `x-apidog-orders` on all operations
- [x] `x-apidog-orders` on all schemas
- [x] `x-code-samples` on all endpoints
- [x] `x-apidog-folder` for organization
- [x] `x-apidog-server-id` on servers
- [x] Multiple examples per endpoint
- [x] Detailed schema descriptions

## 📚 Documentation

See main project documentation:
- [API Hub v2.0 Guide](../docs/API_HUB_V2_RESTRUCTURE.md)
- [Production Checklist](../docs/PRODUCTION_CHECKLIST.md)
- [Architecture](../docs/ARCHITECTURE.md)

---

**Version:** 2.0.0  
**Status:** ✅ Production-Ready  
**Compliance:** Full Apidog best practices
│   │   └── GET /models (List creative models - 866 total)
│   ├── FAL Pricing
│   │   ├── GET /models/pricing (Get pricing info)
│   │   └── POST /models/pricing/estimate (Estimate costs)
│   └── FAL Analytics
│       ├── GET /models/usage (Usage statistics)
│       └── GET /models/analytics (Performance metrics)
│
└── 🍌 BananaStudio Internal
    └── (Reserved for internal services)
```

**Folder Organization Method:**
- Uses `x-apidog-folder` extension in tag definitions
- Automatically creates hierarchical folder structure
- Tags map to specific folders via naming convention

## 🔍 Bundle Validation

The `push_to_apidog.ts` script automatically validates:

✅ **Environment Variables**
- `APIDOG_ACCESS_TOKEN` is set
- `APIDOG_PROJECT_ID` is set (defaults to 1128155)

✅ **Bundle Files**
- All 5 required files exist
- JSON syntax is valid
- File sizes are reasonable

✅ **API Spec**
- OpenAPI 3.1.0 format
- All schemas are inline (no $refs)
- Security schemes defined
- Server URLs configured

## 📝 Request Examples Included

### GET /models
```json
{
  "headers": {
    "Authorization": "Bearer YOUR_COMET_API_KEY"
  }
}
```

### POST /models/pricing/estimate
```json
{
  "headers": {
    "Authorization": "Key YOUR_FAL_API_KEY",
    "Content-Type": "application/json"
  },
  "body": {
    "model_id": "fal-ai/flux-pro",
    "parameters": {
      "prompt": "A stunning landscape",
      "image_size": "landscape_4_3",
      "num_images": 1
    }
  }
}
```

## 🎨 UI Metadata Features

### Endpoint UI Hints
- **Response Types**: `table`, `card`, `dashboard`
- **Form Controls**: `autocomplete`, `date_picker`, `json_editor`, `multi_select`
- **Visualization**: Line charts, bar charts, pie charts
- **Export**: CSV/JSON export for analytics

### Automation Settings
- **Caching**: Per-endpoint cache duration (1h, 24h, 5m, 15m)
- **Pagination**: Cursor-based for FAL API
- **Retry Logic**: Exponential backoff on 429/500/503
- **Background Refresh**: Auto-update for analytics

### Documentation
- **Getting Started**: 4-step quick start guide
- **Model Categories**: Breakdown of 1,434 models
- **Pricing Notes**: Token-based (Comet) vs request-based (FAL)

## 🔧 Troubleshooting

### HTTP 401 Unauthorized
```bash
# Check token validity
echo $APIDOG_ACCESS_TOKEN

# Verify token permissions in Apidog settings
# Settings → Access Tokens → Verify scopes
```

### HTTP 422 Validation Error
```bash
# Validate OAS spec locally
npm run validate:oas

# Check for external $refs (should be none)
jq '.components.schemas | to_entries[] | select(.value."$ref")' apidog-ui-bundle/oas.json
```

### HTTP 404 Project Not Found
```bash
# Verify project ID
echo $APIDOG_PROJECT_ID

# Check project exists: https://apidog.com/project/1128155
```

## 📚 Related Documentation

- [Apidog REST API Docs](https://openapi.apidog.io/api-7312738)
- [OpenAPI 3.1.0 Spec](https://spec.openapis.org/oas/v3.1.0)
- [API Hub README](../docs/API_HUB_README.md)
- [Architecture Overview](../docs/ARCHITECTURE.md)

## 🎯 Next Steps After Import

1. **Generate Client SDKs**
   ```bash
   # Apidog can auto-generate SDKs for:
   # - TypeScript/JavaScript
   # - Python
   # - Go
   # - Java
   # - Swift
   ```

2. **Setup Mock Servers**
   ```bash
   # Apidog creates mock servers automatically
   # Use for frontend development before backend is ready
   ```

3. **Configure Environments**
   ```bash
   # Create environments in Apidog:
   # - Development (dev.api.cometapi.com)
   # - Staging (staging.api.cometapi.com)
   # - Production (api.cometapi.com)
   ```

4. **Share with Team**
   ```bash
   # Invite team members in Apidog
   # Assign roles: Admin, Developer, Viewer
   ```

## 📊 Import Success Metrics

After successful import, verify:

- ✅ **6 endpoints** imported correctly
- ✅ **11 schemas** available in components
- ✅ **4 folders** created in UI
- ✅ **Request examples** attached to operations
- ✅ **Response examples** for success/error cases
- ✅ **Security schemes** configured (Bearer + Key)
- ✅ **Mock servers** generated automatically

## 🤝 Contributing

To update the bundle:

1. **Modify Source OAS**: Edit `openapi/api-hub.oas.json`
2. **Regenerate Bundle**: The `push_to_apidog.ts` script reads from `apidog-ui-bundle/`
3. **Update Examples**: Edit `request_examples.json` or `response_examples.json`
4. **Push Changes**: Run `npm run push:apidog`

---

**Bundle Version:** 1.0.0  
**Last Updated:** 2024-12-15  
**Project ID:** 1128155  
**Maintainer:** BananaStudio API Team
