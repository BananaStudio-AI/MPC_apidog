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
    baseUrl: 'https://api.fal.ai/v1'
  });
}

export async function fetchCometModels(): Promise<UnifiedModelRecord[]> {
  const client = getCometClient();
  // The generated method for Comet is getModelsSearch
  const resp = await client.getModelsSearch();
  // Try to support both possible shapes
  const arr = Array.isArray((resp as any).data) ? (resp as any).data : (Array.isArray((resp as any).models) ? (resp as any).models : []);
  return arr.map((m: any) => ({
    source: 'comet',
    id: m.id || m.endpoint_id,
    provider: m.provider ?? null,
    category: m.category ?? null,
    raw: m
  }));
}

export async function fetchFalModels(): Promise<UnifiedModelRecord[]> {
  const client = getFalClient();
  // The generated method for FAL is also getModelsSearch
  const resp = await client.getModelsSearch();
  const arr = Array.isArray((resp as any).models) ? (resp as any).models : (Array.isArray((resp as any).data) ? (resp as any).data : []);
  return arr.map((m: any) => ({
    source: 'fal',
    id: m.id || m.endpoint_id,
    provider: m.provider ?? null,
    category: m.category ?? null,
    raw: m
  }));
}

export async function fetchAllModels(): Promise<UnifiedModelRecord[]> {
  const [comet, fal] = await Promise.all([
    fetchCometModels(),
    fetchFalModels()
  ]);
  return [...comet, ...fal];
}
