# Deployment Checklist

Comprehensive validation checklist for verifying that the AI infrastructure stack is ready for use.

## Pre-Deployment

### System Requirements
- [ ] Windows 10/11 with WSL 2 enabled
- [ ] Docker Desktop installed and running
- [ ] Docker Desktop has at least 8GB RAM allocated
- [ ] Docker Desktop has at least 4 CPUs allocated
- [ ] At least 100GB free disk space available
- [ ] PowerShell 5.1 or later available

### Repository Setup
- [ ] Repository cloned to local machine
- [ ] `.env` file created and configured in root directory
- [ ] `.env` file created and configured in `mpc-api/` directory
- [ ] All required API keys configured:
  - [ ] `OPENAI_API_KEY` (if using OpenAI models)
  - [ ] `ANTHROPIC_API_KEY` (if using Claude models)
  - [ ] `LITELLM_MASTER_KEY` (set to custom value or use default)

## Infrastructure Deployment

### Docker Network
- [ ] Docker network `ai-infra-net` exists
  ```powershell
  docker network ls | Select-String "ai-infra-net"
  ```

### Service Deployment
Run deployment command:
```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action start
```

- [ ] Dify containers started (db, redis, api, worker, web, nginx)
- [ ] Langflow container started
- [ ] Activepieces containers started (postgres, redis, activepieces)
- [ ] LiteLLM container started
- [ ] MPC-API container started

### Container Health Checks
Verify all containers are healthy:
```powershell
.\ai-infra-manage.ps1 -Action status
```

- [ ] All containers show status "Up" (not "Restarting" or "Exited")
- [ ] No error messages in status output

## Service Connectivity Tests

### Dify (http://localhost)
- [ ] Dify web interface loads without errors
- [ ] Can access setup/login page
- [ ] No 502 Bad Gateway or connection errors

```powershell
curl http://localhost/health
# Expected: 200 OK
```

### Langflow (http://localhost:7860)
- [ ] Langflow web interface loads
- [ ] Can create a new flow
- [ ] UI is responsive

```powershell
curl http://localhost:7860/health
# Expected: 200 OK
```

### Activepieces (http://localhost:8080)
- [ ] Activepieces web interface loads
- [ ] Can access setup page or login
- [ ] No database connection errors

```powershell
curl http://localhost:8080/api/v1/health
# Expected: 200 OK with JSON response
```

### LiteLLM Gateway (http://localhost:4000)
- [ ] Health check responds successfully
- [ ] Models endpoint returns list of models
- [ ] Authentication works (if LITELLM_MASTER_KEY is set)

```powershell
# Health check
curl http://localhost:4000/health
# Expected: 200 OK with JSON response

# List models
curl http://localhost:4000/models
# Expected: 200 OK with array of models
```

### MPC-API (http://localhost:3000)
- [ ] Health check responds successfully
- [ ] Reports LiteLLM connectivity status
- [ ] Models endpoint returns data

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
# Expected: status: "ok", checks.litellm: "ok"

