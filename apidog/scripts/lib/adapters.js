/*
  Adapters between internal Apidog types (Endpoint/Module) and client-facing API types.
  JSDoc typedefs reference declaration files for editor intellisense.
*/

/**
 * @typedef {import('../../types/apidog.d.ts').Endpoint} Endpoint
 * @typedef {import('../../types/apidog.d.ts').Module} Module
 * @typedef {import('../../types/client.d.ts').ApiEndpoint} ApiEndpoint
 * @typedef {import('../../types/client.d.ts').ApiModule} ApiModule
 * @typedef {import('../../types/client.d.ts').ApiParameter} ApiParameter
 */

/**
 * @param {any} schema
 * @returns {string}
 */
function schemaToType(schema) {
  if (!schema || typeof schema !== 'object') return 'unknown';
  if (typeof schema.type === 'string') return schema.type;
  if (schema.$ref) return String(schema.$ref);
  if (schema.format && schema.type) return `${schema.type}:${schema.format}`;
  return 'object';
}

/**
 * @param {Endpoint} ep
 * @returns {ApiEndpoint}
 */
export function toApiEndpoint(ep) {
  const id = ep.id || `${(ep.method || '').toUpperCase()}-${ep.path || ''}`.replace(/[^a-z0-9-_]/gi, '_');
  const headers = Array.isArray(ep.headers)
    ? ep.headers.map((h) => ({
        name: h.name,
        type: schemaToType(h.schema),
        required: Boolean(h.required),
        description: h.description,
      }))
    : [];
  const queryParams = Array.isArray(ep.query)
    ? ep.query.map((q) => ({
        name: q.name,
        type: schemaToType(q.schema),
        required: Boolean(q.required),
        description: q.description,
      }))
    : [];
  return {
    id,
    name: ep.name || id,
    description: ep.description || ep.summary || '',
    method: String(ep.method || '').toUpperCase(),
    path: ep.path || '',
    headers,
    queryParams,
    requestBody: ep.requestBody || null,
    responses: ep.responses || {},
  };
}

/**
 * @param {ApiEndpoint} api
 * @returns {Endpoint}
 */
export function toEndpoint(api) {
  /** @type {Endpoint} */
  const out = {
    id: api.id,
    name: api.name,
    description: api.description,
    method: String(api.method || '').toUpperCase(),
    path: api.path,
    headers: (api.headers || []).map((p) => ({
      name: p.name,
      required: Boolean(p.required),
      description: p.description,
      schema: { type: p.type },
    })),
    query: (api.queryParams || []).map((p) => ({
      name: p.name,
      required: Boolean(p.required),
      description: p.description,
      schema: { type: p.type },
    })),
    requestBody: api.requestBody,
    responses: api.responses,
  };
  return out;
}

/**
 * @param {Module} mod
 * @returns {ApiModule}
 */
export function toApiModule(mod) {
  const endpoints = Array.isArray(mod.folder?.endpoints)
    ? mod.folder.endpoints.map((ep) => toApiEndpoint(ep))
    : [];
  return {
    id: mod.name,
    name: mod.name,
    description: mod.description || '',
    endpoints,
  };
}

/**
 * @param {ApiModule} apiMod
 * @returns {Module}
 */
export function toModule(apiMod) {
  return {
    name: apiMod.name,
    description: apiMod.description,
    folder: {
      name: apiMod.name,
      endpoints: Array.isArray(apiMod.endpoints) ? apiMod.endpoints.map((e) => toEndpoint(e)) : [],
    },
  };
}
