# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### How to Report

**Please DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, report security vulnerabilities privately:

1. **Email**: Send details to security@bananastudio.ai
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Assessment**: We'll assess the vulnerability within 5 business days
- **Updates**: We'll keep you informed of our progress
- **Resolution**: We'll work on a fix and coordinate disclosure timing with you
- **Credit**: We'll credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using BananaStudio API Hub:

### API Keys and Secrets

- **Never commit** API keys, tokens, or secrets to version control
- Use `.env` files for local development (included in `.gitignore`)
- Use environment variables or secure secret management in production
- Rotate API keys regularly
- Use different keys for development and production

### Environment Variables

Required secrets that should **never** be committed:

```bash
COMET_API_KEY=         # Comet API authentication
FAL_API_KEY=           # FAL Platform authentication
APIDOG_ACCESS_TOKEN=   # Apidog MCP server access
OPENAI_API_KEY=        # OpenAI API (if using agents)
```

### Code Security

- Keep dependencies up to date: `npm audit`
- Review OpenAPI specifications before importing to Apidog
- Validate input data in scripts and API calls
- Use TypeScript strict mode for type safety
- Follow principle of least privilege for API permissions

### Network Security

- Use HTTPS for all API communications
- Verify SSL certificates
- Implement rate limiting for API calls
- Use authentication tokens, not basic auth
- Monitor API usage for anomalies

### MCP Server Security

- Validate MCP tool permissions before use
- Use project-specific API tokens (not account-wide tokens)
- Review MCP server configurations in `mcp.json`
- Audit MCP tool access regularly

## Known Security Considerations

### API Rate Limits

- Comet API: Respect rate limits (documented in API docs)
- FAL Platform: Paginated requests include built-in rate limiting
- Implement exponential backoff for failed requests

### Data Privacy

- Model metadata is public information
- Usage analytics may contain sensitive patterns
- Local `data/model_registry.json` contains API responses (review before sharing)

### Dependencies

We use automated dependency scanning. Key dependencies:

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `@openai/agents` - OpenAI agents SDK
- `apidog-mcp-server` - Apidog MCP integration

Run security audits:

```bash
npm audit
npm audit fix
```

## Security Updates

### Notification

Security advisories will be published:
- GitHub Security Advisories
- CHANGELOG.md with `[SECURITY]` tag
- Email to registered users (if applicable)

### Patching

- Critical vulnerabilities: Patch within 48 hours
- High severity: Patch within 1 week
- Medium/Low: Included in next regular release

## Scope

### In Scope

- Authentication and authorization issues
- API key exposure risks
- Dependency vulnerabilities
- Code injection vulnerabilities
- Data validation issues
- MCP server security concerns

### Out of Scope

- Third-party API security (Comet, FAL, Apidog)
- Social engineering attacks
- Physical security
- Denial of Service attacks on public APIs

## Compliance

This project aims to follow:

- OWASP Top 10 security principles
- npm security best practices
- TypeScript security guidelines
- OpenAPI security standards

## Security Tooling

We recommend using:

```bash
# Audit dependencies
npm audit

# Check for outdated packages
npm outdated

# Validate TypeScript compilation
npx tsc --noEmit

# Validate OpenAPI specs
npm run validate:oas
```

## Contact

For security concerns: security@bananastudio.ai

For general support: support@bananastudio.ai

---

**Last Updated**: November 16, 2025
