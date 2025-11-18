import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export type ModelTier = 'flagship' | 'strong' | 'draft';

export interface ModelEntry {
  canonical_id: string;
  provider_id: string;
  provider: string;
  modality: string[];
  tasks: string[];
  domains: string[];
  quality_tier: ModelTier;
  speed_tier: string;
  supports: {
    images: boolean;
    video: boolean;
    audio: boolean;
    structured_output: boolean;
  };
  aliases: string[];
}

let cachedCatalog: ModelEntry[] | null = null;

export const loadModelCatalog = (): ModelEntry[] => {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const catalogPath = path.resolve(__dirname, '../../model_catalog/model_catalog.json');
  const fileContents = fs.readFileSync(catalogPath, 'utf-8');
  const parsed: ModelEntry[] = JSON.parse(fileContents);
  cachedCatalog = parsed;
  return parsed;
};

export const getModelByAlias = (aliasOrId: string): ModelEntry | undefined => {
  const catalog = loadModelCatalog();
  return catalog.find(
    (entry) =>
      entry.aliases.includes(aliasOrId) ||
      entry.canonical_id === aliasOrId ||
      entry.provider_id === aliasOrId
  );
};
