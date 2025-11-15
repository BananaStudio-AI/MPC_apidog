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
# or with npm script
npm run apidog:pull
```

- The script discovers the correct MCP tool automatically. If needed, set:
  - `APIDOG_LIST_TOOL` to the exact tool name for listing endpoints.
  - If your server exposes only OAS readers (e.g. `read_project_oas_*`), the script will extract endpoints from OpenAPI.

### List Available MCP Tools
```bash
npm run apidog:list-tools
```
This prints the tool names and helps you set `APIDOG_LIST_TOOL`/`APIDOG_UPDATE_TOOL`.

## Alternative: Pull via OpenAI Agents (Hosted MCP)
Use OpenAI Agents with a hosted MCP connector for Apidog. Requires an
OpenAI API key and a configured connector (serverLabel "BananaStudio API Hub",
connectorId "connector_apidog").

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="sk-..."

# Run the agents-based pull
npm run apidog:pull:agents
```

Files will be saved into `apidog/api_specs/`. This path is useful when your
VS Code environment has access to OpenAI Agents and your MCP connector but
you don't want to spawn the Apidog MCP server locally.

## Push Endpoints (sync up)
Compare local JSON files to the live Apidog project and push changes:

```bash
# dry-run: shows changes only
APIDOG_ACCESS_TOKEN="<your_token_here>" node apidog/scripts/push_endpoints.js

# apply changes
APIDOG_ACCESS_TOKEN="<your_token_here>" node apidog/scripts/push_endpoints.js --force
# or via npm
npm run apidog:push -- --force
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
- If you see a 403 error during pull, your `APIDOG_ACCESS_TOKEN` likely lacks access to the project. Update `.env` and re-run. The raw tool response is saved to `apidog/generated/oas_raw.json` for debugging.
