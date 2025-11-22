# Platform Integration Plan — MPC-API Model Brain

## Overview

This document describes the planned, staged integration of external platforms with the MPC-API Model Brain and LiteLLM gateway. The goal is to:

- Keep all provider traffic flowing via:  
  `Client / Platform → MPC-API → LiteLLM → Provider`.
- Prioritize integrations that deliver the most value and feedback first.
- Give agents a clear, repeatable pattern for wiring new platforms.

Assumptions:

- MPC-API is reachable at `http://localhost:3000` (host) or `http://mpc-api:3000` (inside Docker).
- LiteLLM is reachable at `http://litellm:4000` from MPC-API and other containers.
- Authentication to LiteLLM uses virtual keys (e.g. `sk-...`) managed via `LiteLLM_VerificationToken`.

---

## Integration Order (High-Level)

1. **Dify (apps/agents/workflows)**
2. **Langflow (visual flow builder)**
3. **Activepieces / n8n / Make (automation)**
4. **LlamaIndex / RAG stack**
5. **Observability / policy (Portkey, Comet Opik)**
6. **Creative/voice platforms (Pika, Runway, HeyGen, ElevenLabs)**

Each stage must preserve the rule: no platform calls provider APIs directly; all model calls route via MPC-API → LiteLLM.

---

## 1. Dify Integration

**Goal:** Use Dify as a GUI front-end for the Model Brain: chat apps, agents, and workflows backed by MPC-API.

**Pattern:**

- **Base URL:**  
  - From Dify: `http://localhost:3000` (host) or `http://mpc-api:3000` (Docker).
- **Endpoints:**  
  - Model selection: `POST /api/select-model`  
    - Inputs: `task_type`, `domain`, `modality`.  
    - Output: `selected_model` + `candidates`.  
  - Completions: `POST /api/chat/completions`  
    - Inputs: `model` (alias or `canonical_id`), `messages[]`, optional params (e.g. `temperature`).  
- **Usage:**  
  - For a Dify LLM tool:  
    1. Optionally call `/api/select-model` first to choose the best model.  
    2. Call `/api/chat/completions` with the chosen `model` and the conversation.  

**Action items:**

- Define one or more Dify HTTP tools that call `/api/select-model` and `/api/chat/completions`.
- Document a simple example flow (e.g. “tariff-safe copywriter”) that uses these endpoints.

---

## 2. Langflow Integration

**Goal:** Let users visually compose multi-step flows that leverage MPC-API orchestration.

**Pattern:**

- **Base URL:** `http://mpc-api:3000` (from within Docker).
- **Endpoints:**  
  - Orchestration: `POST /api/orchestrate`  
    - Input: `job_type` (e.g. `"tariff_video_overlay"`).  
    - Output: `plan.steps[]` with `step` + `model` (aliases).  
  - Completions: `POST /api/chat/completions` for each step.  
- **Usage:**  
  - Create Langflow HTTP blocks:  
    - First block: call `/api/orchestrate` with the chosen `job_type`.  
    - Downstream blocks: iterate through `plan.steps` and call `/api/chat/completions` per step with the provided `model` alias.  

**Action items:**

- Define a Langflow template that fetches an orchestration plan and executes each step.
- Document at least one example (e.g. “tariff video overlay” pipeline).

---

## 3. Activepieces / n8n / Make (Automation)

**Goal:** Connect MPC-API into broader automation: triggers, CRMs, webhooks, batch jobs.

**Pattern:**

- **Base URL:** `http://localhost:3000` or `http://mpc-api:3000`.
- **Endpoints:**  
  - `POST /api/select-model`  
  - `POST /api/chat/completions`  
  - Optionally `POST /api/orchestrate` for job-type workflows.  
- **Usage:**  
  - Simple automation: Trigger → `/api/select-model` → `/api/chat/completions`.  
  - Complex automation: Trigger → `/api/orchestrate` → loop over steps → `/api/chat/completions` per step → forward outputs downstream.  

**Action items:**

- Create reusable “MPC-API” HTTP actions or connectors in your automation tool of choice.
- Capture one end-to-end example (e.g. “auto-generate and log creative briefs”).

---

## 4. LlamaIndex / RAG Stack

**Goal:** Use MPC-API as the LLM endpoint behind retrieval-augmented generation pipelines.

**Pattern:**

- Configure LlamaIndex to use a custom LLM that calls MPC-API’s `/api/chat/completions` instead of provider SDKs.
- Ensure the `model` parameter maps to aliases or `canonical_id` values present in `model_catalog.json`.

**Action items:**

- Implement a minimal LlamaIndex LLM wrapper that POSTs to `/api/chat/completions`.
- Document which aliases are recommended for RAG (e.g. reasoning-focused models).

---

## 5. Observability and Policy (Portkey, Comet Opik)

**Goal:** Add monitoring, policy, and evaluation once traffic is meaningful.

**Pattern:**

- **Portkey:**  
  - Either sits in front of providers (via LiteLLM config) or in front of MPC-API for global policy.  
- **Comet Opik:**  
  - Collects traces, metrics, and evaluation data from MPC-API calls.  

**Action items:**

- Decide whether to introduce Portkey at the provider level (through LiteLLM) or as a gateway in front of MPC-API.
- Add basic Comet Opik logging for key MPC-API flows.

---

## 6. Creative / Voice Platforms (Pika, Runway, HeyGen, ElevenLabs)

**Goal:** Tie rich media generation and voice into MPC-API-driven text/orchestration.

**Pattern:**

- Use MPC-API + LiteLLM for text/plan generation (scripts, prompts, specs).
- Call creative/voice providers from automation tools or backend services, using the outputs from MPC-API.

**Action items:**

- Define at least one canonical pipeline (e.g. “script → voiceover → avatar video”) with clear MPC-API touchpoints.
- Document provider-specific constraints and how they’re invoked in the context of MPC-API.

---

## Agent Instructions

Agents operating in this repository MUST follow these rules when working with the platform integration plan:

- Treat this document as the authoritative sequence for adding platforms; do not skip ahead unless explicitly instructed by a human.
- When executing tasks derived from this plan:
  - Use MPC-API endpoints (`/api/select-model`, `/api/orchestrate`, `/api/chat/completions`) as the only way to talk to models.
  - Never call provider APIs (OpenAI, Anthropic, etc.) directly; always route via MPC-API → LiteLLM.
- When you complete all work items you were assigned from this plan:
  - Explicitly mark all jobs as **complete** in your own task tracking or summary.
  - Then **draft a small set of next tasks** (3–5 concise items) that logically follow from the work done (e.g. “add Dify example flow”, “add Langflow template”, “document RAG defaults”).
  - Present those next tasks as suggestions, not commitments, for a human to approve.

This ensures the integration work proceeds in a controlled, well-documented sequence, and that agents hand off cleanly with clear “next steps” instead of stopping silently.
