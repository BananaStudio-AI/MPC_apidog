#!/bin/bash
# Validation script for Docker infrastructure

set -e

echo "🔍 Docker Infrastructure Validation"
echo "===================================="
echo ""

# Check if docker is available
echo "1. Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi
echo "✓ Docker is installed"

# Check if docker compose is available
echo ""
echo "2. Checking Docker Compose..."
if docker compose version &> /dev/null; then
    echo "✓ Docker Compose (v2) is available"
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    echo "✓ docker-compose (v1) is available"
    COMPOSE_CMD="docker-compose"
else
    echo "❌ Docker Compose is not available"
    exit 1
fi

# Validate docker-compose.yml syntax
echo ""
echo "3. Validating docker-compose.yml..."
if $COMPOSE_CMD config > /dev/null 2>&1; then
    echo "✓ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has syntax errors"
    $COMPOSE_CMD config
    exit 1
fi

# Check required files
echo ""
echo "4. Checking required files..."
files=(
    "docker-compose.yml"
    "litellm_config.yaml"
    "ai-infra/mpc-api/Dockerfile"
    "ai-infra/mpc-api/package.json"
    "ai-infra/mpc-api/server.js"
    "ai-infra/mpc-api/errors.js"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file (missing)"
        all_exist=false
    fi
done

if [ "$all_exist" = false ]; then
    exit 1
fi

# Check LiteLLM config examples
echo ""
echo "5. Checking LiteLLM config examples..."
configs=(
    "ai-infra/litellm/config/openai-only.yaml"
    "ai-infra/litellm/config/anthropic-only.yaml"
    "ai-infra/litellm/config/multi-provider.yaml"
    "ai-infra/litellm/config/production-fallback.yaml"
)

all_configs_exist=true
for config in "${configs[@]}"; do
    if [ -f "$config" ]; then
        echo "  ✓ $config"
    else
        echo "  ❌ $config (missing)"
        all_configs_exist=false
    fi
done

if [ "$all_configs_exist" = false ]; then
    exit 1
fi

# Check documentation
echo ""
echo "6. Checking documentation..."
docs=(
    "docs/ARCHITECTURE_NEW.md"
    "ai-infra/README.md"
    "ai-infra/litellm/config/README.md"
)

all_docs_exist=true
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo "  ✓ $doc"
    else
        echo "  ❌ $doc (missing)"
        all_docs_exist=false
    fi
done

if [ "$all_docs_exist" = false ]; then
    exit 1
fi

# Check PowerShell script
echo ""
echo "7. Checking management script..."
if [ -f "ai-infra-manage.ps1" ]; then
    echo "  ✓ ai-infra-manage.ps1"
    if command -v pwsh &> /dev/null; then
        echo "  ✓ PowerShell is available"
        # Test help command
        if pwsh -File ai-infra-manage.ps1 help > /dev/null 2>&1; then
            echo "  ✓ Script executes successfully"
        else
            echo "  ⚠ Script may have issues (check manually)"
        fi
    else
        echo "  ⚠ PowerShell not available (script not tested)"
    fi
else
    echo "  ❌ ai-infra-manage.ps1 (missing)"
    exit 1
fi

# Validate error interface
echo ""
echo "8. Testing error interface..."
cd ai-infra/mpc-api
if node test-errors.js > /dev/null 2>&1; then
    echo "  ✓ Error interface works correctly"
else
    echo "  ❌ Error interface has issues"
    exit 1
fi
cd ../..

# Check .env.example
echo ""
echo "9. Checking environment template..."
if [ -f ".env.example" ]; then
    echo "  ✓ .env.example exists"
    # Check for required variables
    required_vars=(
        "OPENAI_API_KEY"
        "ANTHROPIC_API_KEY"
        "LITELLM_MASTER_KEY"
        "MPC_API_KEY"
    )
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "$var" .env.example; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        echo "  ✓ All required variables documented"
    else
        echo "  ⚠ Missing variables: ${missing_vars[*]}"
    fi
else
    echo "  ❌ .env.example (missing)"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ All validation checks passed!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and fill in API keys"
echo "2. Run: ./ai-infra-manage.ps1 up (Windows) or docker compose up -d (Linux/Mac)"
echo "3. Check health: ./ai-infra-manage.ps1 health or curl http://localhost:3000/health"
echo ""
