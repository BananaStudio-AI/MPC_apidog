#!/bin/bash

###############################################################################
# AI Infrastructure Stack - Deployment Script
# 
# This script copies the ai-infra configuration to ~/ai-infra and optionally
# starts all services.
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    log_info "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi

    log_success "Docker is running"
}

# Check port availability
check_ports() {
    log_info "Checking port availability..."
    
    local ports=(80 8080 7860)
    local conflicts=0
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"; then
            log_warning "Port $port is already in use"
            conflicts=$((conflicts + 1))
        fi
    done
    
    if [ $conflicts -gt 0 ]; then
        log_warning "Found $conflicts port conflict(s). You may need to adjust port mappings."
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    else
        log_success "All ports are available"
    fi
}

# Deploy configuration
deploy_config() {
    local source_dir="$1"
    local target_dir="$HOME/ai-infra"
    
    log_info "Deploying configuration to $target_dir..."
    
    # Create target directory
    mkdir -p "$target_dir"
    
    # Copy files
    if [ -d "$source_dir" ]; then
        cp -r "$source_dir"/* "$target_dir/" 2>/dev/null || true
        log_success "Configuration deployed to $target_dir"
    else
        log_error "Source directory $source_dir not found"
        exit 1
    fi
    
    # Verify files
    local services=("dify" "activepieces" "langflow")
    for service in "${services[@]}"; do
        if [ -f "$target_dir/$service/docker-compose.yml" ]; then
            log_success "✓ $service configuration found"
        else
            log_error "✗ $service configuration missing"
            exit 1
        fi
    done
}

# Start services
start_services() {
    local target_dir="$HOME/ai-infra"
    
    log_info "Starting services..."
    
    # Start Dify
    log_info "Starting Dify..."
    (cd "$target_dir/dify" && docker compose up -d) || {
        log_error "Failed to start Dify"
        return 1
    }
    log_success "Dify started"
    
    # Start Activepieces
    log_info "Starting Activepieces..."
    (cd "$target_dir/activepieces" && docker compose up -d) || {
        log_error "Failed to start Activepieces"
        return 1
    }
    log_success "Activepieces started"
    
    # Start Langflow
    log_info "Starting Langflow..."
    (cd "$target_dir/langflow" && docker compose up -d) || {
        log_error "Failed to start Langflow"
        return 1
    }
    log_success "Langflow started"
    
    log_success "All services started successfully"
}

# Show status
show_status() {
    local target_dir="$HOME/ai-infra"
    
    echo ""
    echo "========================================="
    echo "AI Infrastructure Stack - Status"
    echo "========================================="
    echo ""
    
    echo "Dify Status:"
    (cd "$target_dir/dify" && docker compose ps) || true
    echo ""
    
    echo "Activepieces Status:"
    (cd "$target_dir/activepieces" && docker compose ps) || true
    echo ""
    
    echo "Langflow Status:"
    (cd "$target_dir/langflow" && docker compose ps) || true
    echo ""
    
    echo "========================================="
    echo "Access URLs:"
    echo "========================================="
    echo "Dify:         http://localhost"
    echo "Activepieces: http://localhost:8080"
    echo "Langflow:     http://localhost:7860"
    echo ""
}

# Main function
main() {
    echo ""
    echo "========================================="
    echo "AI Infrastructure Stack - Setup"
    echo "========================================="
    echo ""
    
    # Determine source directory
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local source_dir="$script_dir"
    
    # If script is not in ai-infra directory, look for it
    if [ ! -f "$source_dir/dify/docker-compose.yml" ]; then
        if [ -d "$script_dir/../ai-infra" ]; then
            source_dir="$script_dir/../ai-infra"
        elif [ -d "$script_dir/ai-infra" ]; then
            source_dir="$script_dir/ai-infra"
        else
            log_error "Cannot find ai-infra directory"
            exit 1
        fi
    fi
    
    # Check prerequisites
    check_docker
    check_ports
    
    # Deploy configuration
    deploy_config "$source_dir"
    
    # Ask if user wants to start services
    echo ""
    read -p "Start all services now? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        start_services
        sleep 5
        show_status
        
        echo ""
        log_info "Services are starting up. It may take 1-2 minutes for all services to be fully ready."
        log_info "View logs with:"
        echo "  cd ~/ai-infra/dify && docker compose logs -f"
        echo "  cd ~/ai-infra/activepieces && docker compose logs -f"
        echo "  cd ~/ai-infra/langflow && docker compose logs -f"
        echo ""
    else
        log_info "Services not started. To start them manually, run:"
        echo "  cd ~/ai-infra/dify && docker compose up -d"
        echo "  cd ~/ai-infra/activepieces && docker compose up -d"
        echo "  cd ~/ai-infra/langflow && docker compose up -d"
        echo ""
    fi
    
    log_success "Setup complete! 🎉"
    log_info "For detailed documentation, see: ~/ai-infra/AI_INFRA_SETUP.md"
}

# Run main function
main "$@"
