# Apidog Workflows

Complete guide to working with Apidog MCP and OpenAPI specs.

## Architecture

```
┌─────────────────┐
│  Apidog Cloud   │ ← Project 1128155 (BananaStudio API Hub)
└────────┬────────┘
         │ MCP (read-only OAS tools)
         ↓
┌─────────────────┐
│  Local Scripts  │ ← apidog/scripts/*.js
└────────┬────────┘
         │
         ├→ Pull: Fetch OAS → Extract endpoints → Save to apidog/api_specs/
         ├→ Push: Merge local changes → Generate oas_merged.json
         └→ Import: Upload to Apidog via UI or REST API
```

## Pull Workflow

**Command**: `npm run apidog:pull`  
**Script**: `apidog/scripts/pull_endpoints_oas.js`

**Safety**: The script checks for uncommitted changes before proceeding. Use `--allow-uncommitted` to bypass.

**Steps:**
1. Connects to Apidog MCP server
2. Discovers `read_project_oas_*` tool
3. Fetches full OpenAPI spec
4. Saves raw OAS to `apidog/generated/oas_raw.json`
5. Extracts individual endpoints to `apidog/api_specs/*.json`

**Output Files:**
- `apidog/generated/oas_raw.json` - Complete OAS from Apidog
- `apidog/api_specs/GET__.json` - Root endpoint (/)
- `apidog/api_specs/GET__models.json` - Models endpoint

**Copy to Tracked Location:**
```bash
cp apidog/generated/oas_raw.json openapi/oas_raw.json
```

## Push Workflow (OAS Merge)

**Command**: `npm run apidog:push:oas -- --force`  
**Script**: `apidog/scripts/push_endpoints_oas.js`

**Safety**: The script checks for uncommitted changes before proceeding. Use `--allow-uncommitted` to bypass.

**Steps:**
1. Reads local endpoint specs from `apidog/api_specs/`
2. Fetches remote OAS via MCP
3. Merges local changes into remote OAS
4. Saves merged spec to `apidog/generated/oas_merged.json`

**Output:**
- `apidog/generated/oas_merged.json` - Ready to import

**Copy to Tracked Location:**
```bash
cp apidog/generated/oas_merged.json openapi/oas_merged.json
```

## Push Workflow (Direct API)

**Command**: `npm run apidog:push:api`  
**Script**: `apidog/scripts/push_oas_api.js`

Attempts to push `oas_merged.json` directly via Apidog REST API. May require:
- Write-enabled token
- Correct import endpoint (API documentation needed)

**Fallback**: Manual import via Apidog Web UI.

## Available Scripts

```bash
# Discovery
npm run apidog:list-tools       # List MCP tools
npm run apidog:auth-check       # Verify token

# Pull/Push
npm run apidog:pull             # Fetch OAS & extract endpoints
npm run apidog:push:oas         # Dry-run merge
npm run apidog:push:oas -- --force  # Generate merged OAS
npm run apidog:push:api         # Attempt REST API import

# Validation
npm run apidog:validate         # Validate endpoint specs

# Agents (OpenAI-based alternative)
npm run apidog:pull:agents      # Pull via OpenAI Agents
npm run apidog:push:agents      # Push via OpenAI Agents
```

## MCP Tools Available

For project 1128155, the Apidog MCP server exposes:
- `read_project_oas_*` - Read full OpenAPI spec
- `read_project_oas_ref_resources_*` - Read $ref files
- `refresh_project_oas_*` - Re-download OAS

**Note**: No direct endpoint create/update tools available.

## File Locations

### Legacy/Working Directory
- `apidog/generated/` - Generated files (not tracked)
- `apidog/api_specs/` - Extracted endpoint specs (working directory)
- `apidog/scripts/` - Automation scripts

### Tracked Artifacts
- `openapi/` - Versioned OpenAPI specs
- `apis/` - Generated API clients (future)
- `docs/` - Documentation

## Best Practices

1. **Always pull before push**: Ensure you have latest remote state
2. **Review diffs**: Run without `--force` first to see changes
3. **Copy to tracked location**: Move generated OAS to `openapi/` for versioning
4. **Commit both**: Commit endpoint specs + generated OAS together
5. **Test imports**: Validate merged OAS before importing to Apidog

## Troubleshooting

See [MCP_CONFIGURATION.md](./MCP_CONFIGURATION.md) for:
- Token format issues
- MCP server connectivity
- Tool discovery problems
