#!/bin/bash
#
# BananaStudio API Hub - Installation & Setup Script
# This script installs dependencies and configures the project
#

set -e  # Exit on error

echo "🍌 BananaStudio API Hub - Installation"
echo "======================================"
echo ""

# Check Node.js version
echo "🔍 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required"
    echo "   Current version: $(node -v)"
    echo "   Please upgrade from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed successfully"
echo ""

# Check/create .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your API keys:"
    echo "   - APIDOG_ACCESS_TOKEN  (from Team Settings → API Access Tokens)"
    echo "   - COMET_API_KEY         (for LLM access)"
    echo "   - FAL_API_KEY           (for creative AI models)"
    echo "   - APIDOG_PROJECT_ID     (default: 1128155)"
    echo ""
else
    echo "✓ .env file exists"
    echo ""
fi

# Verify TypeScript compilation
echo "🔍 Verifying TypeScript configuration..."
npx tsc --noEmit 2>/dev/null || echo "⚠️  TypeScript check skipped (may have errors)"
echo ""

# Verify OpenAPI spec exists
if [ -f openapi/api-hub.oas.json ]; then
    echo "✓ OpenAPI specification found"
else
    echo "⚠️  OpenAPI specification not found at openapi/api-hub.oas.json"
fi
echo ""

# Success message
echo "✅ Installation Complete!"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Configure environment variables:"
echo "   nano .env"
echo ""
echo "2. Test Apidog authentication (requires APIDOG_ACCESS_TOKEN):"
echo "   npm run apidog:auth-check"
echo ""
echo "3. Generate TypeScript client:"
echo "   npm run generate:api-hub-client"
echo ""
echo "4. Sync model registry (requires API keys):"
echo "   npm run sync:model-registry"
echo ""
echo "5. Run health check:"
echo "   npm run health:api-hub"
echo ""
echo "6. Setup MCP server (for VS Code/Cursor):"
echo "   ./setup-mcp.sh"
echo ""
echo "📖 Documentation:"
echo "   - README.md - Project overview"
echo "   - QUICK_REFERENCE_V2.md - Quick command reference"
echo "   - docs/ - Detailed documentation"
echo "   - CONTRIBUTING.md - Contribution guidelines"
echo ""
echo "Happy coding! 🚀"
