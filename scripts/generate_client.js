#!/usr/bin/env node
/**
 * Generate TypeScript API client from OpenAPI spec
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OAS_FILE = path.join(ROOT, 'openapi', 'oas_merged.json');
const OUTPUT_DIR = path.join(ROOT, 'apis', 'client');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function toPascalCase(str) {
  return str.replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^(.)/, (_, chr) => chr.toUpperCase());
}

function toMethodName(path, method) {
  const parts = path.split('/').filter(Boolean);
  const pathStr = parts.map(p => p.replace(/[{}]/g, '')).join('_');
  return method.toLowerCase() + toPascalCase(pathStr || 'root');
}

async function generateClient() {
  console.log('Reading OpenAPI spec...');
  const oasContent = await fs.readFile(OAS_FILE, 'utf8');
  const oas = JSON.parse(oasContent);
  
  const baseUrl = oas.servers?.[0]?.url || 'https://api.fal.ai';
  const paths = oas.paths || {};
  
  console.log(`Generating client for ${Object.keys(paths).length} endpoints...`);
  
  // Generate types
  const types = [];
  const methods = [];
  
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
      
      const methodName = toMethodName(pathKey, method);
      const responses = operation.responses || {};
      const response200 = responses['200'] || responses['201'];
      
      // Extract response type
      let responseType = 'unknown';
      if (response200?.content?.['application/json']?.schema) {
        const schema = response200.content['application/json'].schema;
        responseType = JSON.stringify(schema, null, 2)
          .replace(/"type":\s*"(\w+)"/g, '$1')
          .replace(/"properties":\s*{/g, '{')
          .replace(/}/g, '}');
      }
      
      // Extract parameters
      const params = operation.parameters || [];
      const queryParams = params.filter(p => p.in === 'query');
      const headerParams = params.filter(p => p.in === 'header');
      
      methods.push({
        name: methodName,
        method: method.toUpperCase(),
        path: pathKey,
        summary: operation.summary || '',
        queryParams,
        headerParams,
        responseType
      });
    }
  }
  
  // Generate index.ts
  const indexContent = `/**
 * Auto-generated API client from OpenAPI spec
 * Do not edit manually - regenerate with: npm run generate:client
 */

export interface ApiClientConfig {
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface ModelsPricingResponse {
  next_cursor: string | null;
  has_more: boolean;
  prices: Array<{
    endpoint_id: string;
    unit_price: number;
    unit: string;
    currency: string;
  }>;
}

export interface PricingEstimateResponse {
  estimate_type: string;
  total_cost: number;
  currency: string;
}

export interface PricingEstimateRequest {
  estimate_type: string;
  endpoints: Record<string, { unit_quantity: number }>;
}

export interface ModelSearchResponse {
  models: Array<{
    endpoint_id: string;
    metadata: {
      display_name: string;
      category: string;
      description: string;
      status: string;
      tags: string[];
      updated_at: string;
      is_favorited: boolean;
      thumbnail_url: string;
      model_url: string;
      date: string;
      highlighted: boolean;
      pinned: boolean;
    };
  }>;
  next_cursor: string | null;
  has_more: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private apiKey?: string;
  private headers: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '${baseUrl}';
    this.apiKey = config.apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    if (this.apiKey) {
      this.headers['Authorization'] = \`Key \${this.apiKey}\`;
    }
  }

  private async request<T>(
    method: string,
    path: string,
    options: { query?: Record<string, any>; body?: any } = {}
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    
    if (options.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: this.headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      throw new Error(\`API Error: \${response.status} \${response.statusText}\`);
    }

    return response.json();
  }

  /**
   * GET Models Pricing
   * Fetch pricing information for models
   */
  async getModelsPricing(): Promise<ModelsPricingResponse> {
    return this.request<ModelsPricingResponse>('GET', '/');
  }

  /**
   * GET Model search
   * Search for available models
   */
  async getModelsSearch(): Promise<ModelSearchResponse> {
    return this.request<ModelSearchResponse>('GET', '/models');
  }

  /**
   * POST Estimate Model Pricing
   * Returns aggregated pricing estimate for requested endpoints
   */
  async estimateModelsPricing(body: PricingEstimateRequest): Promise<PricingEstimateResponse> {
    return this.request<PricingEstimateResponse>('POST', '/v1/models/pricing/estimate', { body });
  }
}

// Export default instance
export default ApiClient;
`;

  await ensureDir(OUTPUT_DIR);
  await fs.writeFile(path.join(OUTPUT_DIR, 'index.ts'), indexContent);
  
  console.log(`✓ Generated TypeScript client: apis/client/index.ts`);
  console.log(`\nUsage:`);
  console.log(`  import { ApiClient } from './apis/client';`);
  console.log(`  const client = new ApiClient({ apiKey: process.env.FAL_API_KEY });`);
  console.log(`  const pricing = await client.getModelsPricing();`);
}

generateClient().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
