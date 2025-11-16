# Testing Guide

## Current Testing Approach

The BananaStudio API Hub currently uses **manual testing** and **validation scripts** rather than automated unit tests. This document outlines the testing strategy and how to verify changes.

## Manual Testing Scripts

### Health Checks

Run comprehensive health checks for API integrations:

```bash
npm run health:api-hub
```

This validates:
- ✅ Comet API connectivity
- ✅ FAL API connectivity  
- ✅ FAL pricing endpoint
- ✅ Unified model registry

**Requirements:** `COMET_API_KEY` and `FAL_API_KEY` in `.env`

### Authentication Checks

Verify Apidog API authentication:

```bash
npm run apidog:auth-check
```

This validates:
- ✅ Token format
- ✅ Project access
- ✅ API listing permissions

**Requirements:** `APIDOG_ACCESS_TOKEN` and `APIDOG_PROJECT_ID` in `.env`

### Validation Scripts

Validate Apidog endpoint specifications:

```bash
npm run apidog:validate
```

## Testing Your Changes

### 1. For API Integration Changes

```bash
# Test Comet/FAL integrations
npm run sync:model-registry
npm run health:api-hub

# Verify output
cat data/model_registry.json | jq '.[] | .source' | sort | uniq -c
```

### 2. For Apidog Script Changes

```bash
# Test pull workflow
npm run apidog:pull

# Test push workflow (dry run)
npm run apidog:push:oas

# Test validation
npm run apidog:validate
```

### 3. For TypeScript Scripts

```bash
# Run type checking
npm run typecheck

# Run the specific script
tsx scripts/your-script.ts
```

### 4. For Code Quality

```bash
# Check linting
npm run lint

# Check formatting
npm run format:check

# Auto-fix issues
npm run lint:fix
npm run format
```

## Test Checklist for Pull Requests

Before submitting a PR, verify:

- [ ] Scripts run without errors
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Formatting is correct (`npm run format:check`)
- [ ] Documentation is updated
- [ ] `.env.example` is updated (if env vars added)
- [ ] No secrets committed

## Example Test Workflows

### Testing New API Endpoint

```bash
# 1. Pull latest specs
npm run apidog:pull

# 2. Add/modify endpoint in apidog/api_specs/

# 3. Generate merged spec
npm run apidog:push:oas -- --force

# 4. Copy to tracked location
npm run oas:sync

# 5. Validate
npm run apidog:validate

# 6. Regenerate client (if needed)
npm run generate:api-hub-client
```

### Testing Model Registry Changes

```bash
# 1. Make changes to apis/model_registry/

# 2. Run type checking
npm run typecheck

# 3. Test the sync
npm run sync:model-registry

# 4. Verify output
ls -lh data/model_registry.json
jq 'length' data/model_registry.json
jq '.[0]' data/model_registry.json
```

### Testing Script Changes

```bash
# 1. Make changes to scripts/

# 2. Run type checking
npm run typecheck

# 3. Test the script directly
tsx scripts/your-script.ts

# 4. Verify side effects (files created, API calls, etc.)
```

## Future Testing Improvements

### Planned Enhancements

- [ ] **Unit Tests** - Add Jest or Vitest for unit testing
- [ ] **Integration Tests** - Test API integrations with mocks
- [ ] **E2E Tests** - Test complete workflows
- [ ] **Coverage Reports** - Track test coverage
- [ ] **Automated Tests in CI** - Run tests on every PR

### Testing Framework Candidates

- **Vitest** - Fast, modern test framework with TypeScript support
- **Jest** - Popular, well-documented testing framework
- **Node Test Runner** - Built-in Node.js testing (Node 18+)

### Example Test Structure (Future)

```
tests/
├── unit/
│   ├── model_registry.test.ts
│   └── apidog_scripts.test.ts
├── integration/
│   ├── api_hub.test.ts
│   └── fal_api.test.ts
├── e2e/
│   └── workflow.test.ts
└── fixtures/
    └── mock_data.json
```

## Environment Variables for Testing

Create a `.env.test` file for test-specific configuration:

```bash
# Mock API keys for testing (don't use real keys)
COMET_API_KEY="test_comet_key"
FAL_API_KEY="test_fal_key"
APIDOG_ACCESS_TOKEN="test_apidog_token"
APIDOG_PROJECT_ID="test_project"
```

**Note:** This file should be in `.gitignore` (already configured).

## CI/CD Testing

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

- ✅ Validates file structure
- ✅ Checks TypeScript configuration
- ✅ Runs linting
- ✅ Checks code formatting
- ✅ Scans for secrets in code
- ✅ Validates documentation exists

This runs automatically on push to `main` or `develop` branches and on all pull requests.

## Debugging Tips

### Enable Verbose Logging

Most scripts support environment variables for debugging:

```bash
DEBUG=* npm run your-script
NODE_ENV=development npm run your-script
```

### Inspect Network Requests

For API debugging, use tools like:

```bash
# View HTTP requests
curl -v https://api.cometapi.com/v1/models \
  -H "Authorization: Bearer $COMET_API_KEY"

# Or use httpie
http https://api.cometapi.com/v1/models \
  "Authorization: Bearer $COMET_API_KEY"
```

### TypeScript Debugging

Use Node.js debugger with tsx:

```bash
node --inspect-brk ./node_modules/.bin/tsx scripts/your-script.ts
```

Then attach a debugger (VS Code, Chrome DevTools, etc.).

## Contributing Tests

When contributing, please:

1. **Document your test approach** in PR description
2. **List commands you ran** to verify changes
3. **Include test output** if relevant
4. **Note any edge cases** you tested

See [CONTRIBUTING.md](../CONTRIBUTING.md) for more details.
