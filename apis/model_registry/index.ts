import { UnifiedModelRecord } from './types';

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
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    console.error('FAL_API_KEY not set');
    return [];
  }

  const baseUrl = 'https://api.fal.ai/v1/models';
  const allModels: UnifiedModelRecord[] = [];
  let cursor: string | null = null;
  let page = 0;
  
  try {
    do {
      page++;
      const url: string = cursor ? `${baseUrl}?cursor=${cursor}` : baseUrl;
      
      const response: Response = await fetch(url, {
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: any = await response.json();
      const models = Array.isArray(data.models) ? data.models : [];
      
      console.log(`  Page ${page}: fetched ${models.length} FAL models`);
      
      for (const m of models) {
        allModels.push({
          source: 'fal' as const,
          id: m.endpoint_id,
          provider: m.endpoint_id ? m.endpoint_id.split('/')[0] : 'fal-ai',
          category: m.metadata?.category ?? null,
          raw: m
        });
      }
      
      cursor = data.has_more ? data.next_cursor : null;
      
      // Add small delay between requests to be respectful
      if (cursor) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (cursor);
    
    console.log(`  Total FAL models fetched: ${allModels.length}`);
    return allModels;
  } catch (err: any) {
    console.error(`Failed to fetch FAL models: ${err.message}`);
    return [];
  }
}

export async function fetchAllModels(): Promise<UnifiedModelRecord[]> {
  const [comet, fal] = await Promise.all([
    fetchCometModels(),
    fetchFalModels()
  ]);
  return [...comet, ...fal];
}
