# MPC-API Backend and Model Brain v1.0 — Architecture

## Overview

MPC-API is a Node.js + TypeScript Express backend that exposes a unified “model brain” on port `3000`. It is the single gateway for model-related operations, sitting between tools (Dify, Langflow, Activepieces, internal scripts) and the LiteLLM provider interface.

Key HTTP endpoints:

- `GET /health` — basic health and readiness check.
- `POST /api/select-model` — select the best model from the catalog for a given task.
- `POST /api/orchestrate` — return a multi-step plan for job-type workflows.
- `POST /api/chat/completions` — proxy chat/completion requests via LiteLLM.

All model traffic is expected to go:

> Client / Tool → MPC-API → LiteLLM → Provider(s)

There are no direct calls from clients to provider APIs; all routing and catalog logic lives inside MPC-API.

### Provider Ecosystem

Under the hood, LiteLLM can route to multiple providers including OpenAI, Anthropic, Google, Mistral, Groq, Comet API, FAL, Replicate, HF Inference, DeepInfra, Together.ai, OpenRouter, and other HTTP providers configured via the shared LiteLLM config.

### Ecosystem Components

- MPC-API: gateway, orchestration, and model catalog.
- LiteLLM: provider abstraction/proxy.
- Dify: app and workflow layer calling MPC-API.
- Langflow: visual flow builder calling MPC-API.
- ActivePieces: automation/triggers calling MPC-API.
- LlamaIndex: RAG and vector pipelines invoking MPC-API for model calls.
- Portkey Gateway: optional policy/observability in front of providers.
- Comet Opik: optional LLM evaluation and telemetry (non-inference).
- Docker Desktop + WSL: local runtime for MPC-API + LiteLLM stack.

See [docs/PROVIDER_INTEGRATION_MATRIX.md](PROVIDER_INTEGRATION_MATRIX.md) for the full provider and platform matrix.

## Model Catalog

The model catalog is the core “brain” of MPC-API. It describes all available models, their capabilities, and how they should be used.

- Location: `mpc-api/model_catalog/model_catalog.json`
- Loading: the catalog is loaded using NodeNext/ESM-safe path resolution:
  - `import.meta.url` plus `fileURLToPath` to build a stable, cross-platform path at runtime.
  - This avoids assumptions about `process.cwd()` and works cleanly with ES modules.

Each model entry in the catalog includes (non-exhaustive) fields:

- `canonical_id`: Stable, globally unique identifier for the logical model (e.g. `"gpt-4o@openai"`).
- `provider_id`: Provider-specific model name used when calling LiteLLM (e.g. `"openai/gpt-4o-mini"`).
- `provider`: Logical provider label (e.g. `"openai"`, `"anthropic"`, `"fal"`, `"comet"`, `"hf"`).
- `modality[]`: One or more modalities, such as `"text"`, `"image"`, `"video"`, `"audio"`.
- `tasks[]`: Supported task types (e.g. `"chat"`, `"reasoning"`, `"classification"`, `"video_overlay"`).
- `domains[]`: Domains where this model is preferred (e.g. `"general"`, `"tariffs"`, `"legal"`, `"creative"`).
- `quality_tier`: Overall quality band:
  - `"flagship"` — highest quality; preferred for high-stakes or polished outputs.
  - `"strong"` — solid general-purpose choice balancing quality and efficiency.
  - `"draft"` — fast, lower-cost; suited to exploratory or iterative work.
- `speed_tier`: Relative performance tier (e.g. `"fast"`, `"normal"`, `"slow"`) to help trade off latency vs. quality.
- `supports`: Capability flags, for example:
  - `supports.images` (boolean)
  - `supports.video` (boolean)
  - `supports.audio` (boolean)
  - `supports.structured_output` (boolean)
- `aliases[]`: User-facing aliases for the model (e.g. `"fast-chat"`, `"tariff-llm"`).

The catalog provides enough structure for MPC-API to:

- Filter models by task, domain, and modality.
- Prefer higher quality tiers when appropriate.
- Select models that support specific modalities or advanced features.
- Resolve human-friendly aliases to concrete provider IDs before calling LiteLLM.

## Model Selection Endpoint — `POST /api/select-model`

The model selection endpoint chooses the best model for a given task based on catalog metadata.

### Request

Expected request fields:

- `task_type` (string, required): Logical task type (e.g. `"reasoning"`, `"classification"`, `"tariff_video_overlay_text"`).
- `domain` (string, required): Domain such as `"general"`, `"tariffs"`, `"legal"`, `"creative"`.
- `modality` (string, optional): One of the catalog modalities (e.g. `"text"`, `"image"`, `"video"`). If omitted, a sensible default is inferred from the `task_type` and `domain`.

### Behavior

High-level algorithm:

1. Load the model catalog from `model_catalog.json` using ESM-safe path resolution.
2. Filter models by:
   - `modality` matching the requested modality (when provided).
   - `tasks` containing `task_type`.
   - `domains` containing `domain`.
3. Rank the remaining candidates by `quality_tier` in descending order:
   - `"flagship"` > `"strong"` > `"draft"`.
4. Optionally apply secondary tie-breakers (e.g. `speed_tier`) if multiple models share the same quality tier.
5. Return:
   - `selected_model`: the best model according to the ranking.
   - `candidates[]`: all candidate models in ranked order for transparency and debugging.

### Example Request

```json
POST /api/select-model
Content-Type: application/json

{
  "task_type": "reasoning",
  "domain": "general",
  "modality": "text"
}
```

