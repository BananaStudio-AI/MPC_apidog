# Current Architecture Analysis

## Repository Purpose

This repository (`MPC_apidog`) is currently an **API management and integration hub** that:
- Manages OpenAPI specifications for Comet API (568 LLM models) and FAL Platform (866 creative models)
- Uses Apidog MCP server for API specification management and sync
- Generates TypeScript clients from OpenAPI specs
- Provides model catalog synchronization and registry services

**Key Finding**: This is NOT a backend application service. It's primarily a tooling/integration layer for API management.

## Apidog/OpenAPI Dependencies

### Runtime Dependencies (Scripts & Tools)
Located in `apidog/scripts/`:
- `auth_check.js` - Validates Apidog API tokens
- `list_projects.js` - Lists Apidog projects
- `list_tools.js` - Lists available MCP tools
- `pull_endpoints_oas.js` - Pulls OpenAPI specs from Apidog
- `push_endpoints_oas.js` - Pushes OpenAPI specs to Apidog
- `push_oas_api.js` - Pushes full API to Apidog project
- `validate_specs.js` - Validates API specifications

### NPM Scripts Referencing Apidog
All in `package.json`:
```json
"apidog:list-projects", "apidog:auth-check", "apidog:list-tools",
"apidog:pull", "apidog:push", "apidog:push:oas", "apidog:push:api",
"apidog:pull:agents", "apidog:push:agents", "apidog:validate",
"apidog:import:api-hub", "push:apidog"
```

### Generated Artifacts
- `apis/api-hub-client/` - TypeScript client generated from OpenAPI specs
- `openapi/api-hub.oas.json` - Canonical OpenAPI 3.0.3 specification
- `apidog/generated/` - Raw specs pulled from Apidog (gitignored)

### Documentation References
- `README.md` - Mentions Apidog MCP integration extensively
- `docs/MCP_CONFIGURATION.md` - Apidog MCP server configuration
- `docs/API_HUB_V2_RESTRUCTURE.md` - API Hub architecture using Apidog

## Direct External Provider API Calls

### Current Direct Calls (No Intermediary)

1. **FAL API** (`https://api.fal.ai/v1`)
   - Files: `scripts/sync_model_catalog.ts`, `scripts/healthcheck_api_hub.ts`, `scripts/fal_pricing_estimate.ts`
   - Endpoints:
     - `GET /models` - List models with pagination
     - `POST /models/pricing/estimate` - Estimate pricing
     - Uses `FAL_API_KEY` environment variable

2. **Comet API** (`https://api.cometapi.com/v1`)
   - Files: `scripts/sync_model_catalog.ts`, `scripts/healthcheck_api_hub.ts`
   - Endpoints:
     - `GET /models` - List available LLM models
     - Uses `COMET_API_KEY` environment variable

3. **OpenAPI Spec Servers** (in `openapi/api-hub.oas.json`)
   - Defines servers pointing to external APIs:
     ```json
     "servers": [
       { "url": "https://api.cometapi.com/v1" },
       { "url": "https://api.fal.ai/v1" }
     ]
     ```

### API Client Usage Pattern
The repository uses a client wrapper pattern:
- `apis/client/index.ts` - Base ApiClient class
- Used in sync scripts to call FAL/Comet APIs
- Pattern: `new ApiClient({ baseUrl, apiKey })`

## LiteLLM Gateway Integration

### Existing LiteLLM Infrastructure
✅ **Already Present**:
- `gateway_client.py` - Python client for LiteLLM proxy
- `litellm_config.yaml` - Gateway configuration with model mappings
- `GATEWAY_README.md` - Setup and usage documentation
- `test_gateway.sh` - Shell test script
- `test_chat_completion.py` - Python integration test

### LiteLLM Configuration
- Target URL: `http://localhost:4000`
- Configured providers: OpenAI, Anthropic
- Environment variables: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `LITELLM_MASTER_KEY`

**Status**: LiteLLM is configured for local testing but not integrated into the TypeScript/Node.js codebase.

## Docker Infrastructure

### Current State: **NONE**
- ❌ No `docker-compose.yml` files
- ❌ No `Dockerfile` for any service
- ❌ No `mpc-api` backend application
- ❌ No `ai-infra` directory (created now)

### What Exists
- Configuration files for external tools (LiteLLM)
- Node.js/TypeScript scripts for API management
- Python scripts for LiteLLM testing

## Service Architecture (Current)

```
┌─────────────────────────────────────────────────────┐
│         Developer's Local Machine                   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  MPC_apidog Repository                       │   │
│  │                                               │   │
│  │  - npm scripts (sync, validate, generate)    │   │
│  │  - Apidog MCP tools                          │   │
│  │  - TypeScript/Node.js runtime                │   │
│  │                                               │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                     │
│                 │ Direct HTTPS calls                  │
│                 ▼                                     │
└─────────────────────────────────────────────────────┘
                  │
                  │
    ┌─────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌─────────────────┐     ┌──────────────────┐
│  FAL API        │     │  Comet API       │
│  (Cloud)        │     │  (Cloud)         │
└─────────────────┘     └──────────────────┘

Optional Local Testing:
┌─────────────────────────────────────┐
│  LiteLLM Gateway (localhost:4000)   │
│  - Not integrated into TS codebase  │
│  - Python client only               │
└─────────────────────────────────────┘
```

## Key Findings

### What This Repository Is
1. **API Management Tool** - Manages OpenAPI specs via Apidog MCP
2. **Model Catalog Service** - Syncs and aggregates model data from FAL/Comet
3. **TypeScript Client Generator** - Auto-generates API clients from OpenAPI specs
4. **Integration Scripts** - Node.js/TypeScript automation for API operations

### What This Repository Is NOT
1. **Not a Backend API Service** - No Express/Fastify/Koa server
2. **Not a Docker Application** - No containerization
3. **Not a Gateway** - No request proxying or routing (yet)

### Critical Gap for Migration
To achieve the goal of a "local Docker-based AI infrastructure," we need to:
1. **Create** an `mpc-api` backend service (currently doesn't exist)
2. **Build** Docker infrastructure for all services
3. **Integrate** LiteLLM gateway into the Node.js/TypeScript stack
4. **Refactor** sync scripts to work through LiteLLM instead of direct API calls

## Recommended Migration Path

1. **Create MPC-API Service** (New)
   - Build a Node.js/Express backend that currently doesn't exist
   - Proxy requests to LiteLLM Gateway
   - Provide endpoints that mirror the OpenAPI spec structure
   - Add health checks and monitoring

2. **Dockerize Everything**
   - Create docker-compose for: Dify, Langflow, Activepieces, LiteLLM, MPC-API
   - Use shared network for inter-service communication
   - Volume mounts for persistence

3. **Refactor Scripts** (Preserve)
   - Update sync scripts to call LiteLLM instead of direct APIs
   - Keep Apidog scripts but mark as legacy/documentation-only
   - Maintain model registry functionality

4. **Documentation & Tooling**
   - Windows PowerShell management scripts
   - Deployment checklists
   - Architecture diagrams

---

**Generated**: 2025-11-18  
**Repository**: BananaStudio-AI/MPC_apidog  
**Branch**: copilot/update-docker-infrastructure-setup
