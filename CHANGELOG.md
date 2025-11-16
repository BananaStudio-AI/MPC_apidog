# Changelog

All notable changes to the BananaStudio API Hub project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-16

### Added
- Strict provider separation with `/comet/*` and `/fal/*` endpoint paths
- TypeScript client auto-generation from OpenAPI 3.1 spec
- Unified model registry with 1,434+ models (568 LLMs + 866 creative models)
- MCP integration via Apidog MCP server
- Health monitoring scripts for API validation
- Comprehensive documentation suite
- Model registry sync capabilities
- FAL pricing estimation endpoints
- Production checklist and deployment guides

### Changed
- Reorganized repository structure for better maintainability
- Updated OpenAPI specification to version 2.0.0
- Enhanced MCP configuration with multi-server support
- Improved error handling in scripts

### Fixed
- API authentication flow for both Comet and FAL platforms
- Model catalog synchronization reliability
- TypeScript type safety across client implementations

## [1.0.0] - 2025-11-01

### Added
- Initial project setup
- Basic Apidog integration
- OpenAPI specification scaffolding
- Model catalog foundation
- Documentation framework

---

For detailed information about each version, see the [documentation](./docs/).
