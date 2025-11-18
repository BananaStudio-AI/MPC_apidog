#!/usr/bin/env pwsh
<#
.SYNOPSIS
    AI Infrastructure Management Script for MPC-API and LiteLLM services

.DESCRIPTION
    Manages Docker Compose services for the AI infrastructure including
    MPC-API, LiteLLM Gateway, and Redis.

.EXAMPLE
    .\ai-infra-manage.ps1 up
    .\ai-infra-manage.ps1 logs
    .\ai-infra-manage.ps1 restart mpc-api
    .\ai-infra-manage.ps1 rebuild litellm

.NOTES
    Requires Docker and Docker Compose to be installed.
#>

param(
    [Parameter(Position = 0, Mandatory = $false)]
    [ValidateSet('up', 'down', 'restart', 'logs', 'ps', 'prune', 'reset', 'rebuild', 'health', 'help')]
    [string]$Command = 'help',
    
    [Parameter(Position = 1, Mandatory = $false)]
    [string]$Service = '',
    
    [Parameter(Mandatory = $false)]
    [switch]$Follow,
    
    [Parameter(Mandatory = $false)]
    [switch]$NoCache,
    
    [Parameter(Mandatory = $false)]
    [int]$Tail = 100
)

# Script configuration
$ComposeFile = "docker-compose.yml"
$EnvFile = ".env"

# Color output helpers
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }
    
    # Check Docker Compose
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Warning "docker-compose not found, checking for 'docker compose' plugin..."
        docker compose version 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker Compose is not available"
            exit 1
        }
        # Use docker compose (V2) instead of docker-compose
        Set-Alias -Name docker-compose -Value 'docker' -Scope Global
        $global:UseComposeV2 = $true
    }
    
    # Check compose file exists
    if (-not (Test-Path $ComposeFile)) {
        Write-Error "Docker Compose file not found: $ComposeFile"
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Execute docker-compose command
function Invoke-DockerCompose {
    param([string[]]$Arguments)
    
    if ($global:UseComposeV2) {
        docker compose @Arguments
    } else {
        docker-compose @Arguments
    }
}

# Start services
function Start-Services {
    Write-Info "Starting AI infrastructure services..."
    
    if ($Service) {
        Invoke-DockerCompose up -d $Service
    } else {
        Invoke-DockerCompose up -d
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services started successfully"
        Start-Sleep -Seconds 2
        Show-Status
    } else {
        Write-Error "Failed to start services"
        exit 1
    }
}

# Stop services
function Stop-Services {
    Write-Info "Stopping AI infrastructure services..."
    
    if ($Service) {
        Invoke-DockerCompose stop $Service
    } else {
        Invoke-DockerCompose down
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services stopped successfully"
    } else {
        Write-Error "Failed to stop services"
        exit 1
    }
}

# Restart services
function Restart-Services {
    Write-Info "Restarting services..."
    
    if ($Service) {
        Invoke-DockerCompose restart $Service
    } else {
        Invoke-DockerCompose restart
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services restarted successfully"
        Start-Sleep -Seconds 2
        Show-Status
    } else {
        Write-Error "Failed to restart services"
        exit 1
    }
}

# Show logs
function Show-Logs {
    Write-Info "Showing logs..."
    
    $logArgs = @('logs')
    
    if ($Follow) {
        $logArgs += '--follow'
    }
    
    if ($Tail -gt 0) {
        $logArgs += "--tail=$Tail"
    }
    
    if ($Service) {
        $logArgs += $Service
    }
    
    Invoke-DockerCompose $logArgs
}

# Show service status
function Show-Status {
    Write-Info "Service Status:"
    Invoke-DockerCompose ps
}

# Prune unused resources
function Invoke-Prune {
    Write-Warning "This will remove stopped containers, unused networks, and dangling images."
    $confirmation = Read-Host "Continue? (y/N)"
    
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
        Write-Info "Prune cancelled"
        return
    }
    
    Write-Info "Pruning Docker resources..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused networks
    docker network prune -f
    
    # Remove dangling images
    docker image prune -f
    
    Write-Success "Prune completed"
}

