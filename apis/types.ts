/**
 * TypeScript interfaces for Apidog API integration
 * These interfaces define the structure of API endpoints and parameters
 */

/**
 * API Parameter Definition
 */
export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  default?: any;
  example?: any;
}

/**
 * API Endpoint Definition
 */
export interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
  parameters?: ApiParameter[];
  requestBody?: {
    contentType: string;
    schema: Record<string, any>;
  };
  responses?: {
    [statusCode: string]: {
      description: string;
      schema?: Record<string, any>;
    };
  };
}

/**
 * API Collection (Group of endpoints)
 */
export interface ApiCollection {
  id: string;
  name: string;
  description?: string;
  endpoints: ApiEndpoint[];
}

/**
 * Apidog Project Structure
 */
export interface ApidogProject {
  id: string;
  name: string;
  collections: ApiCollection[];
}

/**
 * Configuration for pulling endpoints
 */
export interface PullConfig {
  projectId: string;
  accessToken: string;
  outputPath?: string;
}

/**
 * Configuration for pushing endpoints
 */
export interface PushConfig {
  projectId: string;
  accessToken: string;
  inputPath?: string;
  forceOverwrite?: boolean;
}
