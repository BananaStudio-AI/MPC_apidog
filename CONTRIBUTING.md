# Contributing to BananaStudio API Hub

Thank you for your interest in contributing to the BananaStudio API Hub! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- API keys for Comet API and FAL Platform (for testing)
- Apidog account with access token

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/MPC_apidog.git
   cd MPC_apidog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Verify setup**
   ```bash
   npm run health:api-hub
   ```

## Development Workflow

### Branch Naming Convention

- Feature branches: `feature/your-feature-name`
- Bug fixes: `fix/bug-description`
- Documentation: `docs/what-you-updated`
- Refactoring: `refactor/what-you-refactored`

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow TypeScript best practices
   - Add comments for complex logic
   - Update relevant documentation

3. **Test your changes**
   ```bash
   # Run health checks
   npm run health:api-hub
   
   # Test specific functionality
   npm run sync:model-registry
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature X"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

## Submitting Changes

### Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots if applicable
   - Ensure all checks pass

### PR Checklist

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated (for significant changes)
- [ ] No merge conflicts
- [ ] Commits are clean and well-formatted

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer `const` over `let`
- Use explicit types for function parameters and return values
- Avoid `any` type unless absolutely necessary

### File Organization

```
scripts/        # Automation scripts
apis/           # API clients and services
docs/           # Documentation
openapi/        # OpenAPI specifications
```

### Error Handling

Always handle errors gracefully:

```typescript
try {
  await riskyOperation();
} catch (err: any) {
  console.error(`Operation failed: ${err.message}`);
  // Provide fallback or rethrow
}
```

### Environment Variables

- Never commit secrets or API keys
- Use `.env` for local development
- Document all required variables in `.env.example`
- Access via `process.env.VARIABLE_NAME`

## Testing

### Running Tests

```bash
# Health check
npm run health:api-hub

# Test model registry sync
npm run sync:model-registry

# Test client generation
npm run generate:api-hub-client
```

### Writing Tests

When adding new features, include tests:
- Unit tests for individual functions
- Integration tests for API interactions
- Document test requirements in the PR

## Documentation

### What to Document

- New features and APIs
- Configuration changes
- Breaking changes
- Migration guides
- Usage examples

### Where to Document

- **README.md** - Quick start and overview
- **docs/** - Detailed guides and architecture
- **CHANGELOG.md** - Version history
- **Code comments** - Complex logic explanations

### Documentation Style

- Use clear, concise language
- Include code examples
- Add diagrams where helpful
- Keep formatting consistent

## MCP Integration Guidelines

When working with MCP (Model Context Protocol):

1. **Query MCP first** - Don't hardcode API endpoints
2. **Use MCP tools** - Leverage Apidog MCP server
3. **Document MCP changes** - Update `mcp.json` and docs
4. **Test MCP connectivity** - Verify tools are accessible

```bash
# List available MCP tools
npm run apidog:list-tools

# Verify authentication
npm run apidog:auth-check
```

## Apidog Workflows

### Pulling Changes from Apidog

```bash
npm run apidog:pull
npm run oas:sync
```

### Pushing Changes to Apidog

```bash
npm run apidog:push:oas -- --force
npm run push:apidog
```

## Questions and Support

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the [docs/](./docs/) directory

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to BananaStudio API Hub! 🎉
