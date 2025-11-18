/**
 * Types for model selection endpoint
 * These extend the base UnifiedModelRecord with selection criteria
 */

import { UnifiedModelRecord } from '../../apis/model_registry/types.js';

/**
 * Quality tier for model prioritization
 * draft < strong < flagship
 */
export type QualityTier = 'draft' | 'strong' | 'flagship';

/**
 * Extended model entry with selection metadata
 * This extends the base registry with optional selection fields
 */
export interface ModelEntry extends UnifiedModelRecord {
  // Optional fields for model selection criteria
  task_type?: string;
  domain?: string;
  modality?: string;
  quality_tier?: QualityTier;
}

/**
 * Request body for POST /api/select-model
 */
export interface SelectModelRequest {
  task_type?: string;
  domain?: string;
  modality?: string;
}

/**
 * Response format for POST /api/select-model
 */
export interface SelectModelResponse {
  selected_model: ModelEntry;
  candidates: ModelEntry[];
}
