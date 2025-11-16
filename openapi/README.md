# OpenAPI Specifications

Canonical OpenAPI 3.0.3 specifications for BananaStudio API Hub.

## Files

- **`api-hub.oas.json`** - Canonical v2.0.0 specification (production-ready)
- **`model_catalog.json`** - Unified model catalog (1,434 models from Comet + FAL)
- `oas_raw.json` - Latest OAS fetched from Apidog (via MCP)
- `oas_merged.json` - Merged OAS for Apidog import

## Key Features

- **Strict Provider Separation**: `/comet/*` and `/fal/*` path namespaces
- **Apidog Extensions**: Full `x-apidog-*` support for UI rendering
- **Complete Schemas**: 13 schemas covering models, pricing, usage, analytics
- **6 Endpoints**: 1 Comet + 5 FAL fully documented with examples

## Usage

### Pull Latest from Apidog
```bash
npm run apidog:pull
```

### Push to Apidog
```bash
npm run push:apidog
```
Uploads `api-hub.oas.json` to Apidog project 1128155.

### Generate TypeScript Client
```bash
npm run generate:api-hub-client
```
Generates client from `api-hub.oas.json` into `../apis/api-hub-client/`.

### Sync Model Catalog
```bash
npm run sync:model-catalog
```
Fetches models from Comet and FAL APIs, saves to `model_catalog.json`.

## Documentation

See [`../docs/API_HUB_V2_RESTRUCTURE.md`](../docs/API_HUB_V2_RESTRUCTURE.md) for complete architecture and migration guide.
