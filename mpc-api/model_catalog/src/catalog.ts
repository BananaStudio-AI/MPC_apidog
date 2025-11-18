import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Represents the support capabilities of a model
 */
export interface ModelSupports {
  images: boolean;
  video: boolean;
  audio: boolean;
  structured_output: boolean;
}

/**
 * Represents a single model entry in the catalog
 */
export interface ModelEntry {
  canonical_id: string;
  provider_id: string;
  provider: string;
  modality: string[];
  tasks: string[];
  domains: string[];
  quality_tier: string;
  speed_tier: string;
  supports: ModelSupports;
  aliases: string[];
}

/**
 * Represents the complete model catalog structure
 */
export interface ModelCatalog {
  version: string;
  description: string;
  models: ModelEntry[];
}

// Path to the model catalog JSON file
const CATALOG_PATH = path.join(__dirname, '../model_catalog.json');

let cachedCatalog: ModelCatalog | null = null;

/**
 * Load the model catalog from model_catalog.json
 * @returns Promise<ModelCatalog> - The parsed model catalog
 * @throws Error if file is missing or invalid JSON
 */
export async function loadCatalog(): Promise<ModelCatalog> {
  try {
    const content = await fs.readFile(CATALOG_PATH, 'utf-8');
    const catalog = JSON.parse(content) as ModelCatalog;
    
    // Basic validation
    if (!catalog.version || !catalog.models || !Array.isArray(catalog.models)) {
      throw new Error('Invalid catalog structure: missing required fields');
    }
    
    // Validate each model entry has required fields
    for (const model of catalog.models) {
      if (!model.canonical_id || !model.provider_id || !model.provider) {
        throw new Error(`Invalid model entry: missing required fields in ${model.canonical_id || 'unknown'}`);
      }
      if (!Array.isArray(model.modality) || !Array.isArray(model.tasks) || !Array.isArray(model.domains) || !Array.isArray(model.aliases)) {
        throw new Error(`Invalid model entry: array fields must be arrays in ${model.canonical_id}`);
      }
      if (!model.supports || typeof model.supports !== 'object') {
        throw new Error(`Invalid model entry: supports must be an object in ${model.canonical_id}`);
      }
    }
    
    cachedCatalog = catalog;
    return catalog;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(
        `Model catalog not found at ${CATALOG_PATH}. Please ensure the file exists.`
      );
    }
    throw new Error(`Failed to load model catalog: ${err.message}`);
  }
}

/**
 * Find a model by its canonical ID
 * @param canonicalId - The canonical ID to search for
 * @returns Promise<ModelEntry | undefined> - The model if found, undefined otherwise
 */
export async function findModelById(canonicalId: string): Promise<ModelEntry | undefined> {
  const catalog = cachedCatalog || await loadCatalog();
  return catalog.models.find(model => model.canonical_id === canonicalId);
}

/**
 * Find models by provider
 * @param provider - The provider name to filter by
 * @returns Promise<ModelEntry[]> - Array of models from the specified provider
 */
export async function findModelsByProvider(provider: string): Promise<ModelEntry[]> {
  const catalog = cachedCatalog || await loadCatalog();
  return catalog.models.filter(model => model.provider.toLowerCase() === provider.toLowerCase());
}

/**
 * Find models by modality
 * @param modality - The modality to filter by (e.g., "text", "image", "vision")
 * @returns Promise<ModelEntry[]> - Array of models supporting the specified modality
 */
export async function findModelsByModality(modality: string): Promise<ModelEntry[]> {
  const catalog = cachedCatalog || await loadCatalog();
  return catalog.models.filter(model => 
    model.modality.some(m => m.toLowerCase() === modality.toLowerCase())
  );
}

/**
 * Search models by canonical ID or alias (case-insensitive partial match)
 * @param query - Search term to match against canonical_id or aliases
 * @returns Promise<ModelEntry[]> - Array of matching models
 */
export async function searchModels(query: string): Promise<ModelEntry[]> {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const catalog = cachedCatalog || await loadCatalog();
  const lowerQuery = query.toLowerCase();
  
  return catalog.models.filter(model => {
    // Check canonical ID
    if (model.canonical_id.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Check aliases
    if (model.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))) {
      return true;
    }
    
    return false;
  });
}

/**
 * Clear the cached catalog (useful for testing or forcing a reload)
 */
export function clearCache(): void {
  cachedCatalog = null;
}