# Reset everything
function Invoke-Reset {
    Write-Warning "This will stop all services, remove containers, volumes, and networks."
    Write-Warning "All data will be lost!"
    $confirmation = Read-Host "Are you sure? (yes/N)"
    
    if ($confirmation -ne 'yes') {
        Write-Info "Reset cancelled"
        return
    }
    
    Write-Info "Resetting AI infrastructure..."
    
    # Stop and remove everything
    Invoke-DockerCompose down -v --remove-orphans
    
    # Additional cleanup
    Write-Info "Removing dangling images..."
    docker image prune -f
    
    Write-Success "Reset completed"
}

# Rebuild services
function Invoke-Rebuild {
    Write-Info "Rebuilding services..."
    
    $buildArgs = @('build')
    
    if ($NoCache) {
        $buildArgs += '--no-cache'
    }
    
    if ($Service) {
        $buildArgs += $Service
    }
    
    Invoke-DockerCompose $buildArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build completed successfully"
        Write-Info "Restarting services with new images..."
        Start-Services
    } else {
        Write-Error "Build failed"
        exit 1
    }
}

# Check health status
function Test-Health {
    Write-Info "Checking service health..."
    
    $services = @('litellm', 'mpc-api', 'redis')
    
    foreach ($svc in $services) {
        $health = docker inspect --format='{{.State.Health.Status}}' "$svc-gateway" 2>$null
        if (-not $health) {
            $health = docker inspect --format='{{.State.Health.Status}}' "$svc" 2>$null
        }
        
        if ($health -eq 'healthy') {
            Write-Success "$svc is healthy"
        } elseif ($health -eq 'starting') {
            Write-Info "$svc is starting..."
        } elseif ($health) {
            Write-Warning "$svc is $health"
        } else {
            Write-Warning "$svc is not running or has no healthcheck"
        }
    }
    
    Write-Host ""
    Show-Status
}

# Show help
function Show-Help {
    Write-Host @"

AI Infrastructure Management Script
====================================

Usage: .\ai-infra-manage.ps1 <command> [service] [options]

Commands:
  up          Start all services (or specific service)
  down        Stop and remove all services
  restart     Restart all services (or specific service)
  logs        Show logs for all services (or specific service)
  ps          Show service status
  prune       Remove stopped containers and unused resources
  reset       Stop all services and remove all data (DESTRUCTIVE)
  rebuild     Rebuild service images and restart
  health      Check health status of all services
  help        Show this help message

Services:
  litellm     LiteLLM Gateway
  mpc-api     MPC-API Service
  redis       Redis Cache

Options:
  -Follow     Follow log output (for logs command)
  -NoCache    Build without cache (for rebuild command)
  -Tail <n>   Show last n lines of logs (default: 100)

Examples:
  .\ai-infra-manage.ps1 up
  .\ai-infra-manage.ps1 logs mpc-api -Follow
  .\ai-infra-manage.ps1 restart litellm
  .\ai-infra-manage.ps1 rebuild mpc-api -NoCache
  .\ai-infra-manage.ps1 logs -Tail 50
  .\ai-infra-manage.ps1 health

Environment:
  Configure services using .env file in the same directory.
  Required variables: OPENAI_API_KEY, ANTHROPIC_API_KEY, LITELLM_MASTER_KEY

"@
}

# Main execution
function Main {
    if ($Command -eq 'help') {
        Show-Help
        return
    }
    
    Test-Prerequisites
    
    switch ($Command) {
        'up'      { Start-Services }
        'down'    { Stop-Services }
        'restart' { Restart-Services }
        'logs'    { Show-Logs }
        'ps'      { Show-Status }
        'prune'   { Invoke-Prune }
        'reset'   { Invoke-Reset }
        'rebuild' { Invoke-Rebuild }
        'health'  { Test-Health }
        default   { Show-Help }
    }
}

# Run main function
Main
