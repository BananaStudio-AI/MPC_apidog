# AI Providers and Platform Stack

## Overview

This document is the canonical reference for the AI provider and platform stack used with MPC-API. It aligns with the MPC-API Model Brain architecture and the Provider Integration Matrix, and is intended for engineers and operators who need to understand:

- Which providers and platforms are in scope.
- How they fit together (routing, catalog, infra).
- How to safely add or update providers and platforms.

All provider traffic flows through:

> Client / Platform → MPC-API → LiteLLM Gateway → Provider

No client or platform should call provider APIs directly.

---

## Model Providers (Final Stack)

### Primary Inference Providers

These providers are the main sources of LLM and multimodal inference.

- **OpenAI**
  - Modalities: text, image, audio, vision (via models like GPT‑4o).
  - Use cases: general chat, reasoning, coding, creative text, system prompts.
- **Anthropic**
  - Modalities: text, (image for select models).
  - Use cases: high‑quality reasoning, analysis, safety‑sensitive workflows.
- **Google Gemini**
  - Modalities: text, image, audio, video (Gemini family).
  - Use cases: multimodal reasoning, search‑augmented flows, creative tasks.
- **CometAPI**
  - Modalities: text, image (model‑dependent).
  - Use cases: tariff‑sensitive text, domain‑specific models, creative content.
- **fal.ai**
  - Modalities: image, video, some text input for prompts.
  - Use cases: image/video generation, overlays, creative pipelines.
- **Replicate**
  - Modalities: text, image, audio, video (model‑dependent).
  - Use cases: experimental and creative models, diffusion, audio/video effects.
- **DeepInfra**
  - Modalities: text, image (model‑dependent).
  - Use cases: hosted open‑source models, cost‑/latency‑optimized inference.
- **HuggingFace Inference**
  - Modalities: text, image, audio (model‑dependent).
  - Use cases: OSS models, embeddings, custom pipelines.

### Performance Providers

These providers focus on performance and cost/latency trade‑offs.

- **GroqCloud**
  - Modalities: text.
  - Use cases: ultra‑low‑latency chat/completions, high‑throughput inference.
- **Together.ai**
  - Modalities: text, image (model‑dependent).
  - Use cases: cost‑efficient OSS/partner models, experimentation across vendors.

### Creative / Avatar / Voice Providers

These providers cover richer media (video, avatars, voice).

- **Pika Labs**
  - Modalities: video.
  - Use cases: generative video, creative animations.
- **RunwayML**
  - Modalities: video, image.
  - Use cases: video editing, generative video and motion graphics.
- **HeyGen**
  - Modalities: video (avatars).
  - Use cases: talking‑head avatars, scripted video generation.
- **ElevenLabs**
  - Modalities: audio.
  - Use cases: TTS, voice cloning, voiceovers for video workflows.

### Provider Metadata Schema

All providers are represented in the model catalog with a shared schema (see `mpc-api/model_catalog/model_catalog.json` for concrete entries).

Core fields:

- `canonical_id` — Stable internal identifier for a logical model (e.g. `openai-gpt-4o-main`).
- `provider_id` — Provider‑specific model name, used when calling LiteLLM (e.g. `openai/gpt-4o`).
- `provider` — Provider key (e.g. `openai`, `anthropic`, `google`, `comet_api`, `fal`, `replicate`, `deepinfra`, `hf`).
- `modality[]` — Modalities supported by this model (e.g. `["text"]`, `["image"]`, `["video","image"]`).
- `tasks[]` — High‑level tasks (e.g. `"chat"`, `"reasoning"`, `"video_overlay"`, `"creative_assets"`, `"tariff_compliance"`).
- `domains[]` — Domain tags (e.g. `"general"`, `"creative"`, `"tariffs"`, `"legal"`, `"marketing"`).
- `quality_tier` — Quality band: `"flagship"`, `"strong"`, or `"draft"`.
- `speed_tier` — Relative performance: e.g. `"fast"`, `"normal"`, `"slow"`.
- `supports` — Capability flags:
  - `supports.images` (boolean)
  - `supports.video` (boolean)
  - `supports.audio` (boolean)
  - `supports.structured_output` (boolean)
- `aliases[]` — Aliases used by MPC‑API and orchestration (e.g. `"text_general_flagship"`, `"video_overlay_flagship"`).

This schema is the basis for model selection (`/api/select-model`) and orchestration plans (`/api/orchestrate`).

---

## Platform Stack (Final)

### Core Platforms

These platforms are first‑class citizens in the stack. They orchestrate or host workflows but still route model calls via MPC‑API.

- **MPC-API**
  - Role: central gateway and Model Brain; exposes `/health`, `/api/select-model`, `/api/orchestrate`, `/api/chat/completions`.
  - Integration: called directly by tools and platforms for all model traffic.
- **LiteLLM Gateway**
  - Role: unified provider abstraction; handles vendor auth and routing.
  - Integration: receives proxied requests from MPC‑API; uses config under `ai-infra/litellm/config/`.
- **Dify**
  - Role: apps, agents, workflows.
  - Integration: calls MPC‑API HTTP endpoints for model operations.
- **Activepieces**
  - Role: automation and triggers.
  - Integration: uses HTTP steps/webhooks to call MPC‑API orchestrations and chat endpoints.
- **Langflow**
  - Role: visual flow builder for LLM pipelines.
  - Integration: calls MPC‑API for model invocations inside flows.
