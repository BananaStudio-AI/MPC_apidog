# Contributing to BananaStudio MPC-API

Thanks for considering contributing to the MPC-API / API Hub stack.

This document explains how we work on this repo and what we expect from changes.

---

## 1. Code of Conduct

- Be respectful and constructive.
- Assume positive intent.
- Prefer clear, technical communication.

---

## 2. Branching & PRs

- Fork or create a feature branch from `main`.
- Use descriptive branch names, e.g.:
  - `feat/add-groq-support`
  - `fix/orchestrate-null-job-type`
  - `docs/stack-overview`

Before opening a PR:

- Rebase on latest `main`.
- Run tests locally.
- Update docs if behavior changes.

---

## 3. Tests

For changes in `mpc-api`:

```bash
cd mpc-api
npm test
```

Add or update tests under:

- `mpc-api/tests/`

We prefer that new behavior is covered by at least one test.

---

## 4. Documentation Expectations

If you **add or remove a provider**, update:

- `docs/AI_PROVIDERS_AND_PLATFORM_STACK.md`
- `docs/PROVIDER_INTEGRATION_MATRIX.md`
- `mpc-api/model_catalog/model_catalog.json`
- `ai-infra/litellm/config/config.yaml` (if needed)

If you **add or remove a platform**, update:

- `docs/AI_PROVIDERS_AND_PLATFORM_STACK.md`
- `docs/EXTERNAL_PLATFORM_INTEGRATION.md`
- Any platform-specific docs under `docs/`

If you **change routing or orchestration behavior**, update:

- `docs/MODEL_BRAIN_ARCHITECTURE.md`
- `docs/STACK_OVERVIEW.md`

---

## 5. Commit & PR Style

**Commits**

- Use concise messages, e.g.:
  - `feat: add together.ai provider`
  - `fix: handle missing domain in select-model`
  - `docs: update stack overview`

**PRs**

Include:

- Summary of what changed
- Files touched
- Any migration steps
- How you tested it

---

## 6. Coding Guidelines

- TypeScript for MPC-API code (strict or near-strict mode).
- Prefer small, composable functions.
- Avoid hard-coding provider IDs in routes; rely on catalog and config.
- Keep environment-specific logic out of core business logic.

---

## 7. Adding a New Provider (High-Level)

1. Add provider models to the LiteLLM config.
2. Add provider models to `model_catalog.json`.
3. Add tests for selection/orchestration if needed.
4. Update provider docs and the integration matrix.
5. Run tests and open a PR.

---

## 8. Security & Secrets

- Never commit API keys or secrets.
- Use `.env` files and environment variables locally.
- Use GitHub Actions secrets for CI.
- Assume MPC-API may be internet-facing; treat inputs as untrusted.

---

## 9. Questions

If you’re unsure:

- Add a question in the PR description.
- Propose a small design sketch in markdown.
- Keep changes small and reviewable.
