# Agent Instructions — MPC-API Model Brain System v1.0 (2025)

## Purpose of the Agent
The agent coordinates creative and automation workflows across the MPC-API stack, ensuring every model invocation routes through MPC-API and LiteLLM. It selects the right models, orchestrates pipelines, and keeps outputs aligned with domain and quality requirements.

## System Overview
- **Local-first architecture:** Services are expected to run inside the local/Docker network; avoid hard-coded external endpoints.
- **Single gateway for model calls:** All model interactions flow through **MPC-API**; no direct provider HTTP calls.
- **LiteLLM as provider interface:** MPC-API delegates provider-specific work to LiteLLM; never bypass it.
- **Supported services:** Integrations may involve Dify, Langflow, Activepieces, or external scripts, but routing still uses MPC-API → LiteLLM.

## Core Endpoints and When to Use Them
- `GET /health`
  - Purpose: Basic connectivity and readiness checks.
- `POST /api/select-model`
  - Input: `task_type`, `domain`, `modality`.
  - Behavior: Filters the catalog and returns the best model for the requested quality tier.
  - Use when a single best model is needed for a task.
- `POST /api/orchestrate`
  - Input: `job_type` (e.g., `"tariff_video_overlay"`).
  - Output: Multi-step plan (e.g., `generate_text`, `layout_overlay_spec`, `render_video`).
  - Use for end-to-end pipelines requiring multiple models.
- `POST /api/chat/completions`
  - Input: `model` (alias or `canonical_id`), `messages[]`.
  - Behavior: Resolves aliases via the catalog, proxies to LiteLLM, and returns chat completions.
  - Use for all LLM-style text operations.

## Model Catalog and Model Brain
- **Location:** `mpc-api/model_catalog/model_catalog.json`.
- **Schema concepts:** `canonical_id`, `provider_id`, `modality`, `tasks`, `domains`, `quality_tier`.
- **Quality tiers:**
  - *Flagship* — Highest quality; prefer when stakes are high or outputs must be polished.
  - *Strong* — Reliable general-purpose choice; balance of quality and efficiency.
  - *Draft* — Fast, lower-cost; suitable for iterative drafts or quick checks.
- **Domain guidance:**
  - General reasoning defaults to general-domain text models.
  - Tariffs/legal or compliance work favors domain-specific models.
  - Creative/storytelling may allow more open-ended models but still route via catalog.
- **Modality guidance:**
  - Video/image tasks must select matching modality models.
  - Text-only tasks should avoid image/video models unless orchestration requires them.

## Routing Rules for the Agent
- Infer `task_type`, `domain`, and `modality` from user intent before selecting models.
- Use **`/api/select-model`** when you need a single best model for a scoped task.
- Use **`/api/orchestrate`** when the request implies a pipeline or predefined `job_type`.
- Iterate as needed: evaluate outputs, adjust `task_type`/`domain`/`modality`, and re-run selection or orchestration if quality is insufficient.
- **Hard rule:** Never call provider APIs (OpenAI, Anthropic, FAL, Comet, etc.) directly. Always route through MPC-API → LiteLLM.
- Do not hard-code provider URLs; rely on environment configuration for MPC-API and LiteLLM endpoints.

## Examples
- **Generate a tariff-safe script and overlay it on video:** Call `/api/orchestrate` with `job_type="tariff_video_overlay"` to obtain the full plan.
- **Choose best model for long-form reasoning:** Call `/api/select-model` with `task_type="reasoning"`, `domain="general"`, `modality="text"`.
- **Run a single-shot completion using a specific alias:** Call `/api/chat/completions` with `model` set to that alias and pass the conversation in `messages[]`.

## Anti-Patterns (What the Agent Must NOT Do)
- Do not call Apidog, legacy cloud endpoints, or Codespaces URLs.
- Do not call provider APIs directly; always use MPC-API → LiteLLM.
- Do not hard-code provider URLs; prefer `LITELLM_BASE_URL` or the configured MPC-API base URL.

## Network Model
- **Inside Docker network:** `http://mpc-api:3000/...`
- **From host/dev tools:** `http://localhost:3000/...`
