/**
 * LiteLLM Client
 * Provides a TypeScript/Node.js wrapper for calling the LiteLLM Gateway
 */

import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  [key: string]: any;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
}

export class LiteLLMClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(baseUrl?: string, apiKey?: string, timeout: number = 300000) {
    this.baseUrl = (baseUrl || process.env.LITELLM_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
    this.apiKey = apiKey || process.env.LITELLM_API_KEY || process.env.LITELLM_MASTER_KEY;
    this.timeout = timeout;

    logger.info(`LiteLLM client initialized: ${this.baseUrl}`);
  }

  /**
   * Get available models from LiteLLM gateway
   */
  async getModels(): Promise<ModelsResponse> {
    const url = `${this.baseUrl}/models`;
    logger.debug({ url }, 'Fetching models');

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LiteLLM models request failed: ${response.status} ${errorText}`);
      }

      return await response.json() as ModelsResponse;
    } catch (error: any) {
      logger.error({ error: error.message, url }, 'Failed to fetch models from LiteLLM');
      throw error;
    }
  }

  /**
   * Send a chat completion request
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    logger.debug({ url, model: request.model }, 'Sending chat completion request');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LiteLLM chat completion failed: ${response.status} ${errorText}`);
      }

      return await response.json() as ChatCompletionResponse;
    } catch (error: any) {
      logger.error({ error: error.message, url, model: request.model }, 'Chat completion failed');
      throw error;
    }
  }

  /**
   * Health check
   */
  async health(): Promise<any> {
    const url = `${this.baseUrl}/health`;
    logger.debug({ url }, 'Health check');

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      logger.error({ error: error.message, url }, 'Health check failed');
      throw error;
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }
}

// Singleton instance
let litellmClient: LiteLLMClient | null = null;

export function getLiteLLMClient(): LiteLLMClient {
  if (!litellmClient) {
    litellmClient = new LiteLLMClient();
  }
  return litellmClient;
}
