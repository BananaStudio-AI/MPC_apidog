#!/bin/bash
# Setup script for BananaStudio MCP server

if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ .env created. Please edit it with your credentials."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Check if credentials are set
if [ -z "$APIDOG_ACCESS_TOKEN" ] || [ -z "$APIDOG_PROJECT_ID" ]; then
    echo "❌ Missing credentials in .env file"
    echo "Please set APIDOG_ACCESS_TOKEN and APIDOG_PROJECT_ID"
    exit 1
fi

echo "🚀 Starting BananaStudio MCP Server..."
echo "   Project ID: $APIDOG_PROJECT_ID"
npx -y apidog-mcp-server@latest --project-id="$APIDOG_PROJECT_ID"
