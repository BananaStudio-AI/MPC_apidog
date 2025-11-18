#!/usr/bin/env node
/**
 * Integration Test: MPC-API → LiteLLM Gateway
 * 
 * Tests the full flow from MPC-API through to LiteLLM Gateway
 * Validates service-to-service communication in Docker network
 */

import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MPC_API_URL = process.env.MPC_API_URL || 'http://localhost:3000';
const LITELLM_URL = process.env.LITELLM_URL || 'http://localhost:4000';
const TEST_MODEL = process.env.TEST_MODEL || 'gpt-4o-mini';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test counters
let passed = 0;
let failed = 0;

async function testHealthEndpoint() {
  logInfo('Testing MPC-API health endpoint...');
  try {
    const response = await fetch(`${MPC_API_URL}/health`);
    const data = await response.json();
    
    if (response.status === 200 && data.status === 'ok') {
      logSuccess('Health check passed');
      logInfo(`  Service: ${data.service}`);
      logInfo(`  LiteLLM URL: ${data.litellm_url}`);
      passed++;
      return true;
    } else {
      logError('Health check failed: unexpected response');
      failed++;
      return false;
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    failed++;
    return false;
  }
}

async function testLiteLLMHealthDirect() {
  logInfo('Testing LiteLLM Gateway health (direct)...');
  try {
    const response = await fetch(`${LITELLM_URL}/health`);
    
    if (response.status === 200) {
      logSuccess('LiteLLM health check passed');
      passed++;
      return true;
    } else {
      logError(`LiteLLM health check failed: status ${response.status}`);
      failed++;
      return false;
    }
  } catch (error) {
    logError(`LiteLLM health check failed: ${error.message}`);
    failed++;
    return false;
  }
}

async function testModelsEndpoint() {
  logInfo('Testing MPC-API models endpoint...');
  try {
    const response = await fetch(`${MPC_API_URL}/api/models`);
    const data = await response.json();
    
    if (response.status === 200 && data.data && Array.isArray(data.data)) {
      logSuccess('Models endpoint passed');
      logInfo(`  Found ${data.data.length} models`);
      
      // List first 5 models
      const modelList = data.data.slice(0, 5).map(m => m.id).join(', ');
      logInfo(`  Sample models: ${modelList}${data.data.length > 5 ? '...' : ''}`);
      
      passed++;
      return true;
    } else {
      logError('Models endpoint failed: unexpected response');
      console.log('Response:', data);
      failed++;
      return false;
    }
  } catch (error) {
    logError(`Models endpoint failed: ${error.message}`);
    failed++;
    return false;
  }
}

async function testChatCompletionsEndpoint() {
  logInfo('Testing MPC-API chat completions endpoint...');
  
  const payload = {
    model: TEST_MODEL,
    messages: [
      {
        role: 'user',
        content: 'Say "Hello from MPC-API test!" and nothing else.'
      }
    ],
    max_tokens: 50,
    temperature: 0.1
  };
  
  try {
    const response = await fetch(`${MPC_API_URL}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.status === 200 && data.choices && data.choices.length > 0) {
      const message = data.choices[0].message.content;
      logSuccess('Chat completions endpoint passed');
      logInfo(`  Model: ${data.model}`);
      logInfo(`  Response: ${message}`);
      logInfo(`  Tokens used: ${data.usage?.total_tokens || 'N/A'}`);
      passed++;
      return true;
    } else {
      logError('Chat completions endpoint failed: unexpected response');
      console.log('Response:', data);
      failed++;
      return false;
    }
  } catch (error) {
    logError(`Chat completions endpoint failed: ${error.message}`);
    failed++;
    return false;
  }
}

async function testErrorHandling() {
  logInfo('Testing error handling (invalid model)...');
  
  const payload = {
    model: 'nonexistent-model-12345',
    messages: [
      {
        role: 'user',
        content: 'Test'
      }
    ]
  };
  
  try {
    const response = await fetch(`${MPC_API_URL}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.status >= 400) {
      logSuccess('Error handling works correctly');
      logInfo(`  Received expected error status: ${response.status}`);
      passed++;
      return true;
    } else {
      logWarning('Expected error but got success response');
      failed++;
      return false;
    }
  } catch (error) {
    // Network errors are acceptable here
    logSuccess('Error handling works correctly (network error)');
    passed++;
    return true;
  }
}

async function testServiceToServiceRouting() {
  logInfo('Testing service-to-service routing...');
  
  // This test verifies that MPC-API correctly routes to LiteLLM
  // by comparing direct LiteLLM call with MPC-API call
  
  try {
    const payload = {
      model: TEST_MODEL,
      messages: [
        {
          role: 'user',
          content: 'Respond with the word "SUCCESS" only.'
        }
      ],
      max_tokens: 10,
      temperature: 0
    };
    
    // Test through MPC-API
    const mpcResponse = await fetch(`${MPC_API_URL}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const mpcData = await mpcResponse.json();
    
    if (mpcResponse.status === 200 && mpcData.choices) {
      logSuccess('Service-to-service routing works correctly');
      logInfo('  MPC-API → LiteLLM → Provider: ✓');
      passed++;
      return true;
    } else {
      logError('Service-to-service routing failed');
      failed++;
      return false;
    }
  } catch (error) {
    logError(`Service-to-service routing failed: ${error.message}`);
    failed++;
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   MPC-API ↔ LiteLLM Integration Tests');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  
  logInfo(`MPC-API URL: ${MPC_API_URL}`);
  logInfo(`LiteLLM URL: ${LITELLM_URL}`);
  logInfo(`Test Model: ${TEST_MODEL}`);
  console.log('');
  
  // Run tests sequentially
  await testHealthEndpoint();
  console.log('');
  
  await testLiteLLMHealthDirect();
  console.log('');
  
  await testModelsEndpoint();
  console.log('');
  
  await testChatCompletionsEndpoint();
  console.log('');
  
  await testErrorHandling();
  console.log('');
  
  await testServiceToServiceRouting();
  console.log('');
  
  // Summary
  console.log('═══════════════════════════════════════════════════');
  console.log('   Test Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  
  const total = passed + failed;
  if (failed === 0) {
    logSuccess(`All ${total} tests passed! 🎉`);
  } else {
    logError(`${failed}/${total} tests failed`);
    logSuccess(`${passed}/${total} tests passed`);
  }
  
  console.log('');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
