# BananaStudio MPC-API Stack Overview

## Purpose

This document gives a top-down overview of the MPC-API + LiteLLM stack and how it connects to external platforms and providers. It is the quickest way for a new engineer to understand:

- What services exist
- How traffic flows between them
- Where to change configs when adding providers or platforms

For detailed providers and platforms, see:

- [AI Providers & Platform Stack](./AI_PROVIDERS_AND_PLATFORM_STACK.md)
- [Provider & Platform Integration Matrix](./PROVIDER_INTEGRATION_MATRIX.md)
- [MPC-API Model Brain Architecture](./MODEL_BRAIN_ARCHITECTURE.md)

---

## 1. High-Level Flow

```text
Client / Platform (Dify, Langflow, Activepieces, Scripts)
                     |
                     v
                  MPC-API
         (select-model / orchestrate / chat)
                     |
                     v
                  LiteLLM
                     |
                     v
   Model Providers (OpenAI, Anthropic, FAL, Comet, HF, DeepInfra, etc.)
```

Key rules:

- No platform or client calls providers directly.
- All calls go: Client → MPC-API → LiteLLM → Provider.
- Model choice is driven by the model catalog and routing rules, not by client-side provider IDs.

## 2. Components and Responsibilities

### MPC-API
- **Role:** Gateway, orchestration engine, and catalog source of truth.
- **Code:** `mpc-api/`
- **Endpoints:** `/health`, `/api/select-model`, `/api/orchestrate`, `/api/chat/completions`
- **Model Catalog:** `mpc-api/model_catalog/model_catalog.json`
- **Logic:** hosts the Model Brain (tiering, tasks, modality, provider fallback).

### LiteLLM Gateway
- Only component that calls providers directly.
- **Config:** `ai-infra/litellm/config/config.yaml` (Docker), `litellm_config.yaml` (legacy host mode).
- **Requirements:**
  - Model IDs in LiteLLM MUST match `provider_id` fields in the model catalog.
  - API keys come from environment variables.
- **Handles:** retries, monitoring, provider routing, vendor unification.

### Model Providers
Included providers:

- OpenAI
- Anthropic
- Google Gemini
- Comet API
- FAL
- Replicate
- HuggingFace Inference
- DeepInfra
- GroqCloud
- Together.ai
- Pika Labs
- RunwayML
- HeyGen
- ElevenLabs

Each provider is normalized in the model catalog with canonical ID, `provider_id`, modality, domains, tasks, tiers, capability flags, and aliases.

### Platform Layer (External Systems)
Platforms that consume MPC-API, never providers.

**Core:**
- Dify — apps, agents, workflows
- Langflow — flow builder
- Activepieces — automation
- LlamaIndex — RAG + vector pipelines
- MPC-API — direct SDK/API usage
- LiteLLM — backend vendor abstraction

**Optional Enhancers:**
- OpenWebUI
- Flowise
- Modal
- E2B

These platforms must send all model calls through MPC-API, not LiteLLM or providers.

## 3. Detailed Flow Explanation

### A. Client → MPC-API
Clients send high-level tasks, not provider model names.

Example request:

```json
{ "task": "chat_general", "messages": [...] }
```

Or RAG:

```json
{ "task": "rag_rewrite", "input": "..." }
```

### B. MPC-API → Model Catalog
The Model Brain resolves modality, domains, tiers (flagship/strong/draft), performance (speed tier), provider constraints, and fallbacks. This yields one model (`/api/select-model`) or multi-step plans (`/api/orchestrate`).

### C. MPC-API → LiteLLM
MPC-API sends a provider-agnostic payload:

```json
{
  "model": "openai/gpt-4o",
  "messages": [...]
}
```

LiteLLM translates this into the vendor-specific API call.

### D. LiteLLM → Provider
LiteLLM forwards requests to the correct vendor (OpenAI, Anthropic, Google, FAL, Replicate, etc.) and handles retries, errors, rate limits, and provider differences.

## 4. Where to Change What

### When Adding a Provider
- Update LiteLLM config (`model_list`).
- Add metadata to `model_catalog.json`.
- Extend orchestration aliases if needed.
- Validate via `/api/select-model` and `/api/orchestrate`.

### When Adding a Platform
- Configure base URLs: `http://localhost:3000` (host) or `http://mpc-api:3000` (Docker).
- Use `/api/select-model` and `/api/chat/completions`.
- Document the integration in `docs/` and update the integration matrix if needed.

## 5. File Map for Fast Navigation

```
root/
  README.md
  docker-compose.yml
  litellm_config.yaml

ai-infra/
  litellm/config/config.yaml

mpc-api/
  src/
  routes/
  model_catalog/model_catalog.json
  tests/

docs/
  STACK_OVERVIEW.md            ← you are here
  AI_PROVIDERS_AND_PLATFORM_STACK.md
  PROVIDER_INTEGRATION_MATRIX.md
  MODEL_BRAIN_ARCHITECTURE.md
  API_HUB_README.md
  ARCHITECTURE.md
```

## 6. Ownership

- **MPC-API maintainers** own the model catalog, provider metadata, orchestration logic, and these docs.
- **LiteLLM config owners** maintain provider ID mappings and YAML configs.
- **Platform integrators** must follow HTTP-only integration patterns into MPC-API.

This file is the anchor overview for anyone working on BananaStudio’s AI infrastructure.
