# AI Infrastructure Management Script for Windows + Docker Desktop
# Usage: .\ai-infra-manage.ps1 -Action [start|stop|restart|status|logs]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "clean")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "dify", "langflow", "activepieces", "litellm", "mpc-api")]
    [string]$Service = "all"
)

# Script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-ErrorMsg { Write-Host $args -ForegroundColor Red }

# Check if Docker is running
function Test-DockerRunning {
    try {
        docker info > $null 2>&1
        return $?
    }
    catch {
        return $false
    }
}

# Create shared network if it doesn't exist
function Initialize-Network {
    $networkExists = docker network ls --format "{{.Name}}" | Select-String -Pattern "^ai-infra-net$"
    if (-not $networkExists) {
        Write-Info "Creating shared Docker network: ai-infra-net"
        docker network create ai-infra-net
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ Network created successfully"
        } else {
            Write-ErrorMsg "✗ Failed to create network"
            exit 1
        }
    } else {
        Write-Info "Network ai-infra-net already exists"
    }
}

# Service directories
$Services = @{
    "dify" = "dify"
    "langflow" = "langflow"
    "activepieces" = "activepieces"
    "litellm" = "litellm"
    "mpc-api" = "../mpc-api"
}

# Start services
function Start-Services {
    param([string]$ServiceName)
    
    Write-Info "Starting service(s): $ServiceName"
    Initialize-Network
    
    if ($ServiceName -eq "all") {
        foreach ($svc in $Services.Keys) {
            Start-SingleService $svc
        }
    } else {
        Start-SingleService $ServiceName
    }
    
    Write-Success "`n✓ Services started. Run with -Action status to check health."
}

function Start-SingleService {
    param([string]$ServiceName)
    
    $servicePath = $Services[$ServiceName]
    if (-not $servicePath) {
        Write-ErrorMsg "Unknown service: $ServiceName"
        return
    }
    
    Write-Info "Starting $ServiceName..."
    Push-Location $servicePath
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Success "  ✓ $ServiceName started"
    } else {
        Write-ErrorMsg "  ✗ $ServiceName failed to start"
    }
    Pop-Location
}

# Stop services
function Stop-Services {
    param([string]$ServiceName)
    
    Write-Info "Stopping service(s): $ServiceName"
    
    if ($ServiceName -eq "all") {
        foreach ($svc in $Services.Keys) {
            Stop-SingleService $svc
        }
    } else {
        Stop-SingleService $ServiceName
    }
    
    Write-Success "`n✓ Services stopped"
}

function Stop-SingleService {
    param([string]$ServiceName)
    
    $servicePath = $Services[$ServiceName]
    if (-not $servicePath) {
        Write-ErrorMsg "Unknown service: $ServiceName"
        return
    }
    
    Write-Info "Stopping $ServiceName..."
    Push-Location $servicePath
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Success "  ✓ $ServiceName stopped"
    } else {
        Write-ErrorMsg "  ✗ $ServiceName failed to stop"
    }
    Pop-Location
}

# Show status
function Show-Status {
    Write-Info "Docker Container Status:`n"
    docker ps --filter "network=ai-infra-net" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    Write-Info "`nService URLs:"
    Write-Host "  Dify:          http://localhost" -ForegroundColor White
    Write-Host "  Langflow:      http://localhost:7860" -ForegroundColor White
    Write-Host "  Activepieces:  http://localhost:8080" -ForegroundColor White
    Write-Host "  LiteLLM:       http://localhost:4000" -ForegroundColor White
    Write-Host "  MPC-API:       http://localhost:3000" -ForegroundColor White
}

# Show logs
function Show-Logs {
    param([string]$ServiceName)
    
    if ($ServiceName -eq "all") {
        Write-Warning "Please specify a service for logs: -Service [dify|langflow|activepieces|litellm|mpc-api]"
        return
    }
    
    $servicePath = $Services[$ServiceName]
    if (-not $servicePath) {
        Write-ErrorMsg "Unknown service: $ServiceName"
        return
    }
    
    Write-Info "Showing logs for $ServiceName (Ctrl+C to exit)..."
    Push-Location $servicePath
    docker-compose logs -f --tail=100
    Pop-Location
}

# Clean up (stop and remove volumes)
function Clean-All {
    Write-Warning "This will stop all services and remove volumes. Continue? (y/N)"
    $confirm = Read-Host
    if ($confirm -ne "y") {
        Write-Info "Cancelled"
        return
    }
    
    Write-Info "Cleaning up services..."
    foreach ($svc in $Services.Keys) {
        $servicePath = $Services[$svc]
        Write-Info "Cleaning $svc..."
        Push-Location $servicePath
        docker-compose down -v
        Pop-Location
    }
    
    Write-Success "✓ Cleanup complete"
}

# Main execution
Write-Host "`n=== AI Infrastructure Manager ===" -ForegroundColor Magenta
Write-Host "Action: $Action | Service: $Service`n" -ForegroundColor Magenta

# Check Docker
if (-not (Test-DockerRunning)) {
    Write-ErrorMsg "✗ Docker is not running. Please start Docker Desktop."
    exit 1
}

# Execute action
switch ($Action) {
    "start" { Start-Services $Service }
    "stop" { Stop-Services $Service }
    "restart" { 
        Stop-Services $Service
        Start-Sleep -Seconds 3
        Start-Services $Service
    }
    "status" { Show-Status }
    "logs" { Show-Logs $Service }
    "clean" { Clean-All }
}

Write-Host ""
