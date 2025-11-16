# Contributing to BananaStudio API Hub

Thank you for your interest in contributing to the BananaStudio API Hub! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm 8+ installed
- Git installed and configured
- Access to required API keys (Apidog, FAL, Comet)

### Setup Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MPC_apidog.git
   cd MPC_apidog
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API credentials
   ```

4. **Verify setup:**
   ```bash
   npm run apidog:auth-check
   ```

## 📝 Development Workflow

### Branch Naming Convention

- `feature/your-feature-name` - New features
- `fix/issue-description` - Bug fixes
- `docs/what-you-updated` - Documentation updates
- `refactor/what-you-refactored` - Code refactoring
- `test/what-you-tested` - Test additions

### Making Changes

1. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow existing code style
   - Use ES modules (`import`/`export`)
   - Add error handling where appropriate
   - Update documentation if needed

3. **Test your changes:**
   ```bash
   # Run relevant scripts to test functionality
   npm run apidog:pull
   npm run sync:model-registry
   npm run health:api-hub
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: Add new feature description"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Test additions
   - `chore:` Maintenance tasks

5. **Push and create pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎯 Code Style Guidelines

### JavaScript/TypeScript

- Use ES2022+ features
- Prefer `const` over `let`, avoid `var`
- Use async/await over callbacks
- Add JSDoc comments for exported functions
- Handle errors explicitly with try/catch

**Example:**
```javascript
/**
 * Fetches models from the API with error handling
 * @param {string} apiKey - API authentication key
 * @returns {Promise<Array>} Array of model records
 */
export async function fetchModels(apiKey) {
  try {
    const response = await fetch(API_URL, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch models:', error.message);
    return [];
  }
}
```

### File Organization

- Place API integrations in `apis/`
- Automation scripts go in `scripts/`
- Apidog-specific code in `apidog/`
- Documentation in `docs/`

### Naming Conventions

- Use `camelCase` for variables and functions
- Use `PascalCase` for classes and types
- Use `UPPER_SNAKE_CASE` for constants
- Use descriptive names (e.g., `fetchCometModels` not `fetchCM`)

## 🧪 Testing

While we don't currently have automated tests, please:

1. **Manually test your changes:**
   - Run affected scripts
   - Verify output is correct
   - Check error handling works

2. **Test edge cases:**
   - Missing API keys
   - Network failures
   - Invalid responses

3. **Document test steps:**
   - Add testing instructions to PR description
   - List commands you ran to verify

## 📚 Documentation

### When to Update Documentation

Update documentation when you:
- Add new scripts or features
- Change existing workflows
- Add new environment variables
- Modify API integrations
- Update dependencies

### Documentation Files

- `README.md` - Overview and quick start
- `docs/ARCHITECTURE.md` - Repository structure
- `docs/APIDOG_WORKFLOWS.md` - Apidog workflows
- `docs/MCP_CONFIGURATION.md` - MCP setup
- Inline code comments - Complex logic

### Documentation Style

- Use clear, concise language
- Include code examples
- Add command line examples
- Use proper markdown formatting
- Keep information up-to-date

## 🔍 Code Review Process

### What Reviewers Look For

- Code follows style guidelines
- Changes are well-documented
- Error handling is appropriate
- No breaking changes (unless necessary)
- Tests pass (when available)
- Documentation is updated

### Responding to Feedback

- Be responsive to review comments
- Make requested changes promptly
- Ask questions if feedback is unclear
- Update PR description if scope changes

## 🐛 Reporting Bugs

### Before Submitting

1. Check existing issues
2. Verify it's reproducible
3. Test with latest code

### Bug Report Template

```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Run command X
2. Expected Y
3. Got Z instead

**Environment:**
- Node.js version: 
- npm version:
- Operating System:

**Logs/Error Messages:**
```
[paste relevant logs]
```

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened
```

## 💡 Suggesting Enhancements

### Enhancement Request Template

```markdown
**Feature Description:**
Clear description of proposed feature

**Use Case:**
Why is this needed?

**Proposed Solution:**
How would you implement it?

**Alternatives Considered:**
Other approaches you've thought about
```

## 🔐 Security

- Never commit API keys or secrets
- Use `.env` for sensitive data
- Review `.gitignore` before committing
- Report security issues privately

## 📧 Questions?

- Review documentation in `docs/`
- Check existing issues
- Ask in pull request comments

## 🙏 Thank You!

Your contributions help make BananaStudio API Hub better for everyone!
