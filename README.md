# Apidog MCP Integration for BananaStudio

BananaStudio — AI-driven creative pipeline integrating Comet Models, FAL API, OpenAI Agents, and automation workflows. This repository provides **MCP-first** integration with Apidog for automated API endpoint management.

## Quick Start

### Requirements

- **Node.js 18+**
- **Apidog account** with API access token
- **Project ID** from your Apidog project

### Setup

1. **Configure credentials**
   ```bash
   cp .env.example .env
   # Edit .env with your APIDOG_ACCESS_TOKEN and APIDOG_PROJECT_ID
   ```

2. **Start the MCP server**
   ```bash
   ./setup-mcp.sh
   ```

## Core Features

### 🚀 MCP Server Integration

Run the Apidog MCP server to access all API tools:

```bash
# Using the setup script (recommended)
./setup-mcp.sh

# Or manually with environment variables
npx -y apidog-mcp-server@latest --project-id="$APIDOG_PROJECT_ID"
```

The MCP server provides auto-documented endpoints for:
- **Comet Models API** - Model registry and metadata
- **FAL API** - Creative generation platform  
- **BananaStudio Internal** - Internal services
- **Utilities** - Helper functions

### ➕ Add API Endpoint via Terminal

Create new API endpoints interactively from the terminal:

```bash
node scripts/add_endpoint.js
```

**Interactive prompts:**
- Endpoint name, HTTP method, and path
- Optional description and collection
- Add parameters with types and validation
- Review and confirm before saving

**What it does:**
- Guides you through endpoint creation
- Validates input and structure
- Saves to local JSON file
- Ready to sync with `push_endpoints.js`

### 📥 Pull Endpoints from Apidog

Fetch all API endpoints and save them locally:

```bash
# Default output: ./apis/endpoints.json
node scripts/pull_endpoints.js

# Custom output path
node scripts/pull_endpoints.js --output ./custom-path.json
```

**What it does:**
- Connects to Apidog via MCP server
- Fetches all collections and endpoints
- Saves structured JSON for version control
- Enables offline reference and backups

### 📤 Push Endpoints to Apidog

Update API endpoints in Apidog from local definitions:

```bash
# Default input: ./apis/endpoints.json
node scripts/push_endpoints.js

# Custom input path
node scripts/push_endpoints.js --input ./custom-path.json

# Force overwrite without confirmation
node scripts/push_endpoints.js --force
```

**What it does:**
- Reads endpoint definitions from JSON
- Prompts for confirmation (unless --force)
- Updates endpoints via MCP server
- Reports success/failure

## Repository Structure

```
MPC_apidog/
├── apis/                      # API integration layer
│   ├── types.ts              # TypeScript interface definitions
│   └── endpoints.json        # Local API endpoint cache (generated)
├── scripts/                   # Automation utilities
│   ├── add_endpoint.js       # Add new API endpoint interactively
│   ├── pull_endpoints.js     # Fetch endpoints from Apidog
│   └── push_endpoints.js     # Update endpoints in Apidog
├── mcp/                       # MCP server configuration
├── docs/                      # Detailed documentation
│   └── README.md             # Complete documentation
├── .github/                   # GitHub configuration
│   ├── agents/               # Custom agent definitions
│   └── copilot-instructions.md
├── .env.example              # Environment variable template
├── apidog.json               # MCP configuration (Apidog-specific)
├── mcp.json                  # MCP configuration (BananaStudio Hub)
├── setup-mcp.sh              # Quick start script
└── README.md                 # This file
```

## Configuration

### Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Required variables:
```bash
APIDOG_ACCESS_TOKEN=your-actual-token-here
APIDOG_PROJECT_ID=your-actual-project-id-here
```

### MCP Server Config

Two configuration files are provided:

- **`apidog.json`** - Simplified Apidog-specific configuration
- **`mcp.json`** - Full BananaStudio API Hub configuration

Both support environment variable substitution and work with the setup script.

## TypeScript Types

Type-safe API interactions using TypeScript interfaces in `apis/types.ts`:

```typescript
import { ApiEndpoint, ApiParameter, ApidogProject } from './apis/types.ts';

// Example: Define an endpoint
const endpoint: ApiEndpoint = {
  id: 'user-login',
  name: 'User Login',
  method: 'POST',
  path: '/api/v1/auth/login',
  parameters: [...]
};
```

## Workflows

### Initial Setup
1. Configure credentials → 2. Pull endpoints → 3. Commit to version control

### Adding New Endpoints
1. Run `node scripts/add_endpoint.js` → 2. Fill in details interactively → 3. Push to Apidog → 4. Verify in UI

### Development Cycle  
1. Make changes in Apidog → 2. Pull locally → 3. Review & commit

### Deployment
1. Update local definitions → 2. Push to Apidog → 3. Verify in UI

## Documentation

For detailed documentation, see [docs/README.md](docs/README.md), which includes:

- Complete architecture overview
- Detailed usage instructions  
- TypeScript interface documentation
- Troubleshooting guide
- Advanced topics and best practices
- CI/CD integration examples

## Key Principles

1. **MCP-First** - All API interactions go through the MCP server
2. **No URL Hardcoding** - API definitions come from MCP, not manual URLs
3. **Version Control** - Track API changes alongside code changes
4. **Type Safety** - Use TypeScript interfaces for all operations
5. **Automation Ready** - Scripts designed for CI/CD integration

## Support

- **Full documentation**: [docs/README.md](docs/README.md)
- **Issues**: Open a GitHub issue
- **Apidog docs**: https://apidog.com/docs
- **MCP Protocol**: https://modelcontextprotocol.io

## License

See LICENSE file for details.