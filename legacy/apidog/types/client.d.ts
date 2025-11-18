// Client-facing API types used by automation tools
// These are intentionally simple and stable for external consumption.

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  headers: ApiParameter[];
  queryParams: ApiParameter[];
  requestBody: any;
  responses: Record<string, any>;
}

export interface ApiModule {
  id: string;
  name: string;
  description?: string;
  endpoints: ApiEndpoint[];
}
