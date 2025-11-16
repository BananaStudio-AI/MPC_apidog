# Generated API Clients

This directory will contain auto-generated API client code from OpenAPI specifications.

## Planned Generators

- **TypeScript/JavaScript**: axios-based client
- **Python**: httpx-based client  
- **Go**: net/http client

## Generation (Future)

```bash
# Generate TypeScript client from OAS
npm run generate:client:ts

# Generate Python client
npm run generate:client:py
```

## Usage Example

```typescript
import { ApidogClient } from './apis/typescript';

const client = new ApidogClient({
  baseURL: 'https://api.fal.ai',
  apiKey: process.env.FAL_API_KEY
});

const pricing = await client.getModelsPricing();
```

## Version Control

Generated clients are tracked to ensure reproducible builds and API versioning.
