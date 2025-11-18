import fs from 'fs';
import path from 'path';

export type ModelTier = 'flagship' | 'strong' | 'draft';

export interface ModelEntry {
  alias: string;
  provider_id: string;
  task_types: string[];
  domains: string[];
  modality: string;
  tier: ModelTier;
}

let cachedCatalog: ModelEntry[] | null = null;

export const loadModelCatalog = (): ModelEntry[] => {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const catalogPath = path.resolve(__dirname, '../../model_catalog/model_catalog.json');
  const fileContents = fs.readFileSync(catalogPath, 'utf-8');
  const parsed: ModelEntry[] = JSON.parse(fileContents);
  cachedCatalog = parsed;
  return parsed;
};

export const getModelByAlias = (alias: string): ModelEntry | undefined => {
  const catalog = loadModelCatalog();
  return catalog.find(
    (entry) => entry.alias === alias || entry.provider_id === alias
  );
};
