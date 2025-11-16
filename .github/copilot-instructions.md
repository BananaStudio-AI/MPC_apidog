# BananaStudio API Hub – Copilot Instructions

These instructions make an AI coding agent immediately productive in this repo. Focus on MCP-first workflows, OpenAPI/OAS handling, model registry operations, and generated clients. Keep edits surgical and never invent API shapes.

## Core Principles
1. MCP-first: Use Apidog MCP tools (never hardcode REST URLs). Discover endpoints & schemas via tools (e.g. list tools → read project OAS → derive operations).
2. Single unified spec: `openapi/api-hub.oas.json` drives client generation and registry sync.
3. Deterministic artifacts: Track normalized specs (`openapi/*`), clients (`apis/*`), and registries (`data/model_registry.json`). Ignore `apidog/generated/`.
4. Patch discipline: Use structured diffs; avoid broad refactors without confirmation.
5. Environment-gated actions: Require `APIDOG_ACCESS_TOKEN` (+ optionally `APIDOG_PROJECT_ID`) before any pull/push/spec sync.

## Directory Landmarks
- `apidog/scripts/` MCP automation (pull endpoints, push specs, list tools, validate).
- `openapi/` Tracked OAS variants (raw, merged, versioned backups, unified hub spec).
- `apis/api-hub-client/` Generated TS client (fetch-based). Regenerate, don’t hand edit.
- `data/model_registry.json` Unified model catalog (Comet + FAL).
- `scripts/` Project-level utilities: sync catalog, normalize OAS, pricing estimates.
- `agents/` Custom agent definitions (YAML frontmatter) – reference actual repo path (not `.github/agents`).

## Key npm Scripts (from `package.json`)
- Pull remote OAS: `npm run apidog:pull` → `apidog/generated/oas_raw.json`.
- Sync tracked copy: `npm run oas:sync` → copies into `openapi/`.
- Merge/push (OAS dry-run): `npm run apidog:push:oas` (add `-- --force` to write `apidog/generated/oas_merged.json`).
- Generate TS client: `npm run generate:api-hub-client` (uses `openapi/api-hub.oas.json`).
- Validate spec (3.0.3 rules): `npm run validate:oas`.
- Sync model catalog: `npm run sync:model-catalog` or create registry: `npm run sync:model-registry`.
- Pricing estimate (FAL): `npm run fal:estimate`.
- Health check hub: `npm run health:api-hub`.

## Typical OAS Update Flow
```bash
export APIDOG_ACCESS_TOKEN=...  # ensure token
npm run apidog:pull      # fetch remote spec → generated/
npm run oas:sync         # copy raw into openapi/
node scripts/normalize_api_hub_oas.mjs  # if normalization needed
npm run validate:oas     # confirm integrity
git add openapi/ && git commit -m "chore: update OAS"
```

## Editing / Adding Endpoints
1. Modify JSON specs in `apidog/api_specs/`.
2. Run `npm run apidog:push:oas -- --force` to produce merged OAS.
3. `npm run oas:sync` then commit merged file.
4. (Optional) Import merged spec into Apidog UI or use `npm run apidog:push:api` if write access supported.

## Generated Client Usage
Regenerate instead of manual edits:
```bash
npm run generate:api-hub-client
```
Use from scripts:
```typescript
import { ApiClient } from '../apis/api-hub-client';
const client = new ApiClient({ baseUrl: 'https://api-hub.local' }); // baseUrl resolved via MCP in production
```

## Model Registry Pattern
`data/model_registry.json` is appended/updated via sync scripts. Access via service helpers (see `apis/model_registry/service.ts`). Never mutate in-place manually—rerun sync.

## Conventions & Constraints
- ES Modules only (`type: module`). Use `.mjs` or `tsx` for TS execution.
- Do not invent endpoint parameters—derive from MCP tool metadata or OAS contents.
- Keep new automation scripts side-effect free unless explicitly named (e.g. `sync:*`).
- Token checks first: call `npm run apidog:auth-check` before debugging endpoint failures.
- Large changes (schema restructuring, bulk endpoint rewrites) require confirmation before patch.

## Safe Extension Guidelines
- Add new sync scripts under `scripts/` (not `apidog/scripts/`) when they operate on tracked artifacts rather than raw MCP extraction.
- Reuse validation steps (`npm run validate:oas`) after spec manipulations.
- Keep output paths consistent; never relocate `openapi/api-hub.oas.json`.

## Troubleshooting Quick Wins
- 403 errors: token likely account-level; regenerate team/workspace token.
- Missing models: rerun catalog sync after OAS refresh.
- Client type mismatches: regenerate client (do not hand edit types).

## When Unsure
List MCP tools: `npm run apidog:list-tools` then inspect returned tool schemas to drive implementation instead of guessing.

Maintain determinism, avoid speculative refactors, and anchor all API logic to MCP-discovered definitions.
