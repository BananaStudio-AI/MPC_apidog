# Legacy Apidog Integration

⚠️ **DEPRECATED**: This directory contains Apidog-specific scripts and tools that are no longer used in the runtime architecture.

## Migration Status

The repository has migrated from:
- **Old**: Apidog MCP server for OpenAPI spec management and direct external API calls
- **New**: Local Docker infrastructure with LiteLLM Gateway as the central model provider interface

## What's in This Directory

### `apidog/scripts/`
Scripts for interacting with the Apidog MCP server:
- `auth_check.js` - Validates Apidog API tokens
- `list_projects.js` - Lists Apidog projects
- `list_tools.js` - Lists available MCP tools
- `pull_endpoints_oas.js` - Pulls OpenAPI specs from Apidog
- `push_endpoints_oas.js` - Pushes OpenAPI specs to Apidog
- `push_oas_api.js` - Pushes full API to Apidog project
- `validate_specs.js` - Validates API specifications

### `apidog/api_specs/`
JSON specification files for API endpoints (historical reference only)

### `apidog/generated/`
Auto-generated files from Apidog pulls (gitignored)

### `apidog/mcp/`
MCP (Model Context Protocol) related configuration and tools

## Current Usage

### For Documentation Only
The Apidog integration is now used **only for documentation purposes**:
- OpenAPI specifications can still be pulled from Apidog for reference
- The `openapi/api-hub.oas.json` spec is maintained but no longer drives runtime behavior
- Generated TypeScript clients are preserved but not actively used

### Runtime Architecture
The new runtime architecture uses:
1. **LiteLLM Gateway** (`http://localhost:4000`) - Unified model provider gateway
2. **MPC-API** (`http://localhost:3000`) - Custom API service that proxies to LiteLLM
3. **Direct Docker services** - Dify, Langflow, Activepieces for orchestration

## If You Need to Use These Scripts

### Setup
```bash
# Install dependencies (if not already done)
npm install

# Configure API token
# Edit .env and set APIDOG_ACCESS_TOKEN
# Note: Must be a team/workspace token, not personal account token
```

### Available Commands (Legacy)
```bash
# Auth check
npm run apidog:auth-check

# List projects
npm run apidog:list-projects

# Pull latest OpenAPI spec
npm run apidog:pull

# Push spec changes (rarely needed)
npm run apidog:push:oas

# Validate specs
npm run apidog:validate
```

## Migration to LiteLLM

If you were using Apidog scripts for:

### 1. Calling External Model Providers
**Before**: Direct calls to FAL, Comet, OpenAI APIs via Apidog-managed endpoints
**After**: Call through LiteLLM Gateway or MPC-API
```typescript
// Old (direct API call)
const response = await fetch('https://api.openai.com/v1/chat/completions', { ... });

// New (via LiteLLM)
const response = await fetch('http://localhost:4000/chat/completions', { ... });

// Or via MPC-API
const response = await fetch('http://localhost:3000/api/chat/completions', { ... });
```

### 2. Managing API Specifications
**Before**: Apidog as source of truth for API specs
**After**: OpenAPI specs kept in `openapi/` directory for reference only

### 3. Generating TypeScript Clients
**Before**: Generated from Apidog-managed specs
**After**: Generate from local OpenAPI specs or use LiteLLM directly
```bash
# Still works, but targets LiteLLM now
npm run generate:api-hub-client
```

## Removal Considerations

These scripts and files can be safely removed if:
1. ✅ You no longer need to sync with Apidog
2. ✅ You're not using Apidog for API documentation
3. ✅ All team members are using the new Docker infrastructure
4. ✅ Historical API specs are backed up elsewhere

**Recommendation**: Keep for 3-6 months as reference, then remove if truly unused.

## See Also

- [AI Infrastructure Setup Guide](../ai-infra/AI_INFRA_SETUP.md)
- [Quick Reference](../ai-infra/QUICK_REFERENCE.md)
- [New Architecture Documentation](../ai-infra/ARCHITECTURE_NEW.md)

---

**Deprecated**: November 2025  
**Reason**: Migration to local Docker infrastructure with LiteLLM Gateway
