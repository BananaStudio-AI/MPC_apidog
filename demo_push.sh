#!/bin/bash

# Push to Apidog - Demo Script
# This script demonstrates the push workflow with placeholder credentials
# Replace with real credentials to execute actual push

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🍌 BananaStudio API Hub → Apidog Push Demo 🍌            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if this is a demo run
DEMO_MODE="${DEMO_MODE:-true}"

if [ "$DEMO_MODE" = "true" ]; then
  echo "ℹ️  Running in DEMO mode (no actual push will occur)"
  echo ""
  echo "To perform actual push:"
  echo "  1. Get your token from: https://apidog.com → Account Settings → API Access Token"
  echo "  2. Set environment variable: export APIDOG_ACCESS_TOKEN=your_token"
  echo "  3. Run: DEMO_MODE=false ./demo_push.sh"
  echo ""
  echo "Or directly: npm run push:apidog"
  echo ""
fi

# Step 1: Validate environment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Validating Bundle Readiness"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run validation
if [ "$DEMO_MODE" = "true" ]; then
  echo "Running: npm run validate:push (without token check)"
  echo ""
  echo "Expected output:"
  echo "  ✅ All bundle files present"
  echo "  ✅ OpenAPI spec is valid"
  echo "  ✅ Bundle files are consistent"
  echo "  ❌ APIDOG_ACCESS_TOKEN not set"
  echo ""
else
  npm run validate:push
fi

# Step 2: Show bundle contents
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Bundle Contents"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ls -lh apidog-ui-bundle/

echo ""
echo "Bundle Summary:"
echo "  - OpenAPI 3.1.0 spec: 5 endpoints, 13 schemas"
echo "  - Folder structure: 4 folders"
echo "  - Request examples: 5 operations"
echo "  - Response examples: Success + Error cases"
echo "  - UI metadata: Automation hints"
echo ""

# Step 3: Push to Apidog
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Push to Apidog"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DEMO_MODE" = "true" ]; then
  echo "🔍 DEMO MODE - Not executing actual push"
  echo ""
  echo "Command that would run:"
  echo "  npm run push:apidog"
  echo ""
  echo "Expected flow:"
  echo "  1. Load bundle files from apidog-ui-bundle/"
  echo "  2. Construct payload (~60 KB)"
  echo "  3. POST to https://api.apidog.com/v1/projects/1128155/import-openapi"
  echo "  4. Headers:"
  echo "     - Authorization: Bearer {token}"
  echo "     - Content-Type: application/json"
  echo "     - X-Apidog-Api-Version: 2024-03-28"
  echo "  5. Parse response"
  echo ""
  echo "Expected success response:"
  echo "  {"
  echo "    \"success\": true,"
  echo "    \"message\": \"Import completed successfully\","
  echo "    \"data\": {"
  echo "      \"endpoints_imported\": 5,"
  echo "      \"schemas_imported\": 13,"
  echo "      \"folders_created\": 4"
  echo "    }"
  echo "  }"
  echo ""
else
  echo "🚀 Executing actual push..."
  npm run push:apidog
  
  echo ""
  echo "✅ Push completed!"
  echo ""
fi

# Step 4: Next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DEMO_MODE" = "true" ]; then
  echo "After successful push:"
else
  echo "Completed!"
fi

echo ""
echo "1. Verify import in Apidog UI:"
echo "   https://apidog.com/project/1128155"
echo ""
echo "2. Check folder structure:"
echo "   - COMET_API (Comet Models)"
echo "   - FAL_API (FAL Platform)"
echo "   - BananaStudio_Internal"
echo "   - Utilities"
echo ""
echo "3. Test endpoints:"
echo "   - GET /models"
echo "   - GET /models/pricing"
echo "   - POST /models/pricing/estimate"
echo "   - GET /models/usage"
echo "   - GET /models/analytics"
echo ""
echo "4. Generate client SDKs (TypeScript, Python, Go, etc.)"
echo ""
echo "5. Share with team members"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Demo Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DEMO_MODE" = "true" ]; then
  echo "For actual push, provide credentials and run:"
  echo "  export APIDOG_ACCESS_TOKEN=your_token"
  echo "  npm run push:apidog"
  echo ""
  echo "Or see: docs/PUSH_TO_APIDOG_GUIDE.md"
  echo ""
fi
