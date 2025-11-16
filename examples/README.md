# API Client Examples

This directory contains example scripts demonstrating how to use the generated API clients.

## Available Examples

### `api-hub-comprehensive.ts` ⭐ **NEW**
**Comprehensive example demonstrating the full BananaStudio API Hub workflow:**
- Querying Comet API for LLM models (568 models)
- Querying FAL API for creative models (866 models)
- Using the unified model registry
- Working with FAL pricing and cost estimation
- Proper error handling and TypeScript best practices
- Saving registry data to files

```bash
# Prerequisites: Set API keys in .env
tsx examples/api-hub-comprehensive.ts
```

### `use_api_client.js`
Demonstrates using the generated TypeScript/JavaScript client to:
- Fetch model pricing information
- Search for available models
- Handle API responses with strong typing

```bash
# Set your API key
export FAL_API_KEY="your-key-here"

# Run the example
node examples/use_api_client.js
```

## Client Regeneration

If the OpenAPI spec changes, regenerate the client:

```bash
npm run apidog:pull          # Pull latest spec from Apidog
npm run oas:sync             # Copy to openapi/
npm run generate:client      # Regenerate TypeScript client
```

## Adding New Examples

1. Create a new `.js` or `.ts` file in this directory
2. Import the client: `import { ApiClient } from '../apis/client';`
3. Document what the example demonstrates
4. Add to this README
