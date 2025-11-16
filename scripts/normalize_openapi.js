#!/usr/bin/env node
/**
 * Normalize OpenAPI spec for API HUB project
 * 
 * Takes the raw OAS and creates a normalized version with:
 * - Proper server definitions for Comet and FAL APIs
 * - Correct tags (COMET_API, FAL_API)
 * - Clean paths without vendor prefixes
 * - Preserved schemas and components
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const RAW_OAS_PATH = path.join(ROOT, 'openapi', 'api-hub.raw.oas.json');
const NORMALIZED_OAS_PATH = path.join(ROOT, 'openapi', 'api-hub.oas.json');

async function main() {
  console.log('Reading raw OpenAPI spec...');
  const rawContent = await fs.readFile(RAW_OAS_PATH, 'utf8');
  const rawSpec = JSON.parse(rawContent);
  
  console.log('\n📋 Analyzing raw spec:');
  console.log(`  OpenAPI Version: ${rawSpec.openapi}`);
  console.log(`  Title: ${rawSpec.info?.title}`);
  console.log(`  Paths: ${Object.keys(rawSpec.paths || {}).length}`);
  
  // Create normalized spec
  const normalized = {
    openapi: '3.0.1',
    info: {
      title: 'BananaStudio API Hub',
      description: 'Unified API Hub integrating Comet Models and FAL Platform APIs for AI-driven creative workflows',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'https://api.cometapi.com/v1',
        description: 'Comet API'
      },
      {
        url: 'https://api.fal.ai/v1',
        description: 'FAL Platform API'
      }
    ],
    tags: [
      {
        name: 'COMET_API',
        description: 'Comet Models API - Model registry, metadata, and pricing'
      },
      {
        name: 'FAL_API',
        description: 'FAL Platform API - Creative generation and model services'
      }
    ],
    paths: {}
  };
  
  // Process paths from raw spec
  const rawPaths = rawSpec.paths || {};
  
  console.log('\n🔍 Processing existing paths:');
  
  for (const [pathKey, pathItem] of Object.entries(rawPaths)) {
    // Skip $ref entries at path level
    const methods = Object.entries(pathItem).filter(([key]) => !key.startsWith('$'));
    
    for (const [method, operation] of methods) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
        continue;
      }
      
      const summary = operation.summary || '';
      console.log(`  ${method.toUpperCase()} ${pathKey} - ${summary}`);
      
      // Determine API type and normalized path based on summary and path
      // All current endpoints appear to be FAL API
      let normalizedPath = pathKey;
      let tag = 'FAL_API';
      let serverIndex = 1; // FAL by default
      
      // Normalize paths
      if (pathKey === '/' && summary.includes('Pricing')) {
        // FAL: GET /models/pricing
        normalizedPath = '/models/pricing';
      } else if (pathKey === '/models' && summary.includes('search')) {
        // FAL: GET /models (model search)
        normalizedPath = '/models';
      } else if (pathKey.includes('/v1/models/pricing/estimate')) {
        // FAL: POST /models/pricing/estimate
        normalizedPath = '/models/pricing/estimate';
      }
      
      // Create or update path entry
      if (!normalized.paths[normalizedPath]) {
        normalized.paths[normalizedPath] = {};
      }
      
      // Build normalized operation
      const normalizedOperation = {
        summary: operation.summary || '',
        description: operation.description || '',
        tags: [tag],
        operationId: `${tag.toLowerCase()}_${method}_${normalizedPath.replace(/\//g, '_').replace(/^_/, '')}`,
        parameters: operation.parameters || [],
        responses: operation.responses || {},
        deprecated: operation.deprecated || false
      };
      
      // Add servers at operation level to specify which server to use
      normalizedOperation.servers = [normalized.servers[serverIndex]];
      
      // Add request body if present
      if (operation.requestBody) {
        normalizedOperation.requestBody = operation.requestBody;
      }
      
      // Add security if present
      if (operation.security && operation.security.length > 0) {
        normalizedOperation.security = operation.security;
      }
      
      normalized.paths[normalizedPath][method] = normalizedOperation;
    }
  }
  
  // Add missing FAL API endpoints based on problem statement
  // These may not exist in the raw spec but are mentioned in requirements
  const requiredFalEndpoints = [
    { path: '/models/usage', method: 'get', summary: 'GET Usage', description: 'Get model usage statistics' },
    { path: '/models/analytics', method: 'get', summary: 'GET Analytics', description: 'Get model analytics data' }
  ];
  
  for (const endpoint of requiredFalEndpoints) {
    if (!normalized.paths[endpoint.path]) {
      console.log(`  ℹ️  Adding missing endpoint: ${endpoint.method.toUpperCase()} ${endpoint.path}`);
      normalized.paths[endpoint.path] = {
        [endpoint.method]: {
          summary: endpoint.summary,
          description: endpoint.description,
          tags: ['FAL_API'],
          operationId: `fal_api_${endpoint.method}_${endpoint.path.replace(/\//g, '_')}`,
          parameters: [],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object'
                  }
                }
              }
            }
          },
          servers: [normalized.servers[1]]
        }
      };
    }
  }
  
  // Add COMET_API endpoint as specified in problem statement
  // COMET has: GET /models
  console.log(`\n📝 Adding COMET_API endpoints:`);
  console.log(`  GET /models - List models from Comet API`);
  
  // Create a separate endpoint for COMET /models using a different approach
  // Since FAL already has GET /models, we'll keep both but with different tags and servers
  // The client will use operation-level servers to differentiate
  
  // First, rename the existing FAL GET /models if it exists
  if (normalized.paths['/models']?.get?.tags?.includes('FAL_API')) {
    // Update the FAL endpoint to be more specific
    const falModelsOp = normalized.paths['/models'].get;
    falModelsOp.summary = 'GET Model search (FAL)';
    falModelsOp.description = 'Search and list models from FAL Platform';
  }
  
  // Add COMET GET /models as a separate operation with its own server
  // We'll use a different HTTP method or add it to the same path with server differentiation
  // OpenAPI allows multiple operations on the same path with different servers
  
  // Create the COMET models endpoint
  const cometModelsPath = '/models';
  if (!normalized.paths[cometModelsPath]) {
    normalized.paths[cometModelsPath] = {};
  }
  
  // Store both operations - clients will use the server to differentiate
  // Keep FAL GET /models and we'll document that COMET uses a separate module/tag
  
  // Actually, per the problem statement, let's use different paths for clarity in the normalized spec
  // COMET: GET /models (with Comet server)
  // FAL: GET /models (with FAL server) - already exists
  
  // The key is that operation-level servers differentiate them
  // But for better clarity, let's ensure COMET is represented
  
  // If FAL already claimed /models, we need to reconsider
  // Looking at problem statement: 
  // - COMET_API: GET Models (path should be /models)
  // - FAL_API: GET Model, GET Pricing, POST Estimated Cost, GET Usage, GET Analytics
  //   Paths: /models, /models/pricing, /models/pricing/estimate, /models/usage, /models/analytics
  
  // Both APIs have GET /models but different servers!
  // Solution: We'll have ONE GET /models with server override OR two separate operationIds
  
  // Let's use the OpenAPI standard approach: same path, but documented with both tags
  // and clients use the servers array to know which backend to hit
  
  // Update: Create a COMET-specific GET endpoint
  // Option 1: Use path parameter like /models?provider=comet vs /models?provider=fal
  // Option 2: Different paths entirely
  // Option 3: Same path, operation-level server (cleanest for OpenAPI)
  
  // Let's go with Option 3 but document both in separate operations
  // Since OpenAPI doesn't support two GET operations on same path,
  // we'll need to use tags and document that the server differentiates them
  
  // Create a dedicated paths section comment or separate them logically
  // For the normalized spec, let's ensure COMET GET /models exists with Comet server
  
  // Check if we need to add COMET explicitly
  const hasComet = Object.values(normalized.paths).some(pathItem =>
    Object.values(pathItem).some(op => op.tags?.includes('COMET_API'))
  );
  
  if (!hasComet) {
    // Rename FAL /models to /models/search for clarity
    if (normalized.paths['/models']?.get) {
      const falOp = normalized.paths['/models'].get;
      if (falOp.tags?.includes('FAL_API')) {
        // Move FAL models to /models/search
        normalized.paths['/models/search'] = {
          get: {
            ...falOp,
            summary: 'Search models (FAL)',
            operationId: 'fal_api_get_models_search'
          }
        };
        // Remove FAL from /models
        delete normalized.paths['/models'];
      }
    }
    
    // Now add COMET GET /models
    normalized.paths['/models'] = {
      get: {
        summary: 'GET Models',
        description: 'List available models from Comet API',
        tags: ['COMET_API'],
        operationId: 'comet_api_get_models',
        parameters: [],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  '$ref': '#/components/schemas/CometModelsResponse'
                }
              }
            }
          }
        },
        servers: [normalized.servers[0]]
      }
    };
  }
  
  // Preserve components from raw spec
  if (rawSpec.components) {
    normalized.components = {
      schemas: rawSpec.components.schemas || {},
      securitySchemes: rawSpec.components.securitySchemes || {}
    };
  }
  
  // Write normalized spec
  console.log('\n💾 Writing normalized spec...');
  await fs.writeFile(
    NORMALIZED_OAS_PATH,
    JSON.stringify(normalized, null, 2),
    'utf8'
  );
  
  console.log(`\n✅ Normalized OpenAPI spec created: ${path.basename(NORMALIZED_OAS_PATH)}`);
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log('\n🌐 Servers:');
  normalized.servers.forEach((server, idx) => {
    console.log(`  ${idx + 1}. ${server.url} - ${server.description}`);
  });
  
  console.log('\n🏷️  Tags:');
  normalized.tags.forEach(tag => {
    console.log(`  - ${tag.name}: ${tag.description}`);
  });
  
  console.log('\n🛣️  Paths:');
  for (const [pathKey, pathItem] of Object.entries(normalized.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      const tag = operation.tags?.[0] || 'N/A';
      const server = operation.servers?.[0]?.description || 'N/A';
      console.log(`  ${method.toUpperCase().padEnd(6)} ${pathKey.padEnd(30)} [${tag}] → ${server}`);
    }
  }
  
  console.log('\n✨ Done!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
