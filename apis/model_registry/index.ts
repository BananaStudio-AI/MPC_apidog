import ApiClient from '../api-hub-client';
import { UnifiedModelRecord } from './types';

function getCometClient() {
  return new ApiClient({
    apiKey: process.env.COMET_API_KEY,
    baseUrl: 'https://api.cometapi.com/v1'
  });
}

function getFalClient() {
  return new ApiClient({
    apiKey: process.env.FAL_API_KEY,
    baseUrl: 'https://api.fal.ai/v1/models'
  });
}

export async function fetchCometModels(): Promise<UnifiedModelRecord[]> {
  const apiKey = process.env.COMET_API_KEY;
  if (!apiKey) {
    console.error('COMET_API_KEY not set');
    return [];
  }

  const baseUrl = 'https://api.cometapi.com/v1';
  
  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const arr = Array.isArray(data.data) ? data.data : [];
    
    return arr.map((m: any) => ({
      source: 'comet' as const,
      id: m.id,
      provider: m.owned_by ?? null,
      category: null,
      raw: m
    }));
  } catch (err: any) {
    console.error(`Failed to fetch Comet models: ${err.message}`);
    return [];
  }
}

export async function fetchFalModels(): Promise<UnifiedModelRecord[]> {
  // FAL doesn't expose a public models list endpoint
  // Using a curated list of known FAL models for the registry
  const knownFalModels = [
    'fal-ai/flux/dev',
    'fal-ai/flux-pro',
    'fal-ai/flux/schnell',
    'fal-ai/stable-diffusion-v3-medium',
    'fal-ai/aura-flow',
    'fal-ai/omnigen-v1',
    'fal-ai/recraft-v3',
    'fal-ai/fast-turbo-diffusion',
    'fal-ai/runway-gen3/turbo/image-to-video',
    'fal-ai/luma-photon',
    'fal-ai/luma-photon-flash',
    'fal-ai/kling-video/v1/standard/image-to-video',
    'fal-ai/minimax-video',
  ];

  return knownFalModels.map((endpoint_id) => {
    const parts = endpoint_id.split('/');
    const provider = parts[0] || 'fal-ai';
    return {
      source: 'fal' as const,
      id: endpoint_id,
      provider,
      category: endpoint_id.includes('video') ? 'video' : 'image',
      raw: { endpoint_id, source: 'manual_registry' }
    };
  });
}

export async function fetchAllModels(): Promise<UnifiedModelRecord[]> {
  const [comet, fal] = await Promise.all([
    fetchCometModels(),
    fetchFalModels()
  ]);
  return [...comet, ...fal];
}
