# Automation Scripts

Standalone automation scripts for the BananaStudio API Hub project.

## Purpose

This directory contains project-level automation that doesn't belong in the `apidog/` subdirectory:
- CI/CD pipeline scripts
- Deployment automation
- Data migration scripts
- Batch processing utilities

## Apidog-Specific Scripts

For Apidog MCP and API management scripts, see:
- `apidog/scripts/` - MCP integration, pull/push workflows
- npm scripts in `package.json`

## Common Scripts (Future)

- `deploy.sh` - Deploy to production
- `sync_vector_store.js` - Sync model metadata to Pinecone
- `generate_clients.sh` - Generate all API clients at once
