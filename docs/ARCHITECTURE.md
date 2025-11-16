# Repository Architecture

## Folder Structure

```
MPC_apidog/
├── .github/               # GitHub workflows, agents, copilot instructions
├── agents/                # Agent definitions (YAML frontmatter)
├── apidog/                # Apidog MCP integration
│   ├── api_specs/         # Extracted endpoint specs (working directory)
│   ├── generated/         # Generated files (not tracked in git)
│   ├── mcp/               # MCP server configs
│   ├── scripts/           # Apidog automation scripts
│   │   ├── pull_endpoints_oas.js    # Pull OAS from Apidog
│   │   ├── push_endpoints_oas.js    # Merge & generate OAS
│   │   ├── push_oas_api.js          # Push via REST API
│   │   ├── list_tools.js            # List MCP tools
│   │   └── ...
│   └── types/             # TypeScript definitions
├── apis/                  # Generated API clients (tracked)
│   └── README.md
├── docs/                  # Documentation (tracked)
│   ├── README.md
│   ├── APIDOG_WORKFLOWS.md
│   ├── MCP_CONFIGURATION.md
│   └── TASK_COMPLETION_SUMMARY.md
├── mcp/                   # Project MCP configs
├── openapi/               # OpenAPI specs (tracked)
│   ├── README.md
│   ├── oas_raw.json       # Latest from Apidog
│   └── oas_merged.json    # Merged with local changes
├── scripts/               # Project automation scripts (tracked)
│   ├── README.md
│   └── copy_oas_to_tracked.js
├── .env                   # Environment variables (not tracked)
├── .gitignore
├── mcp.json               # VS Code/Cursor MCP config
├── package.json
└── README.md
```

## Directory Purposes

### `/openapi/` ⭐ NEW
**Purpose**: Versioned OpenAPI specifications  
**Tracked**: ✅ Yes  
**Contents**:
- `oas_raw.json` - Latest OAS pulled from Apidog
- `oas_merged.json` - Merged OAS ready for import

**Workflow**:
```bash
npm run apidog:pull          # Fetch OAS
npm run oas:sync             # Copy to openapi/
git add openapi/
```

### `/apis/` ⭐ NEW
**Purpose**: Generated API client code  
**Tracked**: ✅ Yes  
**Contents**: TypeScript/Python/Go clients (future)

**Workflow**:
```bash
npm run generate:client:ts   # Generate TypeScript client (future)
```

### `/scripts/` ⭐ NEW
**Purpose**: Project-level automation  
**Tracked**: ✅ Yes  
**Contents**:
- `copy_oas_to_tracked.js` - Sync generated OAS to tracked location
- Future: deployment, CI/CD, batch processing

### `/apidog/`
**Purpose**: Apidog MCP integration (existing)  
**Tracked**: ✅ Yes (except `/generated/`)  
**Contents**:
- `scripts/` - MCP automation (pull/push workflows)
- `api_specs/` - Extracted endpoint specs (working directory)
- `generated/` - Temporary generated files (not tracked)

### `/docs/`
**Purpose**: Project documentation  
**Tracked**: ✅ Yes  
**Contents**:
- `APIDOG_WORKFLOWS.md` - Pull/push workflow guide
- `MCP_CONFIGURATION.md` - VS Code/Cursor setup

### `/agents/`
**Purpose**: Custom agent definitions  
**Tracked**: ✅ Yes  
**Contents**: `.agent.md` files with YAML frontmatter

## Key Files

### Tracked (Version Control)
- `openapi/*.json` - OpenAPI specs
- `apis/` - Generated clients
- `scripts/*.js` - Automation scripts
- `docs/*.md` - Documentation
- `apidog/api_specs/*.json` - Endpoint specs
- `mcp.json` - MCP configuration
- `package.json` - Dependencies & scripts

### Not Tracked (.gitignore)
- `.env` - Secrets
- `node_modules/` - Dependencies
- `apidog/generated/` - Temporary generated files
- `dist/`, `build/` - Build outputs

## npm Scripts

### Apidog MCP Workflows
```bash
npm run apidog:pull          # Pull OAS from Apidog (saves to apidog/generated/)
npm run apidog:push:oas      # Dry-run merge
npm run apidog:push:oas -- --force  # Generate merged OAS
npm run apidog:push:api      # Attempt REST API import
npm run apidog:list-tools    # List available MCP tools
npm run apidog:auth-check    # Verify token
```

### OAS Management
```bash
npm run oas:sync             # Copy generated OAS to openapi/
```

### Future Scripts
```bash
npm run generate:client:ts   # Generate TypeScript client
npm run generate:client:py   # Generate Python client
```

## Workflow: Pull Latest OAS

```bash
# 1. Pull from Apidog
npm run apidog:pull
# Output: apidog/generated/oas_raw.json

# 2. Copy to tracked location
npm run oas:sync
# Copies to: openapi/oas_raw.json

# 3. Commit changes
git add openapi/ apidog/api_specs/
git commit -m "chore: update OpenAPI specs from Apidog"
```

## Workflow: Push Local Changes

```bash
# 1. Edit endpoint specs in apidog/api_specs/

# 2. Generate merged OAS
npm run apidog:push:oas -- --force
# Output: apidog/generated/oas_merged.json

# 3. Copy to tracked location
npm run oas:sync
# Copies to: openapi/oas_merged.json

# 4. Import to Apidog
# Option A: Manual UI import
# Option B: npm run apidog:push:api

# 5. Commit merged spec
git add openapi/oas_merged.json
git commit -m "feat: add new endpoint X"
```

## Why This Structure?

### Separation of Concerns
- **Working directory**: `apidog/` - Apidog-specific tooling
- **Tracked artifacts**: `openapi/`, `apis/` - Versioned outputs
- **Automation**: `scripts/` - Project-level utilities
- **Documentation**: `docs/` - Centralized docs

### Version Control Best Practices
- Track generated outputs (`openapi/`, `apis/`) for reproducibility
- Ignore temporary files (`apidog/generated/`)
- Keep secrets out of git (`.env`)

### Discoverability
- Clear README files in each directory
- Consistent naming conventions
- Comprehensive documentation in `docs/`

## Migration Notes

### From Old Structure
The repository already had:
- `/apidog/` folder with scripts
- `/docs/` with some documentation
- `/apis/`, `/scripts/` (empty)

### Added/Reorganized
1. Created `/openapi/` for tracked OAS files
2. Added README files to empty directories
3. Created `scripts/copy_oas_to_tracked.js` for syncing
4. Added `oas:sync` npm script
5. Updated `.gitignore` to explicitly allow `openapi/` and `apis/`
6. Created comprehensive workflow documentation

### No Breaking Changes
- All existing `apidog:*` scripts still work
- `apidog/generated/` remains as temporary storage
- `apidog/api_specs/` continues as working directory
