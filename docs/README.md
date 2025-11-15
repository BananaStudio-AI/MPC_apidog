# Apidog MCP Integration Documentation

## Overview

This repository provides a complete integration between BananaStudio and Apidog via the Model Context Protocol (MCP). It enables automated management of API endpoints, seamless synchronization between local development and Apidog cloud, and MCP-first API interactions.

## Architecture

### MCP-First Design

All API interactions in this project go through the Apidog MCP server, which provides:

- **Auto-documented endpoints** - Query the MCP server for up-to-date API schemas
- **Type-safe interactions** - Use TypeScript interfaces for all API operations
- **Centralized authentication** - Environment-based credential management
- **Version control** - Track API changes in Git alongside code changes

### Components

```
MPC_apidog/
├── apis/               # API integration layer
│   ├── types.ts       # TypeScript interface definitions
│   └── endpoints.json # Local cache of API endpoints (generated)
├── scripts/           # Automation utilities
│   ├── pull_endpoints.js  # Fetch endpoints from Apidog
│   └── push_endpoints.js  # Update endpoints in Apidog
├── mcp/               # MCP server configuration
├── docs/              # Project documentation
├── .env.example       # Environment variable template
├── apidog.json        # MCP server configuration
└── mcp.json           # Alternative MCP configuration
```

## Getting Started

### Prerequisites

- **Node.js 18+** - Required for running scripts and MCP server
- **Apidog Account** - Get your project ID and access token from Apidog dashboard
- **Environment Variables** - Configure credentials in `.env` file

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MPC_apidog
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Install the MCP server** (automatic via npx)
   ```bash
   # The server will be installed on first use
   npx -y apidog-mcp-server@latest --version
   ```

## Usage

### Starting the MCP Server

The MCP server provides the core functionality for interacting with Apidog APIs.

**Option 1: Using the setup script** (recommended)
```bash
./setup-mcp.sh
```

**Option 2: Direct invocation**
```bash
# Load environment variables first
source .env

# Start the server
npx -y apidog-mcp-server@latest --project-id="$APIDOG_PROJECT_ID"
```

The server will:
- Validate your credentials
- Connect to your Apidog project
- Expose MCP tools for API operations
- Provide real-time API schema information

### Pulling Endpoints from Apidog

Fetch all API endpoints from your Apidog project and save them locally:

```bash
# Use default output path (./apis/endpoints.json)
node scripts/pull_endpoints.js

# Specify custom output path
node scripts/pull_endpoints.js --output ./my-endpoints.json
```

**What happens:**
1. Script connects to Apidog via MCP server
2. Fetches all collections and endpoints
3. Saves structured JSON to local file
4. Enables version control and offline reference

**Use cases:**
- Initial project setup
- Syncing after changes made in Apidog UI
- Creating backups of API definitions
- Enabling offline development

### Pushing Endpoints to Apidog

Update API endpoints in Apidog from your local definitions:

```bash
# Use default input path (./apis/endpoints.json)
node scripts/push_endpoints.js

# Specify custom input path
node scripts/push_endpoints.js --input ./my-endpoints.json

# Force overwrite without confirmation
node scripts/push_endpoints.js --force
```

**What happens:**
1. Script reads endpoint definitions from JSON file
2. Prompts for confirmation (unless `--force` is used)
3. Updates endpoints in Apidog via MCP server
4. Reports success/failure for each operation

**Use cases:**
- Deploying API changes from version control
- Batch updating multiple endpoints
- Automating API deployment in CI/CD
- Synchronizing across team members

## TypeScript Interfaces

The `apis/types.ts` file provides TypeScript definitions for working with Apidog APIs:

```typescript
import { ApiEndpoint, ApiParameter, PullConfig } from './apis/types.ts';

// Example: Type-safe endpoint definition
const myEndpoint: ApiEndpoint = {
  id: 'user-login',
  name: 'User Login',
  method: 'POST',
  path: '/api/v1/auth/login',
  parameters: [
    {
      name: 'email',
      type: 'string',
      required: true
    }
  ]
};
```

**Available interfaces:**
- `ApiParameter` - Request/response parameter definition
- `ApiEndpoint` - Complete endpoint specification
- `ApiCollection` - Group of related endpoints
- `ApidogProject` - Full project structure
- `PullConfig` - Configuration for pulling endpoints
- `PushConfig` - Configuration for pushing endpoints

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Required: Your Apidog API access token
APIDOG_ACCESS_TOKEN=your-actual-token-here

