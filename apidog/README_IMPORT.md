Apidog: Importing OpenAPI
=========================

This repository keeps a copy of the OpenAPI used by the Apidog project in `apidog/generated/`.

How to import the local OAS into Apidog (web UI):

1. Open your Apidog dashboard and go to the project (Default module).
2. Navigate to API > Import and choose `OpenAPI`.
3. Upload `apidog/generated/oas_merged.json` (the script `npm run apidog:push:oas -- --force` writes this file locally).
4. Confirm import. Apidog will create groups/collections based on `tags` in the spec.

Notes
- `apidog/api_specs/` contains per-endpoint JSON metadata (used to patch and regenerate OAS).
- Tags in `apidog/api_specs/*` become collections/folders in the Apidog UI.
- `apidog/generated/oas_raw.json` is the remote fetch from Apidog — do not edit directly.

If you want the push import to be automated, you must use Apidog's write API with a write token (not available via MCP read-only tools).
