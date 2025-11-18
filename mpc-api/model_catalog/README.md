# Model Brain v0.1 - Model Catalog System

A foundational model catalog system for organizing and querying AI models with rich metadata.

## Overview

The Model Catalog provides a structured way to manage model metadata including:
- Model identifiers and aliases
- Provider information
- Supported modalities (text, image, vision, etc.)
- Task capabilities
- Domain classifications
- Quality and speed tiers
- Feature support flags

## Directory Structure

```
mpc-api/model_catalog/
├── model_catalog.json      # JSON catalog with model entries
├── src/
│   └── catalog.ts          # TypeScript interfaces and loader functions
└── README.md               # This file
```

## Usage

### Load the Catalog

```typescript
import { loadCatalog } from './mpc-api/model_catalog/src/catalog.ts';

const catalog = await loadCatalog();
console.log(`Loaded ${catalog.models.length} models`);
```

### Find a Model by ID

```typescript
import { findModelById } from './mpc-api/model_catalog/src/catalog.ts';

const model = await findModelById('gpt-4-turbo');
if (model) {
  console.log(`Found: ${model.canonical_id} by ${model.provider}`);
}
```

### Find Models by Provider

```typescript
import { findModelsByProvider } from './mpc-api/model_catalog/src/catalog.ts';

const openaiModels = await findModelsByProvider('openai');
console.log(`Found ${openaiModels.length} OpenAI models`);
```

### Find Models by Modality

```typescript
import { findModelsByModality } from './mpc-api/model_catalog/src/catalog.ts';

const imageModels = await findModelsByModality('image');
console.log(`Found ${imageModels.length} image generation models`);
```

### Search Models

```typescript
import { searchModels } from './mpc-api/model_catalog/src/catalog.ts';

const results = await searchModels('claude');
console.log(`Found ${results.length} matching models`);
```

## Model Entry Schema

Each model entry in `model_catalog.json` includes:

```typescript
{
  canonical_id: string;        // Unique identifier for the model
  provider_id: string;         // Provider-specific model ID
  provider: string;            // Provider name (e.g., "openai", "anthropic")
  modality: string[];          // Supported modalities (e.g., ["text", "vision"])
  tasks: string[];             // Supported tasks (e.g., ["chat", "completion"])
  domains: string[];           // Application domains (e.g., ["general", "code"])
  quality_tier: string;        // Quality rating (e.g., "premium", "high", "standard")
  speed_tier: string;          // Speed rating (e.g., "fast", "medium", "slow")
  supports: {                  // Feature support flags
    images: boolean;
    video: boolean;
    audio: boolean;
    structured_output: boolean;
  };
  aliases: string[];           // Alternative names/identifiers
}
```

## Example Models

The catalog includes example models:

1. **gpt-4-turbo** - OpenAI's GPT-4 Turbo with vision capabilities
2. **claude-3-opus** - Anthropic's Claude 3 Opus model
3. **llama-3-70b** - Meta's Llama 3 70B chat model
4. **flux-1-dev** - FAL's Flux image generation model

## Testing

Run the test script to verify the catalog:

```bash
npm run tsx scripts/test_model_catalog.ts
```

Or using tsx directly:

```bash
npx tsx scripts/test_model_catalog.ts
```

## Extending the Catalog

To add new models:

1. Open `model_catalog.json`
2. Add a new entry to the `models` array following the schema
3. Ensure all required fields are present
4. Run the test script to verify

## Version

- **Current Version:** 0.1.0
- **Status:** Foundational Release
- **Created:** November 2025
