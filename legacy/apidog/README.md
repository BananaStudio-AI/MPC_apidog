# Legacy Apidog Content

This directory contains the original Apidog/OpenAPI cloud-centric API Hub content. 

## Migration Notice

The repository has been migrated from a cloud-centric Apidog/OpenAPI architecture to a fully local Docker-based AI infrastructure.

### What's Moved Here

The following content has been preserved in this legacy directory:
- Original Apidog integration scripts
- Cloud-based API specifications
- Original OpenAPI/Comet/FAL integration documentation

### New Architecture

The new local-first architecture consists of:
- **ai-infra/**: Docker Compose configurations for local AI services
  - Dify (localhost)
  - Langflow (localhost:7860)
  - Activepieces (localhost:8080)
  - LiteLLM Gateway (localhost:4000)
- **mpc-api/**: Express.js/TypeScript service routing to LiteLLM
- All model calls now route through LiteLLM Gateway, not direct provider calls

### If You Need Legacy Functionality

If you need to use the original Apidog-based workflows:
1. Refer to the documentation in this directory
2. Note that environment variables and configurations may have changed
3. Consider migrating to the new local-first architecture

### Documentation

For the new architecture, see:
- Main README.md
- ai-infra/README.md
- mpc-api/README.md
- docs/LOCAL_INFRASTRUCTURE.md

Last Updated: 2025-11-18
