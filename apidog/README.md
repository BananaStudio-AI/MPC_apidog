# Apidog Automation for BananaStudio

This folder contains MCP-based automation to manage your Apidog project (ID: 1128155) directly from VS Code or the terminal.

## Prerequisites
- Node.js 18+
- An Apidog access token
- Install the MCP SDK (for scripts):

```bash
npm i -S @modelcontextprotocol/sdk
```

## Configure Credentials
Create or edit the repo root `.env`:

```bash
APIDOG_ACCESS_TOKEN="<your_token_here>"
APIDOG_PROJECT_ID=1128155
```

> Never commit real tokens. `.env` is already in `.gitignore`.

## MCP Server Config
An MCP config is provided at `./mcp/apidog.json` for the server named "BananaStudio API Hub".

- On Windows, VS Code agents can use this as-is (it uses `cmd /c npx ...`).
- On Linux/macOS, you can run the server manually with `npx` (see below).

### Run MCP Server Manually
```bash
# Load your token
export APIDOG_ACCESS_TOKEN="<your_token_here>"
# Start the server for project 1128155
npx -y apidog-mcp-server@latest --project-id=1128155
```

Alternatively from the repo root, you can also use the helper we created earlier:

```bash
./setup-mcp.sh
```

## Pull Endpoints (sync down)
Export all endpoints from Apidog into `./api_specs` as JSON files:

```bash
# from repo root
APIDOG_ACCESS_TOKEN="<your_token_here>" node apidog/scripts/pull_endpoints.js
```

- The script discovers the correct MCP tool automatically. If needed, set:
  - `APIDOG_LIST_TOOL` to the exact tool name for listing endpoints.

## Push Endpoints (sync up)
Compare local JSON files to the live Apidog project and push changes:

```bash
# dry-run: shows changes only
APIDOG_ACCESS_TOKEN="<your_token_here>" node apidog/scripts/push_endpoints.js

# apply changes
APIDOG_ACCESS_TOKEN="<your_token_here>" node apidog/scripts/push_endpoints.js --force
```

- Set tool overrides if required:
  - `APIDOG_UPDATE_TOOL` for the endpoint update tool name.

## Type Definitions
TypeScript declaration file at `./types/apidog.d.ts` defines:
- Endpoint, Schema, Module, QueryParam, Header, AuthConfig, Folder

Use an editor with TypeScript support to get intellisense in `.js` scripts via JSDoc types.

## Notes
- Scripts are ESM (`type: module`) and expect Node 18+.
- These scripts use the MCP SDK and spawn the Apidog MCP server under the hood.
- The exact tool names depend on your Apidog project configuration; override via env vars if discovery fails.
