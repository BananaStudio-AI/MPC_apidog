# OpenAPI Specifications

This directory contains OpenAPI (OAS) files generated from the Apidog project.

## Files

- `oas_raw.json` - Latest OpenAPI spec fetched from Apidog (pulled via MCP)
- `oas_merged.json` - Merged OpenAPI spec combining remote + local endpoint changes

## Usage

### Pull Latest OAS
```bash
npm run apidog:pull
```
Fetches the latest OpenAPI spec from Apidog and saves to `oas_raw.json`.

### Generate Merged OAS
```bash
npm run apidog:push:oas -- --force
```
Merges local endpoint changes into the remote OAS and saves to `oas_merged.json`.

## Import to Apidog

1. **Via Web UI**: Project Settings → Import → OpenAPI → Upload `oas_merged.json`
2. **Via REST API**: `npm run apidog:push:api` (requires write-enabled token)

## Version Control

These files are tracked in git to maintain a history of API changes.
