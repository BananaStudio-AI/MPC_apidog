# Contributing to BananaStudio API Hub

Thank you for your interest in contributing to the BananaStudio API Hub! This guide will help you get started with development, understand our conventions, and submit high-quality contributions.

## 📋 Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [MCP Server Integration](#mcp-server-integration)
- [Code Conventions and Standards](#code-conventions-and-standards)
- [Adding New API Endpoints](#adding-new-api-endpoints)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## 🚀 Development Environment Setup

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **TypeScript**: v5.x (installed as dev dependency)
- **Git**: Latest version

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/MPC_apidog.git
   cd MPC_apidog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```bash
   # Required API Keys
   COMET_API_KEY=your_comet_api_key_here
   FAL_API_KEY=your_fal_api_key_here
   
   # Apidog Integration (for MCP server)
   APIDOG_ACCESS_TOKEN=your_team_token_here
   APIDOG_PROJECT_ID=1128155
   
   # Optional: OpenAI for agent workflows
   OPENAI_API_KEY=your_openai_key_here
   ```

   **Important**: Get your Apidog token from **Team Settings → Authorization → API Access Tokens** (NOT from Account Settings to avoid 403 errors).

4. **Verify your setup**
   ```bash
   # Check Apidog authentication
   npm run apidog:auth-check
   
   # Validate API connectivity
   npm run health:api-hub
   ```

### Development Workflow

```bash
# Sync model registry from APIs
npm run sync:model-registry

# Generate/regenerate TypeScript client
npm run generate:api-hub-client

# Validate OpenAPI spec
npm run validate:oas

# Push changes to Apidog
npm run push:apidog
```

## 🔌 MCP Server Integration

The BananaStudio API Hub uses the **Apidog Model Context Protocol (MCP) server** for fully auto-documented API management. This is a core architectural principle: **all API interactions should go through MCP tools**.

### Running the MCP Server

```bash
# Start MCP server (requires APIDOG_ACCESS_TOKEN)
npx -y apidog-mcp-server@latest --project-id=1128155

# List available MCP tools
npm run apidog:list-tools
```

### MCP Server Configuration

The MCP server configuration is stored in `mcp.json` and includes:

- **CometModels_API**: Model registry and metadata (568 LLMs)
- **FAL_API**: Creative generation platform (866 models)
- **BananaStudio_Internal**: Internal services
- **Utilities**: Helper functions

### Using MCP in Your Code

**✅ DO**: Use MCP tools for API interactions
```typescript
// Query MCP server for API definitions
const tools = await mcpClient.listTools();
const endpoint = tools.find(t => t.name === 'fal_get_models');
```

**❌ DON'T**: Hardcode API URLs or guess endpoints
```typescript
// BAD: Hardcoded URL
const response = await fetch('https://api.fal.ai/v1/models');
```

### MCP Best Practices

1. **Query before using**: Always fetch API schema from MCP server before making calls
2. **Use typed clients**: Leverage auto-generated TypeScript clients from OpenAPI specs
3. **No URL hardcoding**: All endpoints should come from MCP definitions
4. **Document integration**: Update MCP config when adding new API providers

## 📝 Code Conventions and Standards

### ES Modules (ESM)

This project uses **ES Modules** exclusively:

```json
// package.json
{
  "type": "module"
}
```

**Import syntax:**
```typescript
// ✅ Correct
import { fetchAllModels } from '../apis/model_registry/index.js';
import path from 'node:path';

// ❌ Wrong
const { fetchAllModels } = require('../apis/model_registry');
```

**File extensions:**
- Use `.mjs` for JavaScript ES modules
- Use `.ts` for TypeScript files (compiled to ESM)
- Always include `.js` extension in relative imports (TypeScript will resolve `.ts`)

### TypeScript Guidelines

#### Type Safety
```typescript
// ✅ Define explicit types
interface ModelRecord {
  source: 'comet' | 'fal';
  id: string;
  provider: string | null;
}

// ✅ Use type assertions carefully
const data = await response.json() as ModelRecord[];

// ❌ Avoid 'any' unless absolutely necessary
```

#### Async/Await
```typescript
// ✅ Use async/await for async operations
async function fetchModels(): Promise<ModelRecord[]> {
  const response = await fetch(url);
  return await response.json();
}

// ✅ Handle errors properly
try {
  const models = await fetchModels();
} catch (err) {
  console.error('Failed to fetch models:', err);
  throw err;
}
```

#### File Structure
```typescript
// Standard file structure for TypeScript modules
import { Type1, Type2 } from './types.js';
import { externalLib } from 'external-lib';

// Constants
const CONFIG = { ... };

// Types/Interfaces
interface LocalType { ... }

// Functions
export async function mainFunction() { ... }

// Main execution (if script)
if (import.meta.url === `file://${process.argv[1]}`) {
  mainFunction().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
```

### Code Style

#### Naming Conventions
- **Files**: `snake_case.ts` for scripts, `kebab-case.ts` for modules
- **Functions**: `camelCase` (e.g., `fetchAllModels`)
- **Classes**: `PascalCase` (e.g., `ApiClient`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Types/Interfaces**: `PascalCase` (e.g., `ModelRecord`)

#### Comments
```typescript
// ✅ Document complex logic and public APIs
/**
 * Fetches all models from Comet and FAL APIs and merges them
 * into a unified registry.
 * 
 * @returns Promise resolving to array of unified model records
 * @throws Error if API keys are missing or requests fail
 */
export async function fetchAllModels(): Promise<UnifiedModelRecord[]> {
  // ...
}

// ✅ Brief inline comments for clarification
const filtered = models.filter(m => m.source === 'comet'); // Only LLMs

// ❌ Don't over-comment obvious code
// This increments the counter
counter++; // BAD
```

#### Formatting
- **Indentation**: 2 spaces (not tabs)
- **Line length**: Aim for 100 characters max
- **Semicolons**: Use them consistently
- **Quotes**: Single quotes for strings (except JSON)
- **Trailing commas**: Use in multi-line objects/arrays

### Error Handling

```typescript
// ✅ Descriptive error messages
if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

// ✅ Graceful degradation
try {
  const data = await fetchData();
} catch (err) {
  console.error('Failed to fetch data:', err.message);
  return []; // Return empty array instead of crashing
}

// ✅ Process exit codes
process.exit(1); // Error
process.exit(0); // Success
```

## 🔧 Adding New API Endpoints

### Step 1: Update OpenAPI Specification

Edit `openapi/api-hub.oas.json`:

```json
{
  "paths": {
    "/your-provider/new-endpoint": {
      "get": {
        "summary": "Description of endpoint",
        "operationId": "getYourProviderNewEndpoint",
        "tags": ["YourProvider"],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/YourResponse"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Step 2: Define Response Schemas

Add schemas under `components/schemas`:

```json
{
  "components": {
    "schemas": {
      "YourResponse": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": { "$ref": "#/components/schemas/YourModel" }
          }
        }
      }
    }
  }
}
```

### Step 3: Regenerate TypeScript Client

```bash
npm run generate:api-hub-client
```

This uses `openapi-typescript-codegen` to generate type-safe client code in `apis/api-hub-client/`.

### Step 4: Update Model Registry (if applicable)

If adding a new model provider, update `apis/model_registry/index.ts`:

```typescript
export async function fetchYourProviderModels(): Promise<UnifiedModelRecord[]> {
  const apiKey = process.env.YOUR_PROVIDER_API_KEY;
  if (!apiKey) {
    console.error('YOUR_PROVIDER_API_KEY not set');
    return [];
  }

  const response = await fetch('https://api.yourprovider.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  
  return data.models.map((m: any) => ({
    source: 'your-provider' as const,
    id: m.id,
    provider: m.provider ?? null,
    name: m.name,
    description: m.description ?? null,
    // ... map other fields
  }));
}

// Update fetchAllModels() to include new provider
export async function fetchAllModels(): Promise<UnifiedModelRecord[]> {
  const [comet, fal, yourProvider] = await Promise.all([
    fetchCometModels(),
    fetchFalModels(),
    fetchYourProviderModels()
  ]);
  
  return [...comet, ...fal, ...yourProvider];
}
```

### Step 5: Push to Apidog

```bash
npm run push:apidog
```

### Step 6: Test Your Endpoint

Create a test script in `scripts/`:

```typescript
import ApiClient from '../apis/api-hub-client';

async function test() {
  const client = new ApiClient({
    BASE: 'http://localhost:3000' // or production URL
  });
  
  const result = await client.yourProvider.getYourProviderNewEndpoint();
  console.log('Result:', result);
}

test().catch(console.error);
```

Run with: `tsx scripts/test_your_endpoint.ts`

## 🧪 Testing Guidelines

### Manual Testing

Before submitting a PR, run these tests:

```bash
# 1. Validate environment setup
npm run apidog:auth-check

# 2. Health check all APIs
npm run health:api-hub

# 3. Regenerate client to ensure types are correct
npm run generate:api-hub-client

# 4. Validate OpenAPI spec
npm run validate:oas

# 5. Test model registry sync
npm run sync:model-registry
```

### Writing Test Scripts

Create test scripts in `scripts/test_*.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * Test script for [feature name]
 */

async function test() {
  console.log('Testing [feature]...\n');
  
  try {
    // Test implementation
    const result = await yourFunction();
    
    console.assert(result !== null, 'Result should not be null');
    console.log('✓ Test passed');
  } catch (err) {
    console.error('✗ Test failed:', err);
    process.exit(1);
  }
}

test();
```

### Automated Tests (Future)

We plan to add:
- Unit tests with Jest/Vitest
- Integration tests for API endpoints
- E2E tests for complete workflows

## 📤 Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow code conventions
   - Update documentation if needed
   - Add tests for new functionality

3. **Test thoroughly**
   ```bash
   npm run health:api-hub
   npm run validate:oas
   ```

4. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat: add new endpoint for X"
   ```
   
   Use conventional commit format:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

### Submitting the PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub and create a new PR
   - Use a clear, descriptive title
   - Fill out the PR template

3. **PR Description Template**
   ```markdown
   ## Summary
   Brief description of changes
   
   ## Changes Made
   - Added X endpoint
   - Updated Y documentation
   - Fixed Z bug
   
   ## Testing
   - [ ] Ran health checks
   - [ ] Validated OpenAPI spec
   - [ ] Tested manually
   
   ## Related Issues
   Closes #123
   ```

### Review Process

1. **Automated Checks**: CI/CD will run validation
2. **Code Review**: Maintainers will review your code
3. **Address Feedback**: Make requested changes
4. **Approval & Merge**: Once approved, your PR will be merged

### PR Best Practices

- **Keep PRs focused**: One feature/fix per PR
- **Small commits**: Easier to review and revert if needed
- **Update documentation**: Keep docs in sync with code
- **Respond promptly**: Address review comments quickly
- **Test edge cases**: Consider error scenarios

## 📁 Project Structure

```
/home/runner/work/MPC_apidog/MPC_apidog/
├── .github/
│   ├── agents/              # Custom agent definitions
│   └── copilot-instructions.md
├── apis/
│   ├── api-hub-client/      # Generated TypeScript client
│   └── model_registry/      # Unified model catalog service
│       ├── index.ts         # API fetch functions
│       ├── service.ts       # Registry business logic
│       └── types.ts         # Type definitions
├── apidog/
│   └── scripts/             # Apidog integration scripts
├── data/
│   └── model_registry.json  # Cached model catalog (1,434 records)
├── docs/                    # Documentation
│   ├── API_HUB_V2_RESTRUCTURE.md
│   ├── ARCHITECTURE.md
│   ├── MCP_CONFIGURATION.md
│   └── ...
├── examples/                # Usage examples
│   ├── use_api_client.js
│   └── ...
├── openapi/
│   └── api-hub.oas.json     # Canonical OpenAPI spec (v2.0.0)
├── scripts/                 # Automation scripts
│   ├── sync_model_registry.ts
│   ├── healthcheck_api_hub.ts
│   └── ...
├── .env.example             # Environment template
├── .gitignore
├── mcp.json                 # MCP server configuration
├── package.json
└── README.md
```

### Key Directories

- **`apis/`**: API client libraries and services
- **`scripts/`**: Automation and utility scripts
- **`openapi/`**: OpenAPI specifications (source of truth)
- **`docs/`**: Project documentation
- **`examples/`**: Example code and tutorials
- **`data/`**: Cached data and model registries

## 🤝 Getting Help

- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check `docs/` folder for detailed guides

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to BananaStudio API Hub! 🍌✨
