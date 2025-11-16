# OpenAPI Specifications

This directory contains OpenAPI (OAS) files generated from the Apidog project.

## Files

- `oas_raw.json` - Latest OpenAPI spec fetched from Apidog (pulled via MCP)
- `oas_merged.json` - Merged OpenAPI spec combining remote + local endpoint changes
- `api-hub.raw.oas.json` - Raw OpenAPI spec for API HUB project (copy of merged spec)
- `api-hub.oas.json` - **Normalized OpenAPI spec** with proper tags, servers, and paths
- `model_catalog.json` - Model catalog metadata
- `NORMALIZATION_SUMMARY.md` - Detailed documentation of normalization process

## Normalized Spec

The **`api-hub.oas.json`** file is the production-ready OpenAPI specification with:

### Servers
- **Comet API**: `https://api.cometapi.com/v1`
- **FAL Platform API**: `https://api.fal.ai/v1`

### Tags
- **COMET_API**: Comet Models API (model registry, metadata, pricing)
- **FAL_API**: FAL Platform API (creative generation, model services)

### Endpoints

#### COMET_API
- `GET /models` - List available models

#### FAL_API
- `GET /models/search` - Search models
- `GET /models/pricing` - Get pricing information
- `POST /models/pricing/estimate` - Estimate pricing
- `GET /models/usage` - Get usage statistics
- `GET /models/analytics` - Get analytics data

## Usage

### Pull Latest OAS
```bash
npm run apidog:pull
```
Fetches the latest OpenAPI spec from Apidog and saves to `oas_raw.json`.

### Normalize OpenAPI Spec
```bash
npm run oas:normalize
```
Reads `api-hub.raw.oas.json` and generates the normalized `api-hub.oas.json` with:
- Proper server definitions
- Correct tags (COMET_API, FAL_API)
- Clean paths without vendor prefixes
- Operation-level server assignments

### Generate Merged OAS
```bash
npm run apidog:push:oas -- --force
```
Merges local endpoint changes into the remote OAS and saves to `oas_merged.json`.

### Generate TypeScript Client
```bash
npm run generate:client
```
Generates a TypeScript client from `api-hub.oas.json`.

## Import to Apidog

1. **Via Web UI**: Project Settings → Import → OpenAPI → Upload `api-hub.oas.json`
2. **Via REST API**: `npm run apidog:push:api` (requires write-enabled token)

## Version Control

These files are tracked in git to maintain a history of API changes.

## Documentation

See `NORMALIZATION_SUMMARY.md` for detailed information about:
- Raw spec analysis
- Normalization rules applied
- Path transformations
- Server and tag assignments
- Usage examples
