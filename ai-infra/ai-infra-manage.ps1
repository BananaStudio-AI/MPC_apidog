#!/usr/bin/env pwsh
# AI Infrastructure Manager for Windows Docker Desktop
# Manages Dify, Langflow, Activepieces, LiteLLM, and MPC-API services

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'logs', 'health', 'network', 'clean')]
    [string]$Action = 'status',
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('all', 'dify', 'langflow', 'activepieces', 'litellm', 'mpc-api')]
    [string]$Service = 'all',
    
    [Parameter(Mandatory=$false)]
    [switch]$Follow
)

$ErrorActionPreference = "Stop"
$BaseDir = $PSScriptRoot
$NetworkName = "ai-infra-net"

# Service directories
$Services = @{
    'dify' = Join-Path $BaseDir 'dify'
    'langflow' = Join-Path $BaseDir 'langflow'
    'activepieces' = Join-Path $BaseDir 'activepieces'
    'litellm' = Join-Path $BaseDir 'litellm'
    'mpc-api' = Join-Path $BaseDir '..' 'mpc-api'
}

# Colors
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }

# Ensure Docker network exists
function Ensure-Network {
    Write-Info "Checking Docker network: $NetworkName"
    $networkExists = docker network ls --format '{{.Name}}' | Select-String -Pattern "^${NetworkName}$"
    
    if (-not $networkExists) {
        Write-Info "Creating Docker network: $NetworkName"
        docker network create $NetworkName | Out-Null
        Write-Success "Network created: $NetworkName"
    } else {
        Write-Success "Network exists: $NetworkName"
    }
}

# Get services to operate on
function Get-TargetServices {
    if ($Service -eq 'all') {
        return $Services.Keys
    }
    return @($Service)
}

# Start services
function Start-Services {
    Ensure-Network
    
    $targets = Get-TargetServices
    foreach ($svc in $targets) {
        $dir = $Services[$svc]
        if (-not (Test-Path $dir)) {
            Write-Warning "Service directory not found: $svc ($dir)"
            continue
        }
        
        Write-Info "Starting $svc..."
        Push-Location $dir
        try {
            docker compose up -d
            Write-Success "$svc started"
        } catch {
            Write-Error "Failed to start $svc: $_"
        } finally {
            Pop-Location
        }
    }
}

# Stop services
function Stop-Services {
    $targets = Get-TargetServices
    foreach ($svc in $targets) {
        $dir = $Services[$svc]
        if (-not (Test-Path $dir)) {
            Write-Warning "Service directory not found: $svc ($dir)"
            continue
        }
        
        Write-Info "Stopping $svc..."
        Push-Location $dir
        try {
            docker compose down
            Write-Success "$svc stopped"
        } catch {
            Write-Error "Failed to stop $svc: $_"
        } finally {
            Pop-Location
        }
    }
}

# Restart services
function Restart-Services {
    Stop-Services
    Start-Sleep -Seconds 2
    Start-Services
}

# Show service status
function Show-Status {
    Write-Info "Service Status"
    Write-Host ""
    
    $targets = Get-TargetServices
    foreach ($svc in $targets) {
        $dir = $Services[$svc]
        if (-not (Test-Path $dir)) {
            Write-Host "${svc}: " -NoNewline
            Write-Warning "Directory not found"
            continue
        }
        
        Push-Location $dir
        try {
            Write-Host "${svc}: " -NoNewline
            $containers = docker compose ps --format json 2>$null | ConvertFrom-Json
            if ($containers) {
                $running = ($containers | Where-Object { $_.State -eq 'running' }).Count
                $total = $containers.Count
                if ($running -eq $total -and $total -gt 0) {
                    Write-Success "Running ($running/$total containers)"
                } elseif ($running -gt 0) {
                    Write-Warning "Partial ($running/$total containers running)"
                } else {
                    Write-Host "Stopped" -ForegroundColor Gray
                }
            } else {
                Write-Host "Not deployed" -ForegroundColor Gray
            }
        } catch {
            Write-Host "Error checking status" -ForegroundColor Red
        } finally {
            Pop-Location
        }
    }
}

# Show logs
function Show-Logs {
    $targets = Get-TargetServices
    foreach ($svc in $targets) {
        $dir = $Services[$svc]
        if (-not (Test-Path $dir)) {
            Write-Warning "Service directory not found: $svc ($dir)"
            continue
        }
        
        Write-Info "Logs for $svc"
        Push-Location $dir
        try {
            if ($Follow) {
                docker compose logs -f --tail=50
            } else {
                docker compose logs --tail=50
            }
        } catch {
            Write-Error "Failed to get logs for $svc: $_"
        } finally {
            Pop-Location
        }
    }
}

# Health check
function Check-Health {
    Write-Info "Health Check"
    Write-Host ""
    
    $endpoints = @{
        'Dify' = 'http://localhost:80'
        'Dify API' = 'http://localhost:5001/health'
        'Langflow' = 'http://localhost:7860/health'
        'Activepieces' = 'http://localhost:8080/api/v1/health'
        'LiteLLM' = 'http://localhost:4000/health'
        'MPC-API' = 'http://localhost:3000/health'
    }
    
    foreach ($name in $endpoints.Keys) {
        $url = $endpoints[$name]
        Write-Host "${name}: " -NoNewline
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "OK"
            } else {
                Write-Warning "Status $($response.StatusCode)"
            }
        } catch {
            Write-Error "Unreachable"
        }
    }
}

# Show network info
function Show-Network {
    Write-Info "Docker Network: $NetworkName"
    Write-Host ""
    
    $networkExists = docker network ls --format '{{.Name}}' | Select-String -Pattern "^${NetworkName}$"
    if ($networkExists) {
        docker network inspect $NetworkName | ConvertFrom-Json | ForEach-Object {
            Write-Host "Containers on network:"
            $_.Containers.PSObject.Properties | ForEach-Object {
                Write-Host "  - $($_.Value.Name) ($($_.Value.IPv4Address))" -ForegroundColor Cyan
            }
        }
    } else {
        Write-Warning "Network does not exist"
    }
}

# Clean up
function Clean-All {
    Write-Warning "This will stop all services and remove volumes. Continue? (y/N)"
    $confirm = Read-Host
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Info "Cancelled"
        return
    }
    
    Write-Info "Stopping and removing all services..."
    $targets = Get-TargetServices
    foreach ($svc in $targets) {
        $dir = $Services[$svc]
        if (-not (Test-Path $dir)) {
            continue
        }
        
        Push-Location $dir
        try {
            docker compose down -v
        } catch {
            Write-Warning "Error cleaning $svc"
        } finally {
            Pop-Location
        }
    }
    
    Write-Info "Removing network..."
    docker network rm $NetworkName 2>$null
    Write-Success "Cleanup complete"
}

# Main execution
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   AI Infrastructure Manager" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

switch ($Action) {
    'start' { Start-Services }
    'stop' { Stop-Services }
    'restart' { Restart-Services }
    'status' { Show-Status }
    'logs' { Show-Logs }
    'health' { Check-Health }
    'network' { Show-Network }
    'clean' { Clean-All }
}

Write-Host ""
Write-Info "Done!"
