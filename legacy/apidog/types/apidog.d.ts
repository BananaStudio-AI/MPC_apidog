// TypeScript declaration types for Apidog objects used by automation scripts

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface QueryParam {
  name: string;
  required?: boolean;
  description?: string;
  schema?: Schema;
  example?: unknown;
}

export interface Header {
  name: string;
  required?: boolean;
  description?: string;
  schema?: Schema;
  example?: unknown;
}

export interface SchemaRef {
  $ref: string;
}

export type SchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null'
  | string; // allow vendor-specific types

export interface Schema {
  type?: SchemaType;
  title?: string;
  description?: string;
  items?: Schema | SchemaRef;
  properties?: Record<string, Schema | SchemaRef>;
  required?: string[];
  enum?: unknown[];
  oneOf?: (Schema | SchemaRef)[];
  anyOf?: (Schema | SchemaRef)[];
  allOf?: (Schema | SchemaRef)[];
  additionalProperties?: boolean | (Schema | SchemaRef);
  format?: string;
  default?: unknown;
  example?: unknown;
}

export interface AuthConfig {
  type: 'none' | 'apiKey' | 'http' | 'oauth2' | 'openIdConnect' | string;
  name?: string; // for apiKey
  in?: 'query' | 'header' | 'cookie';
  scheme?: string; // for http
  bearerFormat?: string; // for http bearer
  flows?: unknown; // oauth2
  openIdConnectUrl?: string; // openIdConnect
}

export interface RequestBody {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: Schema | SchemaRef; example?: unknown }>;
}

export interface Response {
  description?: string;
  headers?: Record<string, Header>;
  content?: Record<string, { schema?: Schema | SchemaRef; example?: unknown }>;
}

export interface Endpoint {
  id?: string; // internal Apidog id if provided
  name?: string; // human-readable name
  module?: string; // group/module name
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  servers?: string[];
  security?: AuthConfig[];
  query?: QueryParam[];
  headers?: Header[];
  requestBody?: RequestBody;
  responses?: Record<string, Response>; // status code -> response
}

export interface Module {
  name: string;
  description?: string;
  folder?: Folder;
}

export interface Folder {
  name: string;
  description?: string;
  children?: Folder[];
  endpoints?: Endpoint[];
}

export interface ProjectSpec {
  id: string | number;
  name?: string;
  modules?: Module[];
  endpoints?: Endpoint[]; // flattened view if provided
  schemas?: Record<string, Schema | SchemaRef>;
  auth?: Record<string, AuthConfig>;
}

export interface DiffResult<T = unknown> {
  id?: string;
  path?: string[];
  type: 'add' | 'remove' | 'change';
  before?: T;
  after?: T;
}
