# Provider & Platform Integration Matrix

## Overview

MPC-API and LiteLLM act as a unified gateway for multiple model providers. All model traffic flows through MPC-API → LiteLLM before reaching any vendor endpoint. Comet **API** is treated as a model provider; Comet **Opik** is an optional evaluation/observability platform and is never used for inference.

## Provider Matrix

| Provider                      | Type                                | Modalities                          | Typical Use Cases                                    | Routed Via              | Status   |
| ----------------------------- | ----------------------------------- | ----------------------------------- | ---------------------------------------------------- | ----------------------- | -------- |
| OpenAI                        | LLM / Multi-modal                   | text, image, audio, vision          | reasoning, chat, multimodal prompts                  | LiteLLM via MPC-API     | Enabled  |
| Anthropic                     | LLM / Multi-modal                   | text, image                         | reasoning, safety-sensitive chat                     | LiteLLM via MPC-API     | Enabled  |
| Google (Gemini, Veo)          | LLM / Multi-modal / Video (where supported) | text, image, video, audio          | multimodal reasoning, creative video/image           | LiteLLM via MPC-API     | Planned  |
| Mistral                       | LLM                                  | text                                | fast general text, reasoning                         | LiteLLM via MPC-API     | Planned  |
| Groq                          | LLM (accelerated)                    | text                                | ultra-low-latency chat/completions                   | LiteLLM via MPC-API     | Planned  |
| OpenRouter (aggregator)       | Aggregator                           | text (varies)                       | multi-provider routing via a single endpoint         | LiteLLM via MPC-API     | Planned  |
| Comet API                     | LLM / Creative                       | text, image                         | tariff-safe text, creative generation                | LiteLLM via MPC-API     | Planned  |
| FAL.ai                        | Creative / Image / Video             | image, video                        | image/video generation, overlays                     | LiteLLM via MPC-API     | Planned  |
| Replicate                     | Creative / Multi-modal               | text, image, audio, video (model-dependent) | creative models, diffusion pipelines         | LiteLLM via MPC-API     | Planned  |
| HF Inference API              | LLM / Multi-modal                    | text, image, audio                  | OSS model serving, embeddings                        | LiteLLM via MPC-API     | Planned  |
| DeepInfra                     | LLM / Multi-modal                    | text, image                         | hosted OSS models, cost/latency optimization         | LiteLLM via MPC-API     | Planned  |
| Together.ai                   | LLM / Multi-modal                    | text, image                         | cost-aware OSS/partner models                        | LiteLLM via MPC-API     | Planned  |
| Custom / Other HTTP providers | Catch-all                            | varies                              | bespoke internal or vendor-specific endpoints        | LiteLLM via MPC-API     | Optional |

## Infra / Platform Matrix

| Component            | Role                                     | How it connects                                       | Status   |
| -------------------- | ---------------------------------------- | ------------------------------------------------------ | -------- |
| MPC-API              | Gateway + orchestration + catalog        | Exposes HTTP endpoints; calls LiteLLM for inference    | Core     |
| LiteLLM              | Provider abstraction/proxy               | Receives requests from MPC-API; dispatches to vendors  | Core     |
| Dify                 | Apps/agents/workflows                    | Calls MPC-API HTTP endpoints                           | Planned  |
| Langflow             | Visual flow builder                      | Calls MPC-API HTTP endpoints                           | Planned  |
| ActivePieces         | Automation/triggers                      | Calls MPC-API HTTP endpoints                           | Planned  |
| LlamaIndex           | RAG and vector pipelines                 | Invokes MPC-API for model calls                        | Planned  |
| Portkey Gateway      | Optional policy/observability front-door | Wraps LiteLLM/providers if enabled                     | Optional |
| Comet Opik           | Eval/telemetry (non-inference)           | Receives logs/evals; not called for inference          | Optional |
| Docker Desktop + WSL | Local runtime stack                      | Hosts MPC-API + LiteLLM containers                     | Core     |

## Routing Notes

- All providers, regardless of vendor, are accessed via LiteLLM and mediated by MPC-API.
- Comet Opik is **never** used for inference; it is only optional for logging/evaluation.
- Future providers (including video-first or domain-specific services) will be added here as they are onboarded.

## Example LiteLLM Config Snippet (non-secret)

```yaml
model_list:
  - model_name: openai/gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: "{{OPENAI_API_KEY}}"

  - model_name: anthropic/claude-3-sonnet
    litellm_params:
      model: anthropic/claude-3-sonnet-20241022
      api_key: "{{ANTHROPIC_API_KEY}}"

  - model_name: google/gemini-1.5-pro
    litellm_params:
      model: google/gemini-1.5-pro
      api_key: "{{GOOGLE_API_KEY}}"

  - model_name: comet/gpt-4o-mini
    litellm_params:
      model: comet/gpt-4o-mini
      api_key: "{{COMET_API_KEY}}"

  - model_name: fal/image-gen
    litellm_params:
      model: fal/image-gen
      api_key: "{{FAL_API_KEY}}"

  - model_name: replicate/sdxl
    litellm_params:
      model: replicate/sdxl
      api_key: "{{REPLICATE_API_KEY}}"

  - model_name: hf/meta-llama-3
    litellm_params:
      model: hf/meta-llama-3
      api_key: "{{HF_INFERENCE_API_KEY}}"

  - model_name: deepinfra/llama-3
    litellm_params:
      model: deepinfra/llama-3
      api_key: "{{DEEPINFRA_API_KEY}}"
```

> Notes:
> - All API keys are provided via environment variables; never commit secrets.
> - Add/remove providers as needed; keep model names aligned with the catalog.

## Future Work

- Enable and validate each provider in the LiteLLM config.
- Add per-provider entries to `model_catalog.json` (including aliases and quality tiers).
- Connect observability (Comet Opik, Portkey, etc.) once core routing is stable.