# List models
Invoke-RestMethod -Uri "http://localhost:3000/api/models" -Method GET
# Expected: Array of model objects
```

## Integration Tests

### MPC-API → LiteLLM Chat Completion
Test that MPC-API can successfully proxy requests to LiteLLM:

```powershell
$body = @{
    model = "gpt-4o-mini"
    messages = @(
        @{ role = "user"; content = "Say 'test successful'" }
    )
    max_tokens = 20
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/chat/completions" -Method POST -Body $body -ContentType "application/json"

Write-Host "Response: $($response.choices[0].message.content)"
```

- [ ] Request succeeds without errors
- [ ] Response contains valid completion
- [ ] Response includes usage statistics
- [ ] No timeout or connection errors

### LiteLLM Direct Chat Completion
Test LiteLLM gateway directly:

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer sk-1234" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 20
  }'
```

- [ ] Request succeeds without errors
- [ ] Response contains valid completion
- [ ] Provider API key is valid
- [ ] No rate limit or authentication errors

### Dify → LiteLLM Connection
- [ ] Open Dify at http://localhost
- [ ] Navigate to Settings → Model Providers
- [ ] Add custom provider with URL: `http://litellm:4000`
- [ ] Test connection succeeds
- [ ] Can select models from LiteLLM

### Langflow → MPC-API Connection
- [ ] Open Langflow at http://localhost:7860
- [ ] Create a new flow with LLM component
- [ ] Configure LLM to use custom endpoint: `http://mpc-api:3000/api/chat/completions`
- [ ] Run flow successfully
- [ ] Verify output is generated

## Service-to-Service Communication

### Docker Network Communication
Test that services can resolve each other by name:

```powershell
# Test from MPC-API container
docker exec mpc-api-mpc-api-1 wget -qO- http://litellm:4000/health

# Test from Langflow container
docker exec ai-infra-langflow-langflow-1 wget -qO- http://mpc-api:3000/health
```

- [ ] Services can reach each other using service names (not localhost)
- [ ] DNS resolution works within ai-infra-net network
- [ ] No network connection timeouts

## Log Verification

Check logs for any errors or warnings:

```powershell
# MPC-API logs
.\ai-infra-manage.ps1 -Action logs -Service mpc-api
# Look for: startup messages, no connection errors

# LiteLLM logs
.\ai-infra-manage.ps1 -Action logs -Service litellm
# Look for: config loaded, no API key errors

# Dify logs
cd dify
docker-compose logs api --tail=50
# Look for: migrations complete, no database errors
```

- [ ] No critical errors in MPC-API logs
- [ ] No critical errors in LiteLLM logs
- [ ] No database connection errors in Dify logs
- [ ] No redis connection errors in any service
- [ ] All migrations completed successfully

## Data Persistence

### Volume Verification
Verify that data volumes are created:

```powershell
docker volume ls | Select-String "dify|langflow|activepieces|litellm"
```

- [ ] `dify_db_data` volume exists
- [ ] `dify_redis_data` volume exists
- [ ] `dify_app_storage` volume exists
- [ ] `langflow_data` volume exists
- [ ] `activepieces_db_data` volume exists
- [ ] `activepieces_redis_data` volume exists
- [ ] `litellm_logs` volume exists

### Restart Persistence Test
- [ ] Stop all services: `.\ai-infra-manage.ps1 -Action stop`
- [ ] Start all services: `.\ai-infra-manage.ps1 -Action start`
- [ ] Data persists (any configured settings remain)
- [ ] No data loss or corruption

## Performance Validation

### Resource Usage
```powershell
docker stats --no-stream --filter "network=ai-infra-net"
```

- [ ] No container using >90% CPU continuously
- [ ] No container using >90% available memory
- [ ] All containers show reasonable resource usage

### Response Times
- [ ] MPC-API health check responds in <1 second
- [ ] LiteLLM health check responds in <1 second
- [ ] Chat completion requests complete in <30 seconds (depending on model)
- [ ] Web interfaces load in <5 seconds

## Security Validation

### API Keys
- [ ] All API keys are stored in `.env` files (not hardcoded)
- [ ] `.env` files are in `.gitignore`
- [ ] `LITELLM_MASTER_KEY` is set (not using default in production)
- [ ] No API keys visible in logs

### Network Isolation
- [ ] Services only expose intended ports to host
- [ ] Internal services (db, redis) not exposed to host
- [ ] All services on same Docker network for inter-service communication

## Documentation Validation

- [ ] `AI_INFRA_SETUP.md` instructions are accurate
- [ ] `QUICK_REFERENCE.md` examples work as documented
- [ ] All service URLs in documentation are correct
- [ ] PowerShell commands execute without errors

## Post-Deployment

### User Access
- [ ] Team members can access service URLs from their machines
- [ ] Credentials shared securely (if any services require login)
- [ ] Documentation shared with team

### Monitoring Setup
- [ ] Consider setting up log aggregation (optional)
- [ ] Document how to check service status
- [ ] Create alerts for service failures (optional)

### Backup Plan
- [ ] Document backup procedure for volumes
- [ ] Schedule regular backups (if needed)
- [ ] Test restore procedure

## Troubleshooting Verification

Test common troubleshooting steps work:

- [ ] Can view logs: `.\ai-infra-manage.ps1 -Action logs -Service [name]`
- [ ] Can restart service: `.\ai-infra-manage.ps1 -Action restart -Service [name]`
- [ ] Can stop all services: `.\ai-infra-manage.ps1 -Action stop`
- [ ] Can clean up: `.\ai-infra-manage.ps1 -Action clean` (test carefully)

## Sign-Off

### Deployment Team
- [ ] Infrastructure deployed by: _________________ Date: _______
- [ ] Integration tests completed by: _____________ Date: _______
- [ ] Documentation reviewed by: _________________ Date: _______

### Issues & Notes
Document any issues encountered and their resolutions:

```
Issue: 
Resolution: 

Issue: 
Resolution: 
```

### Final Approval
- [ ] All critical checks passed
- [ ] All integration tests successful
- [ ] System ready for use

---

**Deployment Status**: ☐ Ready ☐ Needs Attention ☐ Blocked

**Completed By**: _____________________ **Date**: ___________

---

**Version**: 1.0.0  
**Last Updated**: November 2025
