#!/usr/bin/env node
/*
 Validate endpoint specs in apidog/api_specs/.
 - Supports two formats:
   1) Client ApiEndpoint (headers/queryParams/requestBody/responses) from client.d.ts
   2) Internal Endpoint from types/apidog.d.ts (converted via adapters to ApiEndpoint)
 - Exits with code 1 if any invalid files are found.
*/
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';

async function toApiEndpointMaybe(obj) {
  // Heuristic: ApiEndpoint has headers/queryParams arrays; Internal has query/headers
  const looksLikeApi = Array.isArray(obj?.headers) && Array.isArray(obj?.queryParams);
  if (looksLikeApi) return obj;
  try {
    const { toApiEndpoint } = await import('./lib/adapters.js');
    return toApiEndpoint(obj);
  } catch (e) {
    return obj; // fall back, validate generically
  }
}

function validateApiEndpoint(ep) {
  const errors = [];
  const warn = [];
  const isString = (v) => typeof v === 'string' && v.length > 0;
  if (!isString(ep.id)) errors.push('missing or empty id');
  if (!isString(ep.name)) errors.push('missing or empty name');
  if (!isString(ep.method)) errors.push('missing or empty method');
  if (!isString(ep.path)) errors.push('missing or empty path');
  if (isString(ep.method) && ep.method !== ep.method.toUpperCase()) warn.push('method not uppercase');
  if (isString(ep.path) && !ep.path.startsWith('/')) warn.push('path does not start with /');
  if (!Array.isArray(ep.headers)) errors.push('headers must be an array');
  if (!Array.isArray(ep.queryParams)) errors.push('queryParams must be an array');
  if (ep.responses && typeof ep.responses !== 'object') errors.push('responses must be an object');
  return { errors, warn };
}

async function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const root = process.cwd();
  const dir = path.resolve(root, 'apidog', 'api_specs');
  if (!fssync.existsSync(dir)) {
    const msg = `Directory not found: ${dir}`;
    if (asJson) {
      console.log(JSON.stringify({ ok: false, error: msg }));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }
  const files = await fs.readdir(dir);
  let invalid = 0;
  let warnings = 0;
  let total = 0;
  const results = [];
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    total++;
    const fp = path.join(dir, f);
    try {
      const raw = await fs.readFile(fp, 'utf8');
      const obj = JSON.parse(raw);
      const api = await toApiEndpointMaybe(obj);
      const { errors, warn } = validateApiEndpoint(api);
      if (errors.length > 0) {
        invalid++;
        results.push({ file: f, ok: false, errors, warnings: warn });
        if (!asJson) {
          console.error(`❌ ${f}:`);
          for (const e of errors) console.error(`   - ${e}`);
        }
      } else {
        results.push({ file: f, ok: true, errors: [], warnings: warn });
        if (warn.length > 0 && !asJson) {
          warnings += warn.length;
          console.warn(`⚠️  ${f}:`);
          for (const w of warn) console.warn(`   - ${w}`);
        } else if (!asJson) {
          console.log(`✔ ${f}`);
        }
      }
    } catch (e) {
      invalid++;
      const msg = 'invalid JSON or read error';
      results.push({ file: f, ok: false, errors: [msg], warnings: [] });
      if (!asJson) console.error(`❌ ${f}: ${msg}`);
    }
  }
  if (asJson) {
    const summary = { total, invalid, warnings, ok: invalid === 0, results };
    console.log(JSON.stringify(summary, null, 2));
    process.exit(invalid > 0 ? 1 : 0);
  } else {
    if (invalid > 0) {
      console.error(`\nSummary: ${total} files, ${invalid} invalid, ${warnings} warnings`);
      process.exit(1);
    } else {
      console.log(`\nSummary: ${total} files, all valid, ${warnings} warnings`);
    }
  }
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
