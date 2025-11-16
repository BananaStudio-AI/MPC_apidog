# Examples

Example code and usage patterns for working with the BananaStudio API Hub.

## Available Examples

### 1. TypeScript Client Usage
**File**: `typescript_client_usage.ts`

Demonstrates how to use the auto-generated TypeScript client to interact with both Comet and FAL APIs.

```bash
# Run the example
npx tsx examples/typescript_client_usage.ts
```

**Features**:
- Querying Comet LLM models
- Fetching FAL creative models with filters
- Getting pricing information
- Estimating costs for model usage

### 2. Model Registry Usage
**File**: `model_registry_usage.mjs`

Shows how to work with the unified model registry that combines Comet and FAL models.

```bash
# Run the example
node examples/model_registry_usage.mjs
```

**Features**:
- Fetching all models from both sources
- Filtering by category (e.g., text-to-image)
- Searching by provider or model ID
- Grouping models by source

### 3. Direct API Usage
**File**: `direct_api_usage.mjs`

Demonstrates making direct API calls using fetch without the generated client.

```bash
# Run the example
node examples/direct_api_usage.mjs
```

**Features**:
- Raw HTTP requests to Comet API
- Raw HTTP requests to FAL API
- Understanding API response structures
- Cost estimation with direct calls

### 4. Legacy Client Example
**File**: `use_api_client.js`

Original example showing basic API client usage.

```bash
# Run the example
node examples/use_api_client.js
```

## Prerequisites

Before running examples, ensure you have:

1. **Installed dependencies**:
   ```bash
   npm install
   ```

2. **Configured environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Required API keys**:
   - `COMET_API_KEY` - For Comet API access
   - `FAL_API_KEY` - For FAL Platform access

## Common Patterns

### Initialize OpenAPI Client

```typescript
import { CometApiService, OpenAPI } from '../apis/api-hub-client';

OpenAPI.BASE = 'https://api.cometapi.com/v1';
OpenAPI.TOKEN = process.env.COMET_API_KEY;

const models = await CometApiService.listCometModels();
```

### Use Model Registry

```typescript
import { fetchAllModels } from '../apis/model_registry';

const models = await fetchAllModels();
const cometModels = models.filter(m => m.source === 'comet');
```

### Handle Errors

```typescript
try {
  const result = await someApiCall();
} catch (error) {
  console.error(`API error: ${error.message}`);
  // Handle error appropriately
}
```

## Running Multiple Examples

Run all examples in sequence:

```bash
# TypeScript example
npx tsx examples/typescript_client_usage.ts

# Model registry example
node examples/model_registry_usage.mjs

# Direct API example
node examples/direct_api_usage.mjs
```

## Troubleshooting

### Missing API Keys

If you see warnings about missing API keys:
```
⚠️  Warning: COMET_API_KEY not set
```

Solution: Add the key to your `.env` file:
```bash
COMET_API_KEY=your_key_here
```

### Import Errors

If you get module import errors, ensure:
- Dependencies are installed: `npm install`
- Using correct Node.js version: `node --version` (should be 18+)

### TypeScript Compilation Errors

For TypeScript examples, ensure tsx is installed:
```bash
npm install -g tsx
# Or use via npx
npx tsx examples/typescript_client_usage.ts
```

## Creating Your Own Examples

1. Create a new file in the `examples/` directory
2. Import the necessary modules:
   ```typescript
   import { CometApiService, FalApiService } from '../apis/api-hub-client';
   import { config } from 'dotenv';
   ```
3. Configure environment:
   ```typescript
   config(); // Load .env variables
   ```
4. Make it executable:
   ```bash
   chmod +x examples/your_example.ts
   ```

## Client Regeneration

If the OpenAPI spec changes, regenerate the client:

```bash
npm run apidog:pull          # Pull latest spec from Apidog
npm run oas:sync             # Copy to openapi/
npm run generate:api-hub-client  # Regenerate TypeScript client
```

## Additional Resources

- [API Hub Documentation](../docs/API_HUB_README.md)
- [Quick Reference](../QUICK_REFERENCE_V2.md)
- [TypeScript Client README](../apis/api-hub-client/README.md)
- [Model Registry Service](../apis/model_registry/)
