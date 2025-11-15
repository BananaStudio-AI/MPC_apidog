# BananaStudio API Hub Copilot Instructions

## Project Overview
BananaStudio API Hub is an AI-driven creative pipeline integrating Comet Models, FAL API, OpenAI Agents, and automation workflows. The architecture is **MCP-first** — all API interactions go through the Apidog Model Context Protocol server.

## Architecture

### MCP Server Integration (Critical)
- **ALWAYS use MCP tools** instead of direct HTTP calls for APIs
- MCP server provides auto-documented endpoints for:
  - `CometModels_API` - Model registry and metadata
  - `FAL_API` - Creative generation platform
  - `BananaStudio_Internal` - Internal services
  - `Utilities` - Helper functions
- Run via: `npx -y apidog-mcp-server@latest --project-id=<PROJECT_ID>`
- Requires `APIDOG_ACCESS_TOKEN` environment variable
- **Never hallucinate API parameters** — query MCP definitions first

### Repository Structure
```
agents/     # Agent definitions and workflows
apis/       # API integration scripts
scripts/    # Automation utilities (TS/Node/Python)
mcp/        # MCP server configuration
docs/       # Documentation and playbooks
```

## Development Patterns

### Language & Runtime
- **ES Modules** (`"type": "module"` in package.json)
- Primary: TypeScript/Node.js for automation
- Secondary: Python for data processing/ML tasks
- No build step required for scripts — use `.mjs` or set module type

### API Integration Workflow
1. Query MCP server for API schema (don't guess endpoints)
2. Use MCP tools for all external API calls
3. Store model metadata in unified registry
4. Integrate Comet + FAL through standardized interfaces

### Agent Development
- Custom agents defined in `.github/agents/*.agent.md` (YAML frontmatter)
- Agents must declare `mcpServers` section with Apidog connection
- See `.github/agents/my-agent.agent.md` for template structure
- Agents orchestrate: code generation, file updates, workflow automation

## Key Workflows

### Running MCP Server
```bash
npx -y apidog-mcp-server@latest --project-id=<YOUR_PROJECT_ID>
```
Required env: `APIDOG_ACCESS_TOKEN`

### Writing Automation Scripts
- Prefer production-ready, well-formatted code
- Use structured patches or complete rewrites for file edits
- Scripts should handle model registry syncing and vector store ingestion

## Critical Conventions

1. **MCP-First**: Query Apidog MCP server before any API work
2. **No URL Hardcoding**: API definitions come from MCP, not manual URLs
3. **Structured Edits**: Propose clear patches, not ad-hoc changes
4. **Repository Awareness**: Follow folder structure automatically
5. **Confirmation on Refactors**: Ask before large-scale structural changes

## Integration Points

- **Comet Models**: Model registry, pricing, analytics via MCP
- **FAL Platform**: Creative generation APIs via MCP
- **Pinecone/Vector Stores**: Document ingestion workflows
- **OpenAI/Vertex Agents**: Agent-tool bindings for AI orchestration

## External Dependencies
- Apidog MCP server (installed via npx, not in package.json)
- Environment variables for API tokens (`.env` files gitignored)
- Future: Pinecone, OpenAI SDK, Comet/FAL SDKs (not yet added)
