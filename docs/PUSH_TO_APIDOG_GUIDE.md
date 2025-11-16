# Push to Apidog Guide

Complete guide for pushing the BananaStudio API Hub to Apidog.

## Prerequisites

### 1. Apidog Account & API Token

You need an Apidog account with API access:

1. Log in to [Apidog](https://apidog.com)
2. Go to Account Settings → API Access Token
3. Generate a new token with the following permissions:
   - `project:write` - Required for importing data
   - `project:read` - Required for reading project details

**Important**: The token should be a Bearer token (single string), NOT a key:secret pair.

### 2. Project ID

The BananaStudio API Hub project ID is: `1128155`

You can verify this at: https://apidog.com/project/1128155

### 3. Environment Variables

Set these environment variables:

```bash
# Required
export APIDOG_ACCESS_TOKEN="your_token_here"

# Optional (defaults to 1128155)
export APIDOG_PROJECT_ID="1128155"
```

Or create a `.env` file:

```bash
APIDOG_ACCESS_TOKEN=your_token_here
APIDOG_PROJECT_ID=1128155
```

## Pre-Push Validation

Before pushing, validate that everything is ready:

```bash
npm run validate:push
```

This checks:
- ✅ Environment variables are set
- ✅ Bundle files exist and are valid
- ✅ OpenAPI spec is valid
- ✅ Bundle files are consistent

## Bundle Contents

The `apidog-ui-bundle/` directory contains:

| File | Purpose | Size |
|------|---------|------|
| `oas.json` | Complete OpenAPI 3.1.0 spec | ~19 KB |
| `folder_map.json` | Folder structure for UI | ~4 KB |
| `request_examples.json` | Request examples (5 endpoints) | ~6 KB |
| `response_examples.json` | Response examples | ~9 KB |
| `ui_metadata.json` | UI automation metadata | ~9 KB |

**Total**: ~47 KB

### API Coverage

- **5 Endpoints**:
  - `GET /models` - Fetch all models
  - `GET /models/pricing` - Get pricing info
  - `POST /models/pricing/estimate` - Estimate costs
  - `GET /models/usage` - Usage records (FAL)
  - `GET /models/analytics` - Analytics dashboard

- **13 Schemas**: CometModel, FalModel, PricingResponse, etc.

- **4 Folders**:
  - COMET_API (Comet Models)
  - FAL_API (FAL Platform)
  - BananaStudio_Internal (Internal services)
  - Utilities (Helper endpoints)

## Push Methods

### Method 1: Using npm Script (Recommended)

```bash
# Set environment variable
export APIDOG_ACCESS_TOKEN="your_token_here"

# Push to Apidog
npm run push:apidog
```

This runs: `tsx scripts/push_to_apidog.ts`

### Method 2: Direct API Push

```bash
# Using the REST API script
APIDOG_ACCESS_TOKEN="xxx" tsx scripts/push_to_apidog.ts
```

### Method 3: Manual Import via UI

If the API push fails, you can manually import:

1. Go to: https://apidog.com/project/1128155
2. Click **Project Settings** → **Import Data**
3. Select **OpenAPI/Swagger**
4. Upload file: `apidog-ui-bundle/oas.json`
5. Choose import options:
   - ✅ Import mode: **Merge** (update existing)
   - ✅ Create folders: **Yes**
   - ✅ Import examples: **Yes**
   - ✅ Generate mock servers: **Yes**
6. Preview and confirm

## Expected Results

After successful push, you should see:

### In Apidog UI

```
📦 BananaStudio API Hub (Project 1128155)
├── 🤖 COMET_API
│   └── Models
│       └── GET /models (Comet LLMs - 568 models)
├── 🎨 FAL_API
│   ├── Models
│   │   └── GET /models (FAL Creative - 866 models)
│   ├── Pricing
│   │   ├── GET /models/pricing
│   │   └── POST /models/pricing/estimate
│   └── Analytics
│       ├── GET /models/usage
│       └── GET /models/analytics
├── 🍌 BananaStudio_Internal
│   └── Registry
│       └── (Future endpoints)
└── 🔧 Utilities
    └── Health
        └── (Future endpoints)
```

### Success Metrics

- ✅ 5 endpoints imported
- ✅ 13 schemas available in components
- ✅ 4 folders created in UI
- ✅ Request examples attached
- ✅ Response examples for all endpoints
- ✅ Security schemes configured (Bearer + Key auth)
- ✅ Mock servers generated

## Troubleshooting

### Error: 401 Unauthorized

**Cause**: Invalid or missing API token

**Fix**:
```bash
# Verify token is set
echo $APIDOG_ACCESS_TOKEN

# Check token in Apidog:
# Account Settings → API Access Token → Verify scopes
```

### Error: 404 Not Found

**Cause**: Incorrect API endpoint or project ID

**Fix**:
```bash
# Verify project ID
echo $APIDOG_PROJECT_ID

# Verify project exists
# Visit: https://apidog.com/project/1128155

# Try alternative import methods (see Method 3)
```

### Error: 422 Validation Error

**Cause**: Invalid OpenAPI spec format

**Fix**:
```bash
# Validate the spec
npm run validate:push

# Check for external $refs (should be none)
jq '.components.schemas | to_entries[] | select(.value."$ref")' apidog-ui-bundle/oas.json

# Verify OpenAPI version
jq '.openapi' apidog-ui-bundle/oas.json  # Should be "3.1.0"
```

### Network Errors

**Cause**: Connectivity issues or firewall

**Fix**:
```bash
# Test connectivity
curl -I https://api.apidog.com/v1

# Check firewall/proxy settings
# Try manual import via UI (Method 3)
```

## API Endpoint Information

The push script attempts to use:

```
POST https://api.apidog.com/v1/projects/{project_id}/import-openapi
```

With headers:
```
Authorization: Bearer {token}
Content-Type: application/json
X-Apidog-Api-Version: 2024-03-28
```

**Note**: The Apidog REST API endpoints are not fully public. If the API push fails, use the manual UI import method.

## After Import

### 1. Verify Import

Visit: https://apidog.com/project/1128155

Check:
- ✅ Folder structure matches expected layout
- ✅ All 5 endpoints are present
- ✅ Request examples are attached
- ✅ Response examples show success/error cases
- ✅ Mock servers are available

### 2. Test Endpoints

1. Open an endpoint (e.g., `GET /models`)
2. Click "Try it out"
3. Add authentication (Bearer token for Comet, Key for FAL)
4. Send request and verify response

### 3. Generate Client SDKs

Apidog can auto-generate clients for:
- TypeScript/JavaScript
- Python
- Go
- Java
- Swift

### 4. Setup Environments

Create environments in Apidog:
- **Development**: dev.api.cometapi.com
- **Staging**: staging.api.cometapi.com
- **Production**: api.cometapi.com

### 5. Share with Team

Invite team members:
- Admin (full access)
- Developer (read/write)
- Viewer (read-only)

## Continuous Integration

For CI/CD pipelines:

```bash
# In your CI script
export APIDOG_ACCESS_TOKEN="${APIDOG_TOKEN_SECRET}"

# Validate bundle
npm run validate:push

# Push to Apidog
npm run push:apidog
```

Store `APIDOG_ACCESS_TOKEN` as a secret in your CI system:
- GitHub Actions: Repository Secrets
- GitLab CI: CI/CD Variables
- Jenkins: Credentials

## References

- [Apidog Documentation](https://docs.apidog.com)
- [Apidog API Reference](https://openapi.apidog.io/)
- [OpenAPI 3.1.0 Specification](https://spec.openapis.org/oas/v3.1.0)
- [API Hub README](./API_HUB_README.md)
- [Architecture Overview](./ARCHITECTURE.md)

## Support

For issues:

1. Check this guide's troubleshooting section
2. Validate bundle: `npm run validate:push`
3. Try manual import via UI
4. Contact Apidog support: https://apidog.com/help

## Version History

- **v1.0.0** (2024-12-15): Initial guide
- **Project ID**: 1128155
- **Bundle Version**: 1.0.0
- **Last Updated**: 2024-12-15

---

**Status**: ✅ Bundle Ready | **Bundle Size**: ~47 KB | **Endpoints**: 5 | **Schemas**: 13