### Example Response

```json
{
  "selected_model": {
    "canonical_id": "gpt-4o@openai",
    "provider_id": "openai/gpt-4o",
    "provider": "openai",
    "quality_tier": "flagship",
    "speed_tier": "normal",
    "modality": ["text"],
    "tasks": ["chat", "reasoning"],
    "domains": ["general"],
    "aliases": ["flagship-chat"]
  },
  "candidates": [
    { "...": "other compatible models in ranked order" }
  ]
}
```

## Orchestration Endpoint — `POST /api/orchestrate`

The orchestration endpoint returns a multi-step plan for complex jobs. The client passes a `job_type`, and MPC-API returns a sequence of steps; each step references a model alias from the catalog.

### Behavior

- Input: `job_type` (string, required).
- For each supported `job_type`, MPC-API encodes a deterministic plan:
  - A list of steps.
  - Each step has:
    - A `name` (e.g. `"generate_text"`).
    - A `description`.
    - A `model_alias` pointing into the model catalog.
    - Optional parameters or hints for the downstream caller.
- The client is responsible for executing these steps by calling `/api/chat/completions` (or other APIs) with the provided aliases.

### Example: `job_type = "tariff_video_overlay"`

```json
POST /api/orchestrate
Content-Type: application/json

{
  "job_type": "tariff_video_overlay"
}
```

Example response:

```json
{
  "job_type": "tariff_video_overlay",
  "plan": {
    "steps": [
      {
        "name": "generate_text",
        "description": "Generate a tariff-compliant script for the video voiceover.",
        "model_alias": "tariff-text-flagship"
      },
      {
        "name": "layout_overlay_spec",
        "description": "Produce a JSON overlay spec for captions and graphics.",
        "model_alias": "layout-spec-strong"
      },
      {
        "name": "render_video",
        "description": "Render the final video with overlays applied.",
        "model_alias": "video-renderer"
      }
    ]
  }
}
```

Each `model_alias` is resolved via the catalog, and individual steps typically use `/api/chat/completions` to execute LLM calls.

## Chat Proxy Endpoint — `POST /api/chat/completions`

The chat proxy endpoint is the main way to execute LLM-style operations. It hides provider diversity behind the model catalog and LiteLLM.

### Inputs

- `model`: A model alias or `canonical_id` defined in the catalog.
- `messages[]`: A standard chat-style message array (e.g. OpenAI-style) with roles such as `"system"`, `"user"`, and `"assistant"`.
- Additional fields may be supported (e.g. `temperature`, `max_tokens`) and are forwarded to LiteLLM when compatible.

### Behavior

1. Resolve the incoming `model`:
   - Look up the alias or `canonical_id` in the catalog.
   - Retrieve the corresponding `provider_id`.
2. Proxy the request to LiteLLM:
   - Base URL: `LITELLM_BASE_URL` (e.g. `http://litellm:4000`).
   - Typical target path: `POST {LITELLM_BASE_URL}/chat/completions`.
   - Replace the client-facing `model` with `provider_id` before forwarding.
3. Return the provider-style chat completion payload from LiteLLM to the client.

### Error Handling

- If the model alias or `canonical_id` is unknown:
  - Respond with `400 Bad Request` and a JSON error (e.g. `{"error": "Unknown model alias: ... "}`).
- If LiteLLM is unreachable or returns an error:
  - MPC-API logs the error.
  - Responds with a `502 Bad Gateway` style error (e.g. `{"error": "Failed to reach LiteLLM proxy"}`).

## Docker & Network Topology

MPC-API and LiteLLM are designed to run together in Docker, sharing a common network.

Key files:

- `mpc-api/Dockerfile`
  - Base image: `node:20-alpine`.
  - Installs dependencies, runs `npm run build`, and starts `dist/server.js` on port `3000`.
- `docker-compose.yml`
  - Defines the `mpc-api` service and the `litellm` service.
  - Both are attached to the shared `ai-infra-net` Docker network.

Ports:

- `mpc-api`:
  - Container port `3000`, published as `3000:3000` on the host.
- `litellm`:
  - Container port `4000`, published as `4000:4000` on the host.

Within the Docker network:

- MPC-API reaches LiteLLM at `http://litellm:4000`.
- Future services (e.g. Dify, Langflow, Activepieces) are expected to join the same `ai-infra-net` and call MPC-API at `http://mpc-api:3000`.

## ASCII Diagrams

### High-Level Flow

```text
Dify / Langflow / Activepieces / Scripts
                    |
                    v
                 MPC-API
        (select-model / orchestrate / chat)
                    |
                    v
                 LiteLLM
                    |
                    v
  Model Providers (OpenAI, Anthropic, FAL, Comet, HF, ...)
```

### Job-Type Orchestration

```text
job_type ("tariff_video_overlay")
               |
               v
      /api/orchestrate → plan[steps]
               |
      +--------+---------+
      |        |         |
   step 1   step 2    step 3
 (generate  (layout   (render
  text)     overlay)  video)
      |        |         |
      v        v         v
/api/chat  /api/chat  /api/chat
completions completions completions
```

## Future Extensions

- Add additional `job_type` definitions for new multi-step workflows.
- Expand the model catalog with more providers, modalities, and domains.
- Add telemetry and metrics for model selection, orchestration, and latency.
- Provide dedicated integration guides for Dify, Langflow, and Activepieces that show how to route all model traffic through MPC-API and LiteLLM.
