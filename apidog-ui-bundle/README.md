# Apidog UI Bundle

Complete bundle for importing **BananaStudio API Hub** into Apidog with full UI automation, folder structure, and examples.

## 📦 Bundle Contents

| File | Purpose | Size |
|------|---------|------|
| `oas.json` | Complete OpenAPI 3.1.0 spec with inline schemas (no external $refs) | ~14 KB |
| `folder_map.json` | Folder structure mapping for Apidog UI organization | ~3 KB |
| `request_examples.json` | Request examples for all endpoints (6 operations) | ~4 KB |
| `response_examples.json` | Response examples with success/error cases | ~8 KB |
| `ui_metadata.json` | UI hints, automation settings, documentation | ~8 KB |

**Total Bundle Size:** ~37 KB

## 🎯 What This Bundle Does

1. **Complete API Spec**: All 6 endpoints with inline schemas (no external references)
2. **Folder Organization**: 4 top-level folders (COMET_API, FAL_API, BananaStudio_Internal, Utilities)
3. **Request Examples**: Valid request bodies and query parameters for all operations
4. **Response Examples**: Success (200) and error responses (400/401/404) for all endpoints
5. **UI Automation**: Metadata for automatic Apidog UI generation (forms, tables, dashboards)

## 📊 API Coverage

### Endpoints (6 total)
- `GET /models` - Fetch all models (COMET: 568 LLMs, FAL: 866 creative)
- `GET /models/pricing` - Get pricing for 1,434 models
- `POST /models/pricing/estimate` - Estimate cost with parameters
- `GET /models/usage` - Historical usage records (FAL only)
- `GET /models/analytics` - Aggregated analytics dashboard

### Schemas (11 inline)
- `CometModel`, `CometModelsResponse`
- `FalModel`, `FalModelsResponse`
- `FalPricingResponse`
- `FalEstimatedCostRequest`, `FalEstimatedCostResponse`
- `FalUsageRecord`, `FalUsageResponse`
- `FalAnalyticsRecord`, `FalAnalyticsResponse`
- `UnifiedModelRecord`
- `ErrorResponse`

### Security
- **COMET_API**: Bearer token authentication
- **FAL_API**: Key authentication

## 🚀 Usage

### 1. Environment Setup
```bash
# Required: Apidog access token
export APIDOG_ACCESS_TOKEN="your_apidog_token_here"

# Optional: Override project ID (default: 1128155)
export APIDOG_PROJECT_ID="1128155"
```

### 2. Push to Apidog
```bash
# Using npm script (recommended)
npm run push:apidog

# Or directly with tsx
tsx scripts/push_to_apidog.ts
```

### 3. Verification
1. Visit Apidog UI: `https://apidog.com/project/1128155`
2. Check folder structure (4 folders: COMET_API, FAL_API, BananaStudio_Internal, Utilities)
3. Verify endpoints (6 operations with examples)
4. Test request/response examples
5. Review UI metadata (forms, dashboards, automation)

## 📁 Folder Structure in Apidog

```
📦 BananaStudio API Hub (1128155)
├── 🤖 COMET_API
│   └── Models
│       └── GET /models (Comet LLMs)
├── 🎨 FAL_API
│   ├── Models
│   │   └── GET /models (FAL Creative)
│   ├── Pricing
│   │   ├── GET /models/pricing
│   │   └── POST /models/pricing/estimate
│   └── Analytics
│       ├── GET /models/usage
│       └── GET /models/analytics
├── 🍌 BananaStudio_Internal
│   └── Registry
│       └── (Future: Internal registry endpoints)
└── 🔧 Utilities
    └── Health
        └── (Future: Health check endpoints)
```

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
