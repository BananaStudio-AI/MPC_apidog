# Push to Apidog - Quick Start

## 🎯 Overview

This repository contains everything needed to push the **BananaStudio API Hub** to Apidog. The bundle is **ready** and **validated** - only the API token is needed to complete the push.

## ✅ Current Status

**Bundle Status**: ✅ Ready to Push

- ✅ All 5 bundle files validated
- ✅ OpenAPI 3.1.0 spec (5 endpoints, 13 schemas)
- ✅ Folder structure defined (4 folders)
- ✅ Request/response examples included
- ✅ UI automation metadata configured

**Bundle Size**: ~47 KB  
**Project ID**: 1128155  
**Apidog URL**: https://apidog.com/project/1128155

## 🚀 Quick Start

### 1. Get API Token

1. Log in to [Apidog](https://apidog.com)
2. Go to **Account Settings** → **API Access Token**
3. Generate token with permissions:
   - `project:write` (required)
   - `project:read` (required)

### 2. Set Environment Variable

```bash
export APIDOG_ACCESS_TOKEN="your_token_here"
```

### 3. Validate & Push

```bash
# Validate everything is ready
npm run validate:push

# Push to Apidog
npm run push:apidog
```

### 4. Verify

Visit https://apidog.com/project/1128155 to see your imported API Hub with:
- 5 endpoints organized in 4 folders
- 13 schemas
- Request/response examples
- Auto-generated mock servers

## 📁 Repository Structure

```
.
├── apidog-ui-bundle/          # Ready-to-push bundle
│   ├── oas.json               # OpenAPI 3.1.0 spec
│   ├── folder_map.json        # UI folder structure
│   ├── request_examples.json  # Request examples
│   ├── response_examples.json # Response examples
│   └── ui_metadata.json       # UI automation hints
│
├── scripts/
│   ├── push_to_apidog.ts      # Push script
│   └── validate_push_readiness.ts  # Validation script
│
├── docs/
│   ├── PUSH_TO_APIDOG_GUIDE.md    # Comprehensive guide
│   └── PUSH_TO_APIDOG_SUMMARY.md  # Task summary
│
└── demo_push.sh               # Demo workflow script
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [Push Guide](docs/PUSH_TO_APIDOG_GUIDE.md) | Complete guide with troubleshooting |
| [Task Summary](docs/PUSH_TO_APIDOG_SUMMARY.md) | What's been completed |
| [Bundle README](apidog-ui-bundle/README.md) | Bundle contents details |

## 🛠️ Available Commands

```bash
# Validate bundle is ready
npm run validate:push

# Push to Apidog (requires APIDOG_ACCESS_TOKEN)
npm run push:apidog

# Run demo workflow (no actual push)
./demo_push.sh
```

## 📊 What Gets Imported

### Endpoints (5)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/models` | Fetch all models (Comet: 568, FAL: 866) |
| GET | `/models/pricing` | Get pricing for 1,434 models |
| POST | `/models/pricing/estimate` | Estimate costs with parameters |
| GET | `/models/usage` | Historical usage records (FAL) |
| GET | `/models/analytics` | Aggregated analytics dashboard |

### Folder Structure

```
📦 BananaStudio API Hub (1128155)
├── 🤖 COMET_API
│   └── Models
├── 🎨 FAL_API
│   ├── Models
│   ├── Pricing
│   └── Analytics
├── 🍌 BananaStudio_Internal
│   └── Registry
└── 🔧 Utilities
    └── Health
```

### Schemas (13)

- CometModel, CometModelsResponse
- FalModel, FalModelsResponse
- FalPricingResponse
- FalEstimatedCostRequest/Response
- FalUsageRecord, FalUsageResponse
- FalAnalyticsRecord, FalAnalyticsResponse
- UnifiedModelRecord
- ErrorResponse

## 🔧 Troubleshooting

### Error: APIDOG_ACCESS_TOKEN not set

```bash
# Set the token
export APIDOG_ACCESS_TOKEN="your_token_here"

# Verify it's set
echo $APIDOG_ACCESS_TOKEN
```

### Error: 401 Unauthorized

- Verify token is valid in Apidog settings
- Check token has `project:write` permission
- Try regenerating the token

### Error: 404 Not Found

- Verify project ID: 1128155
- Try manual UI import (see guide)

For more troubleshooting, see [Push Guide](docs/PUSH_TO_APIDOG_GUIDE.md).

## 🎯 Alternative: Manual UI Import

If API push fails, you can manually import via Apidog UI:

1. Visit https://apidog.com/project/1128155
2. **Project Settings** → **Import Data**
3. Select **OpenAPI/Swagger**
4. Upload: `apidog-ui-bundle/oas.json`
5. Choose **Merge** mode with folder creation
6. Confirm import

## 🤝 CI/CD Integration

For automated pipelines:

```yaml
# GitHub Actions example
- name: Push to Apidog
  run: npm run push:apidog
  env:
    APIDOG_ACCESS_TOKEN: ${{ secrets.APIDOG_ACCESS_TOKEN }}
```

Store `APIDOG_ACCESS_TOKEN` as a repository secret.

## 📞 Support

- **Documentation**: See [docs/PUSH_TO_APIDOG_GUIDE.md](docs/PUSH_TO_APIDOG_GUIDE.md)
- **Validation**: Run `npm run validate:push`
- **Demo**: Run `./demo_push.sh`
- **Apidog Help**: https://apidog.com/help

## ✨ Next Steps After Push

1. ✅ Verify import at https://apidog.com/project/1128155
2. 📝 Test endpoints with examples
3. 🔧 Generate client SDKs (TypeScript, Python, Go, etc.)
4. 🚀 Set up mock servers for development
5. 👥 Share with team members

---

**Status**: ✅ Ready to Push  
**Last Updated**: 2024-12-15  
**Version**: 1.0.0
