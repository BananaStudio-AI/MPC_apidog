/**
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
    this.baseUrl = config.baseUrl || 'https://api.cometapi.com/v1';
    this.apiKey = config.apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    if (this.apiKey) {
      this.headers['Authorization'] = `Key ${this.apiKey}`;
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
