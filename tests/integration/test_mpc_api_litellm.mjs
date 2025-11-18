/**
 * Integration Test: MPC-API → LiteLLM Connectivity
 * 
 * Tests that MPC-API can successfully communicate with LiteLLM Gateway
 * 
 * Usage:
 *   node tests/integration/test_mpc_api_litellm.mjs
 * 
 * Prerequisites:
 *   - MPC-API running on http://localhost:3000
 *   - LiteLLM running on http://localhost:4000
 *   - Valid API keys configured (OPENAI_API_KEY, etc.)
 */

import fetch from 'node-fetch';

const MPC_API_URL = process.env.MPC_API_URL || 'http://localhost:3000';
const TEST_MODEL = process.env.TEST_MODEL || 'gpt-4o-mini';

console.log('=== MPC-API → LiteLLM Integration Test ===\n');
console.log(`MPC-API URL: ${MPC_API_URL}`);
console.log(`Test Model: ${TEST_MODEL}\n`);

let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    await fn();
    console.log(`✅ PASSED: ${name}\n`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}\n`);
    testsFailed++;
  }
}

// Test 1: Health Check
await test('MPC-API Health Check', async () => {
  const response = await fetch(`${MPC_API_URL}/health`);
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'ok') {
    throw new Error(`Health status is not "ok": ${data.status}`);
  }
  
  if (!data.checks || !data.checks.litellm) {
    throw new Error('Health check does not include LiteLLM status');
  }
  
  console.log(`   Status: ${data.status}`);
  console.log(`   LiteLLM: ${data.checks.litellm}`);
});

// Test 2: List Models
await test('List Models from LiteLLM', async () => {
  const response = await fetch(`${MPC_API_URL}/api/models`);
  
  if (!response.ok) {
    throw new Error(`List models failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.data || !Array.isArray(data.data)) {
    throw new Error('Models response does not contain data array');
  }
  
  if (data.data.length === 0) {
    throw new Error('No models returned from LiteLLM');
  }
  
  console.log(`   Found ${data.data.length} models`);
  console.log(`   Sample models: ${data.data.slice(0, 3).map(m => m.id).join(', ')}`);
});

// Test 3: Chat Completion
await test('Chat Completion via MPC-API', async () => {
  const requestBody = {
    model: TEST_MODEL,
    messages: [
      { role: 'user', content: 'Say "test successful" and nothing else.' }
    ],
    max_tokens: 20,
    temperature: 0.0
  };
  
  const response = await fetch(`${MPC_API_URL}/api/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat completion failed: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  
  if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
    throw new Error('Response does not contain choices');
  }
  
  const message = data.choices[0].message;
  if (!message || !message.content) {
    throw new Error('Response does not contain message content');
  }
  
  console.log(`   Model: ${data.model}`);
  console.log(`   Response: ${message.content}`);
  console.log(`   Tokens: ${data.usage?.total_tokens || 'N/A'}`);
});

// Test 4: Error Handling - Invalid Model
await test('Error Handling: Invalid Model', async () => {
  const requestBody = {
    model: 'invalid-model-xyz-123',
    messages: [
      { role: 'user', content: 'This should fail' }
    ]
  };
  
  const response = await fetch(`${MPC_API_URL}/api/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  // Should fail with 500 or 400
  if (response.ok) {
    throw new Error('Expected error response for invalid model, but got success');
  }
  
  console.log(`   Correctly returned error: ${response.status}`);
});

// Test 5: Error Handling - Missing Required Fields
await test('Error Handling: Missing Required Fields', async () => {
  const requestBody = {
    // Missing model and messages
    temperature: 0.7
  };
  
  const response = await fetch(`${MPC_API_URL}/api/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  // Should return 400
  if (response.status !== 400) {
    throw new Error(`Expected 400 Bad Request, got ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.error) {
    throw new Error('Error response does not contain error field');
  }
  
  console.log(`   Correctly returned 400: ${data.message}`);
});

// Summary
console.log('=== Test Summary ===');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📊 Total: ${testsPassed + testsFailed}`);

if (testsFailed > 0) {
  console.log('\n⚠️  Some tests failed. Check the output above for details.');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
}
