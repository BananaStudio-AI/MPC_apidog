# Integration Tests

Tests for validating the Docker infrastructure stack.

## Prerequisites

All services must be running:
```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action start
```

## Running Tests

### MPC-API → LiteLLM Integration Test
```bash
node tests/integration/test_mpc_api_litellm.mjs
```

This test validates:
1. MPC-API health check (including LiteLLM connectivity)
2. Listing models from LiteLLM
3. Chat completion through the full stack
4. Error handling for invalid inputs

### Environment Variables
- `MPC_API_URL` - MPC-API base URL (default: http://localhost:3000)
- `TEST_MODEL` - Model to test with (default: gpt-4o-mini)

## Expected Results

All tests should pass when:
- Docker stack is running
- LiteLLM is configured with valid API keys
- MPC-API can reach LiteLLM gateway

## Troubleshooting

If tests fail:
1. Check service status: `.\ai-infra-manage.ps1 -Action status`
2. View MPC-API logs: `.\ai-infra-manage.ps1 -Action logs -Service mpc-api`
3. View LiteLLM logs: `.\ai-infra-manage.ps1 -Action logs -Service litellm`
4. Verify API keys are set in `.env` files
