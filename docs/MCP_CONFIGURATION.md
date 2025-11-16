# VS Code & Cursor MCP Configuration

This project is configured to work with Model Context Protocol (MCP) in both VS Code and Cursor editors.

## Configuration Files

### Root `mcp.json` (VS Code & Cursor)
Located at `/workspaces/MPC_apidog/mcp.json`:

```json
{
  "mcpServers": {
    "BananaStudio API Hub": {
      "command": "npx",
      "args": [
        "-y",
        "apidog-mcp-server@latest",
        "--project-id=1128155"
      ],
      "env": {
        "APIDOG_ACCESS_TOKEN": "${APIDOG_ACCESS_TOKEN}",
        "CURSOR_API_KEY": "${CURSOR_API_KEY}"
      }
    }
  }
}
```

**Environment Variable Substitution:**
- Variables like `${APIDOG_ACCESS_TOKEN}` are resolved from your shell environment or `.env` file
- Cursor and VS Code will read these when loading the MCP server

## Setup for VS Code

1. **Install Copilot Extension** (if not already installed)
2. **Environment variables**: Ensure `.env` is loaded in your terminal:
   ```bash
   set -a && source .env && set +a
   ```
3. **Restart VS Code** or reload window to pick up MCP config
4. **Verify**: The MCP server should appear in Copilot's available tools

### VS Code Settings (Optional)
You can also configure MCP servers in VS Code settings.json:

```json
{
  "github.copilot.advanced": {
    "mcp": {
      "servers": {
        "BananaStudio API Hub": {
          "command": "npx",
          "args": ["-y", "apidog-mcp-server@latest", "--project-id=1128155"],
          "env": {
            "APIDOG_ACCESS_TOKEN": "your-token-here"
          }
        }
      }
    }
  }
}
```

## Setup for Cursor

Cursor uses the same `mcp.json` format. 

1. **Ensure `mcp.json` is in project root** (already present)
2. **Load environment variables** in your terminal session:
   ```bash
   export APIDOG_ACCESS_TOKEN="your-token"
   export CURSOR_API_KEY="your-cursor-key"
   export APIDOG_PROJECT_ID="1128155"
   ```
3. **Restart Cursor** to load the MCP configuration
4. **Test**: Open Cursor Composer and check if "BananaStudio API Hub" tools are available

### Cursor-Specific Settings
Cursor also supports `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "BananaStudio API Hub": {
      "command": "npx",
      "args": ["-y", "apidog-mcp-server@latest", "--project-id=1128155"],
      "env": {
        "APIDOG_ACCESS_TOKEN": "${APIDOG_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Available MCP Tools

Once configured, both editors will expose these Apidog MCP tools:

- `read_project_oas_*` - Read full OpenAPI spec
- `read_project_oas_ref_resources_*` - Read $ref files
- `refresh_project_oas_*` - Refresh OAS from server

Run `npm run apidog:list-tools` to see exact tool names for your project.

## Troubleshooting

### MCP Server Not Loading
1. **Check token**: Run `npm run apidog:auth-check`
2. **Verify env vars**: `echo $APIDOG_ACCESS_TOKEN`
3. **Test MCP manually**:
   ```bash
   npx -y apidog-mcp-server@latest --project-id=1128155
   ```
4. **Check editor logs**:
   - VS Code: Output panel → GitHub Copilot
   - Cursor: Settings → MCP → View logs

### Token Format Issues
- Use **Bearer token** format (single string, no colons)
- Get from: Apidog → Account Settings → API Access Token
- Update `.env` and reload terminal

### Permission Errors
If you see "No project guest privilege":
- You're using an **account-level token** which lacks project access
- Generate a **team/workspace token** instead: Team Settings → Authorization → API Access Tokens
- Update `.env` with the new team token and reload

## Platform-Specific Notes

### Linux/macOS (Dev Containers)
```bash
# Load environment from .env
set -a && source .env && set +a

# Test MCP connection
npm run apidog:list-tools
```

### Windows (PowerShell)
```powershell
# Load environment variables
$env:APIDOG_ACCESS_TOKEN = "your-token"
$env:APIDOG_PROJECT_ID = "1128155"

# Test MCP connection  
npm run apidog:list-tools
```

### Windows (CMD)
```cmd
set APIDOG_ACCESS_TOKEN=your-token
set APIDOG_PROJECT_ID=1128155
npm run apidog:list-tools
```

## Integration with Scripts

The MCP configuration is also used by automation scripts:

```bash
# List available MCP tools
npm run apidog:list-tools

# Generate merged OAS via MCP
npm run apidog:push:oas -- --force

# Pull latest OAS from Apidog
npm run apidog:pull
```

All scripts automatically spawn the MCP server with credentials from environment variables.
