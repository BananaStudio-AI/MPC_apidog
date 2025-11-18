# POST /api/select-model Endpoint

## Overview
This endpoint allows clients to select the best AI model from the catalog based on specified criteria such as task type, domain, and modality.

## Endpoint Details
- **URL**: `/api/select-model`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Request Body
```json
{
  "task_type": "string (optional)",
  "domain": "string (optional)",
  "modality": "string (optional)"
}
```

### Request Parameters
- `task_type` (optional): Filter models by task type (e.g., "image-to-image", "image-to-video", "text-to-image")
- `domain` (optional): Filter models by domain (currently mapped to category)
- `modality` (optional): Filter models by modality (currently mapped to category)

## Response Format

### Success Response (200 OK)
```json
{
  "selected_model": {
    "source": "fal",
    "id": "fal-ai/flux-pro/kontext",
    "provider": "fal-ai",
    "category": "image-to-image",
    "task_type": "image-to-image",
    "domain": "image-to-image",
    "modality": "image-to-image",
    "quality_tier": "flagship",
    "raw": { /* original model data */ }
  },
  "candidates": [
    /* array of all matching models */
  ]
}
```

### Error Response (404 Not Found)
```json
{
  "error": "No models found matching the specified criteria",
  "criteria": {
    "task_type": "invalid-type"
  }
}
```

### Error Response (500 Internal Server Error)
```json
{
  "error": "Internal server error",
  "message": "error details"
}
```

## Model Selection Logic

### 1. Filtering
Models are filtered based on the provided criteria:
- If `task_type` is specified, only models with matching `task_type` are included
- If `domain` is specified, only models with matching `domain` are included
- If `modality` is specified, only models with matching `modality` are included
- All criteria must match (AND logic)

### 2. Quality Tier Prioritization
The selected model is chosen from matching candidates based on quality tier ranking:
1. **flagship** (highest priority) - Pro, ultra, premium models
2. **strong** (medium priority) - Standard production models
3. **draft** (lowest priority) - Dev, beta, experimental models

Quality tier is inferred from model names:
- Contains "pro", "ultra", "flagship", or "premium" → `flagship`
- Contains "dev", "draft", "beta", or "lite" → `draft`
- Default → `strong`

### 3. Selection
The endpoint returns:
- `selected_model`: The highest-priority model from matching candidates
- `candidates`: All models that matched the filter criteria

## Examples

### Example 1: Filter by task type
```bash
curl -X POST http://localhost:3000/api/select-model \
  -H "Content-Type: application/json" \
  -d '{"task_type":"image-to-video"}'
```

Response:
```json
{
  "selected_model": {
    "id": "fal-ai/wan-pro/image-to-video",
    "quality_tier": "flagship",
    ...
  },
  "candidates": [ /* 127 models */ ]
}
```

### Example 2: Filter by domain
```bash
curl -X POST http://localhost:3000/api/select-model \
  -H "Content-Type: application/json" \
  -d '{"domain":"image-to-image"}'
```

Response:
```json
{
  "selected_model": {
    "id": "fal-ai/flux-pro/kontext",
    "quality_tier": "flagship",
    ...
  },
  "candidates": [ /* models with image-to-image category */ ]
}
```

### Example 3: No filters
```bash
curl -X POST http://localhost:3000/api/select-model \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:
```json
{
  "selected_model": {
    "id": "black-forest-labs/flux-1.1-pro",
    "quality_tier": "flagship",
    ...
  },
  "candidates": [ /* all 1434 models */ ]
}
```

### Example 4: Invalid criteria
```bash
curl -X POST http://localhost:3000/api/select-model \
  -H "Content-Type: application/json" \
  -d '{"task_type":"invalid-type"}'
```

Response (404):
```json
{
  "error": "No models found matching the specified criteria",
  "criteria": {
    "task_type": "invalid-type"
  }
}
```

## Implementation Notes

### Current Implementation
- Uses existing `loadRegistry()` function from `apis/model_registry/service.ts`
- Maps `task_type`, `domain`, and `modality` to the model's `category` field
- Quality tier is inferred from model names using heuristics
- All 1,434 models from the unified registry are available for selection

### Data Structure
The current model registry doesn't explicitly include `task_type`, `domain`, `modality`, or `quality_tier` fields. These are:
- **Inferred at runtime** from the model's `category` field
- **Quality tier** is determined by analyzing model names for common patterns
- **Extensible**: The type system supports explicit values if added to the registry in the future

### Future Enhancements
1. Add explicit `task_type`, `domain`, `modality`, and `quality_tier` fields to the model registry
2. Support more sophisticated filtering (e.g., cost, performance metrics)
3. Add pagination for large result sets
4. Support sorting criteria beyond quality tier
5. Add model recommendations based on use case patterns

## Starting the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm run start:prod

# Or use tsx directly
npm start
```

Server will start on `http://localhost:3000` (or the port specified in the `PORT` environment variable).

## Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T08:36:12.358Z",
  "service": "MPC-API"
}
```