- **LlamaIndex**
  - Role: RAG and vector pipelines.
  - Integration: uses MPC‑API as the LLM/completions and sometimes embeddings backend.

### Optional Enhancers

These components are optional but valuable for UX, observability, or environment flexibility.

- **OpenWebUI**
  - Role: local UI for chatting with models.
  - Integration: configured to point at MPC‑API (not providers directly).
- **Flowise**
  - Role: visual workflow builder and orchestration layer.
  - Integration: calls MPC‑API endpoints via HTTP.
- **Modal**
  - Role: serverless execution & infra platform.
  - Integration: can host workers that in turn call MPC‑API.
- **E2B**
  - Role: sandboxed code execution / dev environments.
  - Integration: used for tools and dev workflows that call MPC‑API for LLM access.

### Platform Metadata Schema

For planning and documentation, platforms can be described with a simple schema:

- `name` — Platform name (e.g. `"Dify"`).
- `role` — Short description (e.g. `"apps/agents/workflows"`).
- `category` — `"core"` or `"optional"`.
- `connects_via` — How it talks to the rest of the stack (e.g. `"HTTP to MPC-API"`, `"wraps LiteLLM"`).
- `notes` — Any constraints or setup notes (auth, deployment mode, etc.).

This schema is reflected conceptually in `docs/PROVIDER_INTEGRATION_MATRIX.md`.

---

## Integration Pathways

### LiteLLM Routing

- LiteLLM is the only component that calls provider APIs directly.
- All LiteLLM models are configured via YAML (e.g. `ai-infra/litellm/config/config.yaml` and `litellm_config.yaml`).
- Model names configured in LiteLLM must match the `provider_id` fields in `model_catalog.json`.

### MPC-API Catalog

- MPC‑API uses `mpc-api/model_catalog/model_catalog.json` as the source of truth for model metadata.
- `/api/select-model` uses `tasks`, `domains`, `modality`, and `quality_tier` to select a single best model and provide ranked candidates.
- `/api/orchestrate` returns multi‑step plans where each step references a model alias or `canonical_id` from the catalog.

### Environment Variables

- Provider API keys are injected via environment variables:
  - Examples: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `COMET_API_KEY`, `FAL_API_KEY`, `REPLICATE_API_KEY`, `DEEPINFRA_API_KEY`, `HF_INFERENCE_API_KEY`.
- `.env.example` documents which keys are expected; secrets are not committed.
- LiteLLM configs reference these variables using `${VAR_NAME}` syntax.

### Docker / Infra Awareness

- `docker-compose.yml` defines:
  - `mpc-api` service on port `3000`.
  - `litellm` service on port `4000`.
  - Shared `ai-infra-net` network.
- Inside the Docker network:
  - MPC‑API calls LiteLLM at `http://litellm:4000`.
  - Tools or platforms running in other containers call `http://mpc-api:3000`.
- Local tools (cURL, Postman, Dify, etc.) use `http://localhost:3000` for MPC‑API.

---

## How to Add a New Provider

- **1. Update LiteLLM configuration**
  - Add a new `model_list` entry in the LiteLLM config (e.g. `ai-infra/litellm/config/config.yaml`).
  - Use provider‑specific model name and reference an environment variable API key.

- **2. Extend the model catalog**
  - Add a new JSON object to `mpc-api/model_catalog/model_catalog.json`:
    - Set `canonical_id`, `provider_id`, `provider`.
    - Fill `modality`, `tasks`, `domains`, `quality_tier`, `speed_tier`, `supports`, `aliases`.
  - Ensure at least one alias is suitable for orchestrations (e.g. `"text_general_flagship"`).

- **3. Wire into orchestration (optional)**
  - If the provider is used for a new workflow, update `/api/orchestrate` to reference the new alias in appropriate steps.

- **4. Validate**
  - Restart MPC‑API / LiteLLM.
  - Call `/api/select-model` and `/api/orchestrate` to ensure the new provider is reachable via MPC‑API only.

---

## How to Add a New Platform

- **1. Decide integration mode**
  - Preferred: platform calls MPC‑API via HTTP.
  - Avoid: platform calling provider APIs directly.

- **2. Configure base URL**
  - Use `http://mpc-api:3000` inside Docker.
  - Use `http://localhost:3000` from local tools.

- **3. Use the Model Brain endpoints**
  - For single calls: `/api/select-model` + `/api/chat/completions`.
  - For pipelines: `/api/orchestrate` to get a plan, then `/api/chat/completions` or other MPC‑API endpoints per step.

- **4. Update documentation**
  - Add or update a platform‑specific doc under `docs/` describing how the platform calls MPC‑API.
  - Optionally add the platform to `docs/PROVIDER_INTEGRATION_MATRIX.md` if not already present.

---

## Ownership & Change Policy

- **Source of truth**
  - This file is the canonical description of providers and platforms in scope.
  - `docs/MODEL_BRAIN_ARCHITECTURE.md` and `docs/PROVIDER_INTEGRATION_MATRIX.md` should remain consistent with this document.

- **Who updates this file**
  - MPC‑API maintainers and infra leads are	responsible for updating this document when:
    - Providers are added/removed.
    - Platforms are added/removed.
    - Routing or infra patterns change.

- **Change workflow**
  - Update this document first to reflect the intended state.
  - Update LiteLLM configs, model catalog, and orchestration code to match.
  - Finally, update or cross‑link other docs (`README.md`, architecture docs, integration guides).

Keeping this document accurate ensures that all teams (engineering, infra, ops) share a single view of the AI stack.
