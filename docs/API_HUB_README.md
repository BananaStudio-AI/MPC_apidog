# Using the API HUB from BananaStudio

- **Unified Project:**
  - Both `COMET_API` and `FAL_API` are managed in a single Apidog project and unified OpenAPI spec: `openapi/api-hub.oas.json`.

- **Refreshing the OpenAPI Spec:**
  - Use the provided scripts to pull the latest endpoints from Apidog MCP:
    ```bash
    npm run apidog:pull && npm run oas:sync && node scripts/normalize_api_hub_oas.mjs
    ```
  - This will update `openapi/api-hub.raw.oas.json` and the normalized `openapi/api-hub.oas.json`.

- **Regenerating the TypeScript Client:**
  - To generate/update the production-ready client from the unified OAS:
    ```bash
    npm run generate:api-hub-client
    ```
  - Output is written to `apis/api-hub-client/`.

- **Syncing the Model Registry:**
  - To fetch and merge all models from both providers into a unified registry:
    ```bash
    npm run sync:model-registry
    ```
  - This will create/update `data/model_registry.json`.

- **About `data/model_registry.json`:**
  - This file contains an array of all models from both Comet and FAL, each as a `UnifiedModelRecord`.
  - Fields include: `source` ("comet" or "fal"), `id`, `provider`, `category`, and the full raw model object.
  - **Downstream uses:**
    - As a catalog for agent selection and orchestration.
    - For vectorisation and search workflows.
    - For pricing, analytics, and reporting logic.
    - As a canonical source for model metadata in BananaStudio and other agents.
# API Hub (BananaStudio)

This is the unified API Hub combining Comet and FAL model endpoints.

## Refresh OAS from Apidog

1. Ensure `.env` contains `APIDOG_ACCESS_TOKEN` and `APIDOG_PROJECT_ID`.
2. Run `npm run apidog:pull` to download the remote OAS into `apidog/generated/oas_raw.json`.
3. Run `npm run oas:sync` to copy the OAS files to `openapi/`.

## Generate the API Hub client

The canonical OpenAPI file for API Hub is `openapi/api-hub.oas.json`.

To generate a TypeScript client use:

```bash
npm run generate:api-hub-client
```

This will create `./apis/api-hub-client/index.ts` which contains `ApiClient` with typed methods.

## Example: sync model catalog

A small example that uses the generated client to fetch models from both providers is available:

```bash
# Requires FAL_API_KEY and COMET_API_KEY in .env
npm run sync:api-hub-client
```

The example saves results to `openapi/model_catalog.json` as a simple record list:

```json
{
  "generated_at": "2025-11-16T12:00:00Z",
  "total_models": 42,
  "sources": { "comet": 20, "fal": 22 },
  "models": [
    { "source": "comet", "id": "gpt-4-x" /* ... */ }
  ]
}
```

`UnifiedModelRecord` is the canonical format used by BananaStudio agents; it includes:
- `source`: "comet" | "fal"
- `id`: unique model id string
- `provider`: string or null
- `category`: string or null
- `raw`: the unmodified raw metadata from provider

## Notes

- The Apidog MCP tools are read-only today: `read_project_oas_*` etc.  To push an OAS to Apidog you must import `openapi/api-hub.oas.json` manually in the Apidog UI or use Apidog write APIs with a write token. The repo has `apidog/scripts/push_endpoints_oas.js` and `apidog/scripts/push_endpoints.js` to assist manual workflow.
- The example script gracefully falls back to local sample data from `apidog/api_specs/*` if the provider API is not reachable during development.