# Required: Your Apidog project ID
APIDOG_PROJECT_ID=your-actual-project-id-here
```

**Getting your credentials:**
1. Log in to [Apidog](https://apidog.com)
2. Navigate to your project settings
3. Generate or copy your API access token
4. Copy your project ID from the project URL or settings

### MCP Server Configuration

Two configuration files are provided:

**`apidog.json`** - Simplified Apidog-specific configuration
```json
{
  "mcpServers": {
    "Apidog": {
      "command": "npx",
      "args": ["-y", "apidog-mcp-server@latest", "--project-id=${APIDOG_PROJECT_ID}"],
      "env": {
        "APIDOG_ACCESS_TOKEN": "${APIDOG_ACCESS_TOKEN}"
      }
    }
  }
}
```

**`mcp.json`** - Full BananaStudio API Hub configuration
```json
{
  "mcpServers": {
    "BananaStudio API Hub": {
      "command": "npx",
      "args": ["-y", "apidog-mcp-server@latest", "--project-id=${APIDOG_PROJECT_ID}"],
      "env": {
        "APIDOG_ACCESS_TOKEN": "${APIDOG_ACCESS_TOKEN}"
      }
    }
  }
}
```

Choose the configuration that fits your needs. Both support environment variable substitution.

## Workflows

### Initial Setup Workflow

1. **Configure credentials**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Pull existing endpoints**
   ```bash
   node scripts/pull_endpoints.js
   ```

3. **Review and commit**
   ```bash
   git add apis/endpoints.json
   git commit -m "Initial endpoint sync from Apidog"
   ```

### Development Workflow

1. **Make changes in Apidog UI**
   - Edit endpoints in Apidog dashboard
   - Test API changes

2. **Pull changes locally**
   ```bash
   node scripts/pull_endpoints.js
   ```

3. **Review and commit**
   ```bash
   git diff apis/endpoints.json
   git add apis/endpoints.json
   git commit -m "Update endpoints from Apidog"
   ```

### Deployment Workflow

1. **Update local endpoint definitions**
   - Edit `apis/endpoints.json` or create new definitions
   - Review changes in version control

2. **Push to Apidog**
   ```bash
   node scripts/push_endpoints.js
   ```

3. **Verify in Apidog UI**
   - Check that endpoints are updated correctly
   - Test API functionality

## MCP Tools

When the MCP server is running, you have access to various tools for interacting with Apidog. Query the server for available tools:

```bash
# List available MCP tools
# (command depends on your MCP client)
```

Common MCP tools include:
- `apidog-get-endpoints` - Fetch endpoint definitions
- `apidog-update-endpoint` - Update a single endpoint
- `apidog-get-collections` - List all collections
- `apidog-get-schema` - Get API schema information

## Best Practices

### Version Control
- **Always commit** `apis/endpoints.json` changes
- **Use descriptive commit messages** when syncing endpoints
- **Review diffs carefully** before pushing to Apidog

### Security
- **Never commit** `.env` file to version control
- **Rotate tokens regularly** for production environments
- **Use separate tokens** for development and production

### Development
- **Pull before push** - Always sync latest state before making changes
- **Test locally first** - Verify endpoint definitions before pushing
- **Use TypeScript** - Leverage type definitions for safer code

### Automation
- **CI/CD integration** - Use scripts in automated workflows
- **Scheduled syncs** - Set up cron jobs for regular endpoint backups
- **Pre-commit hooks** - Validate endpoint JSON before commits

## Troubleshooting

### MCP Server Won't Start

**Problem:** Server fails to start or connect

**Solutions:**
1. Check environment variables are set correctly
2. Verify your access token is valid
3. Ensure project ID is correct
4. Check network connectivity to Apidog

### Pull Script Fails

**Problem:** Cannot fetch endpoints from Apidog

**Solutions:**
1. Verify MCP server is running
2. Check API token permissions
3. Confirm project ID is correct
4. Review error messages for specific issues

### Push Script Fails

**Problem:** Cannot update endpoints in Apidog

**Solutions:**
1. Ensure you have write permissions
2. Validate JSON file format
3. Check for conflicting endpoint IDs
4. Review Apidog API rate limits

### Environment Variables Not Loading

**Problem:** Scripts report missing credentials

**Solutions:**
1. Verify `.env` file exists
2. Check variable names match exactly
3. Use `source .env` to load manually
4. Ensure no quotes around values (unless needed)

## Advanced Topics

### Custom MCP Tools

Extend functionality by creating custom MCP tools:

```javascript
// Example: Custom tool for filtering endpoints
async function filterEndpointsByMethod(method) {
  // Use MCP server to get all endpoints
  // Filter by HTTP method
  // Return filtered results
}
```

### Batch Operations

Process multiple endpoints efficiently:

```javascript
// Example: Update multiple endpoints at once
const endpoints = await pullEndpoints();
const updatedEndpoints = endpoints.map(transformEndpoint);
await pushEndpoints(updatedEndpoints);
```

### Integration with Other Tools

Connect Apidog with other development tools:
- **Postman** - Export/import collections
- **OpenAPI** - Generate OpenAPI specs from Apidog
- **Testing Frameworks** - Auto-generate tests from endpoints

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with clear commit messages
4. **Test thoroughly** with your own Apidog project
5. **Submit a pull request** with detailed description

## Resources

- [Apidog Documentation](https://apidog.com/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [BananaStudio Project](https://github.com/BananaStudio-AI)

## License

See LICENSE file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Apidog support resources
