# API Hub TypeScript Client

This client is auto-generated from the normalized OpenAPI spec for the BananaStudio API Hub (Comet + FAL).

## Usage

Install dependencies:
```bash
npm install
```

Import and use the client:
```ts
import { ApiClient } from './apis/api-hub-client';

// For FAL endpoints
const falClient = new ApiClient({ apiKey: process.env.FAL_API_KEY });
const pricing = await falClient.getModelsPricing();

// For Comet endpoints
const cometClient = new ApiClient({ apiKey: process.env.COMET_API_KEY, baseUrl: 'https://api.cometapi.com/v1' });
const models = await cometClient.getModels();
```

## Endpoints
- `GET /models` (tag: COMET_API, FAL_API)
- `GET /models/pricing` (tag: FAL_API)
- `POST /models/pricing/estimate` (tag: FAL_API)
- `GET /models/usage` (tag: FAL_API)
- `GET /models/analytics` (tag: FAL_API)

## Regenerate client
```bash
npm run generate:api-hub-client
```

## Update OAS from Apidog
```bash
npm run apidog:pull && npm run oas:sync && node scripts/normalize_api_hub_oas.mjs
```

## Import to Apidog
Upload `apidog/generated/oas_merged.json` in the Apidog UI to sync endpoints.
