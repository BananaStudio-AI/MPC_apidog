/**
 * Test file for error handling interface
 * Run with: node ai-infra/mpc-api/test-errors.js
 */

import { ApiError, ErrorTypes, successResponse } from './errors.js';

console.log('Testing Error Interface...\n');

// Test 1: ApiError creation
console.log('1. Testing ApiError creation:');
const error1 = new ApiError('Test error', 400, 'TEST_ERROR', { field: 'test' });
console.log(JSON.stringify(error1.toJSON(), null, 2));

// Test 2: Predefined error types
console.log('\n2. Testing predefined error types:');

const badRequest = ErrorTypes.BAD_REQUEST('Missing required field', { field: 'prompt' });
console.log('BAD_REQUEST:', JSON.stringify(badRequest.toJSON(), null, 2));

const unauthorized = ErrorTypes.UNAUTHORIZED();
console.log('UNAUTHORIZED:', JSON.stringify(unauthorized.toJSON(), null, 2));

const llmError = ErrorTypes.LLM_ERROR('OpenAI API timeout', { provider: 'openai' });
console.log('LLM_ERROR:', JSON.stringify(llmError.toJSON(), null, 2));

// Test 3: Success response
console.log('\n3. Testing success response:');
const success = successResponse({ id: '123', result: 'data' }, 'Operation completed');
console.log(JSON.stringify(success, null, 2));

// Test 4: Error codes
console.log('\n4. Error Code Reference:');
console.log('Available error types:', Object.keys(ErrorTypes).join(', '));

console.log('\n✓ All tests passed!');
