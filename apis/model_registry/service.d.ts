import { UnifiedModelRecord } from './types';
/**
 * Load the unified model registry from data/model_registry.json
 * @returns Array of UnifiedModelRecord
 * @throws Error if file is missing or invalid JSON
 */
export declare function loadRegistry(): Promise<UnifiedModelRecord[]>;
/**
 * Find models by source provider
 * @param source Either "comet" or "fal"
 * @returns Filtered array of models from the specified source
 */
export declare function findModelsBySource(source: 'comet' | 'fal'): Promise<UnifiedModelRecord[]>;
/**
 * Search models by ID or name (case-insensitive partial match)
 * @param query Search term to match against id or name fields
 * @returns Array of matching models
 */
export declare function searchModelsByIdOrName(query: string): Promise<UnifiedModelRecord[]>;
/**
 * Clear the cached registry (useful for testing or forcing a reload)
 */
export declare function clearCache(): void;
//# sourceMappingURL=service.d.ts.map