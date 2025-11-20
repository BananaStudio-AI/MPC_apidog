# MPC-API Architecture Diagrams

These diagrams visualise the MPC-API + LiteLLM + provider stack and the relation to external platforms.

---

## 1. High-Level System

```mermaid
flowchart LR
  subgraph Clients / Platforms
    A[Dify]
    B[Langflow]
    C[Activepieces]
    D[LlamaIndex]
    E[Scripts/Tools]
  end

  subgraph Core Stack
    F[MPC-API]
    G[LiteLLM Gateway]
  end

  subgraph Providers
    H[OpenAI]
    I[Anthropic]
    J[Google Gemini]
    K[Comet API]
    L[FAL]
    M[Replicate]
    N[HF Inference]
    O[DeepInfra]
    P[Groq]
    Q[Together.ai]
  end

  A --> F
  B --> F
  C --> F
  D --> F
  E --> F

  F --> G
  G --> H
  G --> I
  G --> J
  G --> K
  G --> L
  G --> M
  G --> N
  G --> O
  G --> P
  G --> Q
```

## 2. Internal MPC-API Flow

```mermaid
flowchart TD
  A[Incoming Request] --> B[Route Handler]
  B --> C[Model Brain: Task Analysis]
  C --> D[Model Catalog Lookup]
  D --> E[Selected Model / Plan]
  E --> F[LiteLLM Client]
  F --> G[LiteLLM Server]
  G --> H[Provider API]

  H --> G
  G --> F
  F --> I[Response Adapter]
  I --> J[HTTP Response]
```

## 3. Files & Ownership

```mermaid
flowchart LR
  A[docs/AI_PROVIDERS_AND_PLATFORM_STACK.md] --> B[docs/PROVIDER_INTEGRATION_MATRIX.md]
  A --> C[docs/STACK_OVERVIEW.md]
  A --> D[mpc-api/model_catalog/model_catalog.json]
  D --> E[mpc-api/src/routes/*]
  A --> F[ai-infra/litellm/config/config.yaml]
```

Use these as reference when editing architecture or explaining the stack to new team members.
