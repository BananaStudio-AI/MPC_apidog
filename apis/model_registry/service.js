import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_PATH = path.join(__dirname, '../../data/model_registry.json');
let cachedRegistry = null;
/**
 * Load the unified model registry from data/model_registry.json
 * @returns Array of UnifiedModelRecord
 * @throws Error if file is missing or invalid JSON
 */
export async function loadRegistry() {
    try {
        const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
        const data = JSON.parse(content);
        if (!Array.isArray(data)) {
            throw new Error('Registry data is not an array');
        }
        cachedRegistry = data;
        return [...data]; // Return a copy to prevent mutation
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`Model registry not found at ${REGISTRY_PATH}. Run 'npm run sync:model-registry' to create it.`);
        }
        throw new Error(`Failed to load model registry: ${err.message}`);
    }
}
/**
 * Find models by source provider
 * @param source Either "comet" or "fal"
 * @returns Filtered array of models from the specified source
 */
export async function findModelsBySource(source) {
    const registry = cachedRegistry || await loadRegistry();
    return registry.filter(model => model.source === source);
}
/**
 * Search models by ID or name (case-insensitive partial match)
 * @param query Search term to match against id or name fields
 * @returns Array of matching models
 */
export async function searchModelsByIdOrName(query) {
    if (!query || query.trim() === '') {
        return [];
    }
    const registry = cachedRegistry || await loadRegistry();
    const lowerQuery = query.toLowerCase();
    return registry.filter(model => {
        // Check ID
        if (model.id && model.id.toLowerCase().includes(lowerQuery)) {
            return true;
        }
        // Check name/title in raw object
        const raw = model.raw;
        if (raw) {
            const name = raw.name || raw.title || raw.display_name || raw.endpoint_id;
            if (name && String(name).toLowerCase().includes(lowerQuery)) {
                return true;
            }
        }
        return false;
    });
}
/**
 * Clear the cached registry (useful for testing or forcing a reload)
 */
export function clearCache() {
    cachedRegistry = null;
}
//# sourceMappingURL=service.js.map