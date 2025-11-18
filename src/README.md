# MPC-API Server

Express server implementation for the MPC-API application, providing REST endpoints for AI model selection and management.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## Available Endpoints

### Health Check
- **GET** `/health` - Server health check

### Model Selection
- **POST** `/api/select-model` - Select best model based on criteria

See [SELECT_MODEL_API.md](../docs/SELECT_MODEL_API.md) for detailed API documentation.

## Project Structure

```
src/
├── app.ts                      # Express application setup
├── routes/
│   ├── index.ts               # Main routes index
│   └── selectModel.ts         # Model selection endpoint
└── types/
    └── modelSelection.ts      # TypeScript types
```

## Configuration

Environment variables:
- `PORT` - Server port (default: 3000)

## Development

```bash
# Watch mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Type checking
npx tsc --noEmit
```

## Dependencies

- **Express 5.x** - Web framework
- **TypeScript** - Type safety
- **tsx** - TypeScript execution

## Model Registry

The server uses the unified model registry at `data/model_registry.json`, which includes:
- 568 models from Comet API (LLMs)
- 866 models from FAL Platform (creative AI)

Access via `apis/model_registry/service.ts`:
```typescript
import { loadRegistry } from './apis/model_registry/service.js';
const models = await loadRegistry();
```
