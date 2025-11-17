#!/bin/bash

###############################################################################
# AI Infrastructure Stack - Validation Script
# 
# Validates all configuration files and checks for common issues
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; WARNINGS=$((WARNINGS + 1)); }
log_error() { echo -e "${RED}[✗]${NC} $1"; ERRORS=$((ERRORS + 1)); }

validate_file() {
    local file="$1"
    local desc="$2"
    
    if [ -f "$file" ]; then
        log_success "$desc exists"
        return 0
    else
        log_error "$desc missing: $file"
        return 1
    fi
}

validate_docker_compose() {
    local file="$1"
    local service="$2"
    
    if ! docker compose -f "$file" config > /dev/null 2>&1; then
        log_error "$service docker-compose.yml has syntax errors"
        return 1
    else
        log_success "$service docker-compose.yml is valid"
        return 0
    fi
}

validate_env_file() {
    local file="$1"
    local service="$2"
    
    if [ ! -f "$file" ]; then
        log_error "$service .env file missing"
        return 1
    fi
    
    # Check for empty required variables
    local required_vars=()
    case "$service" in
        "Dify")
            required_vars=("DB_PASSWORD" "REDIS_PASSWORD" "SECRET_KEY")
            ;;
        "Activepieces")
            required_vars=("AP_POSTGRES_PASSWORD" "AP_REDIS_PASSWORD" "AP_ENCRYPTION_KEY" "AP_JWT_SECRET" "MPC_API_BASE_URL" "MPC_API_KEY")
            ;;
        "Langflow")
            required_vars=("LANGFLOW_PORT")
            ;;
    esac
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$file"; then
            log_warning "$service .env missing variable: $var"
        fi
    done
    
    log_success "$service .env file validated"
}

check_port_conflicts() {
    log_info "Checking for port conflicts..."
    
    local ports=(80:Dify 8080:Activepieces 7860:Langflow)
    
    for port_service in "${ports[@]}"; do
        local port="${port_service%%:*}"
        local service="${port_service##*:}"
        
        if command -v lsof > /dev/null 2>&1; then
            if lsof -Pi ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
                log_warning "Port $port ($service) is already in use"
            else
                log_success "Port $port ($service) is available"
            fi
        else
            log_info "Cannot check port $port (lsof not available)"
        fi
    done
}

main() {
    echo ""
    echo "========================================="
    echo "AI Infrastructure Stack - Validation"
    echo "========================================="
    echo ""
    
    # Determine base directory
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local base_dir="$script_dir"
    
    # If running from deployed location
    if [ "$base_dir" = "$HOME/ai-infra" ]; then
        log_info "Validating deployed configuration at $base_dir"
    else
        log_info "Validating repository configuration at $base_dir"
    fi
    
    echo ""
    log_info "=== Validating Dify ==="
    validate_file "$base_dir/dify/docker-compose.yml" "Dify docker-compose.yml"
    validate_file "$base_dir/dify/.env" "Dify .env"
    validate_file "$base_dir/dify/nginx.conf" "Dify nginx.conf"
    validate_docker_compose "$base_dir/dify/docker-compose.yml" "Dify"
    validate_env_file "$base_dir/dify/.env" "Dify"
    
    echo ""
    log_info "=== Validating Activepieces ==="
    validate_file "$base_dir/activepieces/docker-compose.yml" "Activepieces docker-compose.yml"
    validate_file "$base_dir/activepieces/.env" "Activepieces .env"
    validate_docker_compose "$base_dir/activepieces/docker-compose.yml" "Activepieces"
    validate_env_file "$base_dir/activepieces/.env" "Activepieces"
    
    echo ""
    log_info "=== Validating Langflow ==="
    validate_file "$base_dir/langflow/docker-compose.yml" "Langflow docker-compose.yml"
    validate_file "$base_dir/langflow/.env" "Langflow .env"
    validate_docker_compose "$base_dir/langflow/docker-compose.yml" "Langflow"
    validate_env_file "$base_dir/langflow/.env" "Langflow"
    
    echo ""
    log_info "=== Validating Documentation ==="
    validate_file "$base_dir/README.md" "Main README"
    validate_file "$base_dir/AI_INFRA_SETUP.md" "Setup Guide"
    validate_file "$base_dir/dify/README.md" "Dify README"
    validate_file "$base_dir/activepieces/README.md" "Activepieces README"
    validate_file "$base_dir/langflow/README.md" "Langflow README"
    
    echo ""
    check_port_conflicts
    
    echo ""
    echo "========================================="
    echo "Validation Summary"
    echo "========================================="
    
    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        log_success "All checks passed! ✓"
        echo ""
        log_info "Configuration is ready for deployment"
        echo ""
        log_info "Next steps:"
        echo "  1. Review the .env files and adjust if needed"
        echo "  2. Run: ./deploy.sh"
        echo "  3. Or manually copy to ~/ai-infra and start services"
        exit 0
    elif [ $ERRORS -eq 0 ]; then
        log_warning "Validation completed with $WARNINGS warning(s)"
        echo ""
        log_info "Configuration is usable but review warnings above"
        exit 0
    else
        log_error "Validation failed with $ERRORS error(s) and $WARNINGS warning(s)"
        echo ""
        log_info "Please fix the errors above before deployment"
        exit 1
    fi
}

main "$@"
