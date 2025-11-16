# Production Checklist: BananaStudio API HUB

## Environment
- `.env` contains:
  - `APIDOG_ACCESS_TOKEN`
  - `APIDOG_PROJECT_ID`
  - `COMET_API_KEY`
  - `FAL_API_KEY`

## Build
- Install dependencies:
  ```bash
  npm install
  ```
- Generate the TypeScript client:
  ```bash
  npm run generate:api-hub-client
  ```

## Runtime
- Sync the unified model registry:
  ```bash
  npm run sync:model-registry
  ```

## Validation
- Confirm that `data/model_registry.json` exists and:
  - Contains entries from both `"comet"` and `"fal"` sources.
  - No obvious errors in logs during sync.

---

## What to change when new endpoints are added in Apidog
- Run the pull/sync scripts to refresh the OpenAPI spec:
  ```bash
  npm run apidog:pull && npm run oas:sync && node scripts/normalize_api_hub_oas.mjs
  ```
- Manually update `openapi/api-hub.oas.json` if needed (e.g. for new schemas or wiring).
- Regenerate the client:
  ```bash
  npm run generate:api-hub-client
  ```
- Update the registry mapping only if new fields are required for downstream use.
