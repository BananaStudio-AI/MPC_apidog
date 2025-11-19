# External Platform Integration Guide (MPC-API)

This guide explains how external platforms (Dify, Activepieces, Langflow, LlamaIndex, etc.) must integrate with MPC-API.

All platforms **only** talk to MPC-API.  
No platform calls LiteLLM or provider APIs directly.

> Core flow: **Platform → MPC-API → LiteLLM → Provider**

For full provider/platform details, see:
- [AI Providers & Platform Stack](./AI_PROVIDERS_AND_PLATFORM_STACK.md)
- [Provider & Platform Integration Matrix](./PROVIDER_INTEGRATION_MATRIX.md)
- [MPC-API Model Brain Architecture](./MODEL_BRAIN_ARCHITECTURE.md)

---

## 1. Integration Principles

1. **Single entrypoint:**  
   All model traffic goes through MPC-API, not directly to:
   - OpenAI / Anthropic / Google
   - FAL / Comet / Replicate / HF / DeepInfra
   - Groq / Together / others

2. **Model selection is server-side:**  
   Platforms send **task-level** requests. MPC-API & the Model Catalog decide:
   - which provider  
   - which model  
   - which tier  

3. **Stable APIs for clients:**  
   Platforms talk to:
   - `/api/select-model`
   - `/api/orchestrate`
   - `/api/chat/completions`

   These remain stable even if providers or models behind the scenes change.

---

## 2. Base URLs

### 2.1 Local (host / tools)

From Postman, cURL, or local scripts:

```
http://localhost:3000
```

### 2.2 Inside Docker network

From other containers (Dify, Langflow, etc.):

```
http://mpc-api:3000
```

MPC-API talks to LiteLLM internally at:

```
http://litellm:4000
```

(As defined in `docker-compose.yml`.)

---

## 3. Core MPC-API Endpoints

### 3.1 POST `/api/select-model`

Use this when the platform wants one best model chosen by the Model Brain.

**Input (example):**

```json
{
  "task_type": "chat_general",
  "domain": "general",
  "modality": "text"
}
```

**Output (simplified):**

```json
{
  "selected_model": {
    "canonical_id": "openai-gpt-4o-main",
    "provider_id": "openai/gpt-4o",
    "provider": "openai",
    "aliases": ["text_general_flagship"]
  },
  "candidates": [ /* ranked list */ ]
}
```

The platform then uses the model alias/canonical_id in `/api/chat/completions`.

### 3.2 POST `/api/orchestrate`

Use this when the platform wants a multi-step job plan instead of a single model.

**Input:**

```json
{ "job_type": "tariff_video_overlay" }
```

**Output (simplified):**

```json
{
  "job_type": "tariff_video_overlay",
  "plan": {
    "steps": [
      { "step": "generate_script", "model": "text_tariff_precision" },
      { "step": "layout_overlay_spec", "model": "text_reasoning_flagship" },
      { "step": "render_video", "model": "video_overlay_flagship" }
    ]
  }
}
```

The platform then executes each step by calling `/api/chat/completions` (or another MPC-API endpoint) with the referenced model alias.

### 3.3 POST `/api/chat/completions`

This is the main execution endpoint.

**Input:**

```json
{
  "model": "text_general_flagship",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Write a short script about BananaStudio." }
  ]
}
```

MPC-API:
- Resolves `model` (alias or canonical ID) via `model_catalog.json`.
- Finds the underlying `provider_id` (e.g., `openai/gpt-4o`).
- Calls LiteLLM `/chat/completions` at `http://litellm:4000`.
- Returns the completion response to the platform.

Platforms never see provider keys or raw vendor IDs.

---

## 4. Platform-Specific Patterns

### 4.1 Dify

- Use an HTTP node or “Custom API” configuration.
- Method: `POST`
- URL:  
  - `http://mpc-api:3000/api/chat/completions` (inside Docker)  
  - `http://localhost:3000/api/chat/completions` (from host)
- Headers: `Content-Type: application/json`
- Body: JSON payload with `model` (alias) and `messages`.
- Optional: call `/api/select-model` first and feed the returned alias into the chat call.

### 4.2 Activepieces

- Use the HTTP Request step against `/api/orchestrate`.
- Body: e.g. `{ "job_type": "tariff_video_overlay" }`.
- Loop over `plan.steps`, calling `/api/chat/completions` with `model = step.model`.
- Capture inputs/outputs per step in the flow; provider routing stays server-side.

### 4.3 Langflow

- For an LLM node, set base URL to `http://localhost:3000/api/chat/completions`.
- Provide a model alias (e.g. `text_general_flagship`) in the node configuration.
- Build messages from the Langflow conversation context.
- Optional: add a preceding HTTP node to `/api/select-model` and pass the returned alias to the LLM node.

### 4.4 LlamaIndex

Use a custom LLM wrapper that talks to MPC-API:

```python
import requests
from llama_index.llms.base import LLM

class MPCAPILLM(LLM):
    def chat(self, messages, **kwargs):
        resp = requests.post(
            "http://localhost:3000/api/chat/completions",
            json={"model": "text_general_flagship", "messages": messages},
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
```

LlamaIndex treats this like a standard LLM while MPC-API handles routing.

---

## 5. Error Handling Expectations

### MPC-API → Platform

Platforms should expect standard HTTP errors:

- `400 Bad Request`
  - Unknown model alias
  - Unsupported job type
- `502 Bad Gateway`
  - LiteLLM or provider is unreachable

**Example error payload:**

```json
{ "error": "Unknown model alias: text_general_unknown" }
```

### Platform Responsibilities

- Log errors and present clear messages to users.
- Do **not** bypass MPC-API to call providers directly.
- Treat MPC-API as the single authority for providers, models, and routing.

---

## 6. Configuration Cheatsheet

### Inside Docker

- MPC-API base URL: `http://mpc-api:3000`
- LiteLLM base URL (MPC-API → LiteLLM): `http://litellm:4000`
- Network: `ai-infra-net` (from `docker-compose.yml`)

### Host / Local

- MPC-API: `http://localhost:3000`
- LiteLLM (if testing directly): `http://localhost:4000` (internal use only)

### Files to know

- `mpc-api/model_catalog/model_catalog.json`
- `ai-infra/litellm/config/config.yaml`
- `litellm_config.yaml`
- `docs/AI_PROVIDERS_AND_PLATFORM_STACK.md`
- `docs/PROVIDER_INTEGRATION_MATRIX.md`
- `docs/MODEL_BRAIN_ARCHITECTURE.md`

---

## 7. When Updating This Guide

Update this doc whenever:

- A new platform is added (e.g., Modal, E2B, OpenWebUI, Flowise).
- Integration patterns change.
- Base URLs or network topology change.
- Endpoint contracts or error behavior change.

This guide is the integration contract for any platform that wants to talk to MPC-API.
