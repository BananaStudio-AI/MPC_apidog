# MPC API Backend

This directory contains a minimal MPC API backend built with Express and TypeScript.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Run the compiled server:
   ```bash
   npm start
   ```

The server listens on port `3000` and exposes:
- `GET /health`
- `POST /api/chat/completions`
- `POST /api/select-model`
- `POST /api/orchestrate`

The LiteLLM proxy target is `http://litellm:4000/chat/completions`.
