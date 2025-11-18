/**
 * POST /api/select-model endpoint
 * Selects the best AI model from catalog based on criteria
 */

import { Router, Request, Response } from 'express';
import { loadRegistry } from '../../apis/model_registry/service.js';
import { 
  ModelEntry, 
  SelectModelRequest, 
  SelectModelResponse,
  QualityTier 
} from '../types/modelSelection.js';

const router = Router();

/**
 * Quality tier ranking for prioritization
 * Lower index = higher priority
 */
const QUALITY_TIER_RANKING: Record<QualityTier, number> = {
  'flagship': 0,
  'strong': 1,
  'draft': 2,
};

/**
 * Infer quality tier from model metadata
 * This is a heuristic based on model naming and category
 */
function inferQualityTier(model: ModelEntry): QualityTier {
  const id = model.id?.toLowerCase() || '';
  const raw = model.raw as any;
  const displayName = raw?.metadata?.display_name?.toLowerCase() || '';
  
  // Flagship indicators: pro, ultra, flagship, premium
  if (id.includes('pro') || id.includes('ultra') || id.includes('flagship') ||
      displayName.includes('pro') || displayName.includes('ultra') || displayName.includes('premium')) {
    return 'flagship';
  }
  
  // Draft indicators: dev, draft, beta, lite
  if (id.includes('dev') || id.includes('draft') || id.includes('beta') || id.includes('lite') ||
      displayName.includes('dev') || displayName.includes('draft') || displayName.includes('beta')) {
    return 'draft';
  }
  
  // Default to strong
  return 'strong';
}

/**
 * Extend model with inferred metadata for selection
 */
function enrichModel(model: ModelEntry): ModelEntry {
  const raw = model.raw as any;
  
  return {
    ...model,
    // Use category as task_type/domain (e.g., "image-to-image", "text-to-image")
    task_type: model.category || raw?.metadata?.category,
    domain: model.category || raw?.metadata?.category,
    modality: model.category || raw?.metadata?.category,
    quality_tier: model.quality_tier || inferQualityTier(model),
  };
}

/**
 * Filter models based on request criteria
 */
function filterModels(models: ModelEntry[], criteria: SelectModelRequest): ModelEntry[] {
  return models.filter(model => {
    // If task_type is specified, it must match
    if (criteria.task_type && model.task_type !== criteria.task_type) {
      return false;
    }
    
    // If domain is specified, it must match
    if (criteria.domain && model.domain !== criteria.domain) {
      return false;
    }
    
    // If modality is specified, it must match
    if (criteria.modality && model.modality !== criteria.modality) {
      return false;
    }
    
    return true;
  });
}

/**
 * Select best model from candidates based on quality_tier
 * Prioritizes: flagship > strong > draft
 */
function selectBestModel(candidates: ModelEntry[]): ModelEntry | null {
  if (candidates.length === 0) {
    return null;
  }
  
  // Sort by quality tier (flagship first, draft last)
  const sorted = [...candidates].sort((a, b) => {
    const tierA = a.quality_tier || 'strong';
    const tierB = b.quality_tier || 'strong';
    return QUALITY_TIER_RANKING[tierA] - QUALITY_TIER_RANKING[tierB];
  });
  
  return sorted[0];
}

/**
 * POST /api/select-model
 * Select best model based on task_type, domain, and modality
 */
router.post('/select-model', async (req: Request, res: Response) => {
  try {
    const criteria: SelectModelRequest = req.body;
    
    // Load catalog using existing loadRegistry function
    // Note: The problem statement mentions loadCatalog(), but the actual
    // function in the codebase is loadRegistry()
    const catalog = await loadRegistry();
    
    // Enrich models with inferred metadata
    const enrichedModels = catalog.map(enrichModel);
    
    // Filter models based on criteria
    const candidates = filterModels(enrichedModels, criteria);
    
    // Select the best model
    const selectedModel = selectBestModel(candidates);
    
    if (!selectedModel) {
      return res.status(404).json({
        error: 'No models found matching the specified criteria',
        criteria,
      });
    }
    
    // Return response in required format
    const response: SelectModelResponse = {
      selected_model: selectedModel,
      candidates: candidates,
    };
    
    res.json(response);
  } catch (error: any) {
    console.error('Error in /api/select-model:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

export default router;
