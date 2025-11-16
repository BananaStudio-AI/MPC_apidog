# BananaStudio API Hub

> AI-driven creative pipeline integrating Comet Models, FAL API, OpenAI Agents, and automation workflows through the Apidog Model Context Protocol (MCP) server.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API tokens

# 3. Verify Apidog authentication
npm run apidog:auth-check

# 4. Pull latest API specifications
npm run apidog:pull

# 5. Sync model registry
npm run sync:model-registry
```

## 📋 Prerequisites

- **Node.js** 18+ (ES Modules support)
- **npm** 8+
- **API Keys:**
  - Apidog Access Token (from Account Settings → API Access Token)
  - FAL API Key
  - Comet API Key
  - OpenAI API Key (optional, for agent workflows)

## 🏗️ Architecture

This repository follows an **MCP-first architecture** where all API interactions go through the Apidog Model Context Protocol server for auto-documented, type-safe API access.

```
┌──────────────────┐
│  Apidog Cloud    │ ← API definitions & OpenAPI specs
└────────┬─────────┘
         │ MCP Protocol
         ↓
┌──────────────────┐
│   MCP Server     │ ← Auto-generated tools from OpenAPI
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Local Scripts   │ ← Automation & model registry
└──────────────────┘
```

### Directory Structure

```
MPC_apidog/
├── apidog/              # Apidog MCP integration
│   ├── api_specs/       # Extracted endpoint specifications
│   ├── scripts/         # Pull/push automation scripts
│   └── types/           # TypeScript definitions
├── apis/                # Generated API clients
│   ├── api-hub-client/  # Main API Hub client
│   └── model_registry/  # Unified model registry
├── scripts/             # Project automation scripts
├── docs/                # Comprehensive documentation
├── openapi/             # Versioned OpenAPI specifications
├── examples/            # Usage examples
└── data/                # Generated data (model registry, etc.)
```

## 🔧 Available Scripts

### Apidog MCP Operations

```bash
npm run apidog:auth-check      # Verify API token
npm run apidog:list-tools      # List available MCP tools
npm run apidog:pull            # Pull OpenAPI specs from Apidog
npm run apidog:push:oas        # Generate merged OpenAPI spec
npm run apidog:push:api        # Push specs to Apidog via REST API
npm run apidog:validate        # Validate endpoint specifications
```

### Model Registry & API Hub

```bash
npm run sync:model-registry    # Sync unified model registry (Comet + FAL)
npm run health:api-hub         # Run health checks for API integrations
npm run generate:api-hub-client # Generate TypeScript client from OpenAPI
npm run fal:estimate           # Test FAL pricing estimation API
```

### OpenAPI Management

```bash
npm run oas:sync               # Copy generated OAS to tracked location
npm run apidog:import:api-hub  # Import API Hub OpenAPI spec
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Repository structure and design
- **[APIDOG_WORKFLOWS.md](./docs/APIDOG_WORKFLOWS.md)** - Pull/push workflows
- **[MCP_CONFIGURATION.md](./docs/MCP_CONFIGURATION.md)** - MCP server setup
- **[PRODUCTION_CHECKLIST.md](./docs/PRODUCTION_CHECKLIST.md)** - Deployment guide

## 🤖 Custom Agents

This repository includes custom GitHub Copilot agents defined in `.github/agents/`:

- **my-agent.agent.md** - BananaStudio Dev Agent for orchestrating tasks

Agents have direct access to the Apidog MCP server for API operations.

## 🔐 Environment Variables

See [`.env.example`](./.env.example) for required configuration:

```bash
# Apidog Configuration
APIDOG_ACCESS_TOKEN=""           # From Account Settings
APIDOG_PROJECT_ID="1128155"      # BananaStudio API Hub project

# Model APIs
FAL_API_KEY=""                   # FAL AI platform
COMET_API_KEY=""                 # Comet Models API

# Optional
OPENAI_API_KEY=""                # For agent workflows
CURSOR_API_KEY=""                # For Cursor IDE integration
```

## 🧪 Model Registry

The unified model registry combines models from multiple sources:

```typescript
import { fetchAllModels } from './apis/model_registry';

const models = await fetchAllModels();
// Returns: UnifiedModelRecord[] with source, id, provider, category
```

Data is synced to `data/model_registry.json` via `npm run sync:model-registry`.

## 🛠️ Development

### TypeScript Support

The project uses TypeScript with `tsx` for running scripts:

```bash
tsx scripts/your-script.ts
```

### Adding New Endpoints

1. Edit specifications in `apidog/api_specs/`
2. Generate merged OpenAPI: `npm run apidog:push:oas -- --force`
3. Import to Apidog via UI or REST API
4. Regenerate clients: `npm run generate:api-hub-client`

### Code Quality

```bash
# Run linting (when ESLint is configured)
npm run lint

# Format code (when Prettier is configured)
npm run format
```

## 📄 License

This project is part of the BananaStudio AI ecosystem.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## 📞 Support

For issues or questions:
- Check documentation in `docs/`
- Review Apidog workflow guides
- Verify environment configuration