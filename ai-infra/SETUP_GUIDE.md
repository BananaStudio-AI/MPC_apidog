# Setup Guide - Local AI Infrastructure

Step-by-step guide to set up the BananaStudio local AI infrastructure on Windows with Docker Desktop.

## Prerequisites

### Required
- **Windows 10/11** with WSL2 enabled
- **Docker Desktop** for Windows (version 4.0+)
- **PowerShell** 5.1 or PowerShell Core 7+
- **Node.js** 20+ (for MPC-API development)
- **1TB disk space** available

### API Keys
You'll need at least one LLM provider API key:
- **OpenAI API Key**: https://platform.openai.com/api-keys
- **Anthropic API Key**: https://console.anthropic.com/

## Step 1: Install Docker Desktop

1. Download Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Install and launch Docker Desktop
3. Enable WSL2 backend (default on Windows 11)
4. Configure resources:
   - **Memory**: 8GB minimum (16GB recommended)
   - **CPUs**: 4 minimum (8 recommended)
   - **Disk**: Ensure 1TB is available

Verify installation:
```powershell
docker --version
docker compose version
```

## Step 2: Clone Repository

```powershell
git clone https://github.com/BananaStudio-AI/MPC_apidog.git
cd MPC_apidog
```

## Step 3: Configure Environment

1. Copy the template:
   ```powershell
   cp .env.template .env
   ```

2. Edit `.env` and add your API keys:
   ```powershell
   notepad .env
   ```

3. **Required variables:**
   ```bash
   # At least one provider key is required
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   
   # PostgreSQL password (change for production)
   POSTGRES_PASSWORD=your-secure-password
   
   # Dify secret key (change for production)
   DIFY_SECRET_KEY=your-secure-dify-key
   ```

4. **Optional variables:**
   ```bash
   # LiteLLM authentication (optional)
   LITELLM_MASTER_KEY=your-master-key
   
   # Activepieces secrets (change for production)
   ACTIVEPIECES_API_KEY=your-random-string
   ACTIVEPIECES_ENCRYPTION_KEY=your-random-string
   ACTIVEPIECES_JWT_SECRET=your-random-string
   ```

## Step 4: Create Docker Network

```powershell
docker network create ai-infra-net
```

Verify:
```powershell
docker network ls | findstr ai-infra-net
```

## Step 5: Start Services

### Option A: Start All Services (Recommended)

```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action start -Service all
```

This will start:
- Dify (and dependencies)
- Langflow (and dependencies)
- Activepieces (and dependencies)
- LiteLLM Gateway
- MPC-API

### Option B: Start Services Individually

```powershell
cd ai-infra

# Start LiteLLM first (foundation)
cd litellm
docker compose up -d
cd ..

# Start MPC-API (depends on LiteLLM)
cd ../mpc-api
docker compose up -d
cd ../ai-infra

# Start other services as needed
cd dify
docker compose up -d
cd ../langflow
docker compose up -d
cd ../activepieces
docker compose up -d
```

## Step 6: Verify Installation

### Check Service Status

```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action status
```

Expected output:
```
ℹ️  Service Status

dify: ✅ Running (5/5 containers)
langflow: ✅ Running (2/2 containers)
activepieces: ✅ Running (3/3 containers)
litellm: ✅ Running (1/1 containers)
mpc-api: ✅ Running (2/2 containers)
```

### Run Health Checks

```powershell
.\ai-infra-manage.ps1 -Action health
```

Expected output:
```
ℹ️  Health Check

Dify: ✅ OK
Dify API: ✅ OK
Langflow: ✅ OK
Activepieces: ✅ OK
LiteLLM: ✅ OK
MPC-API: ✅ OK
```

### Manual Health Checks

```powershell
# Test LiteLLM
curl http://localhost:4000/health

# Test MPC-API
curl http://localhost:3000/health

# Test Dify API
curl http://localhost:5001/health
```

## Step 7: Run Integration Tests

```powershell
cd ..  # Back to root directory
node test_mpc_api_litellm.mjs
```

Expected output:
```
═══════════════════════════════════════════════════
   MPC-API ↔ LiteLLM Integration Tests
═══════════════════════════════════════════════════

✅ Health check passed
✅ LiteLLM health check passed
✅ Models endpoint passed
✅ Chat completions endpoint passed
✅ Error handling works correctly
✅ Service-to-service routing works correctly

═══════════════════════════════════════════════════
   Test Summary
═══════════════════════════════════════════════════

✅ All 6 tests passed! 🎉
```

## Step 8: Access Services

Open your browser and access:

| Service | URL | Description |
|---------|-----|-------------|
| **Dify** | http://localhost | LLM app development |
| **Langflow** | http://localhost:7860 | Visual AI workflows |
| **Activepieces** | http://localhost:8080 | Workflow automation |
| **LiteLLM** | http://localhost:4000/health | Gateway health |
| **MPC-API** | http://localhost:3000/health | Proxy health |

### First-Time Setup for UI Services

#### Dify
1. Navigate to http://localhost
2. Create admin account on first visit
3. Configure model providers in settings

#### Langflow
1. Navigate to http://localhost:7860
2. Create account or use local mode
3. Start building visual workflows

#### Activepieces
1. Navigate to http://localhost:8080
2. Create admin account
3. Configure pieces and connections

## Troubleshooting

### Services Won't Start

**Problem:** `docker compose up -d` fails

**Solutions:**
1. Check Docker Desktop is running
2. Verify `.env` file exists and has required keys
3. Check logs:
   ```powershell
   cd ai-infra
   .\ai-infra-manage.ps1 -Action logs -Service <service-name>
   ```
4. Try starting services one by one

### Port Conflicts

**Problem:** Port already in use (e.g., "bind: address already in use")

**Solutions:**
1. Find process using the port:
   ```powershell
   netstat -ano | findstr :<port>
   ```
2. Kill the process:
   ```powershell
   taskkill /PID <pid> /F
   ```
3. Or change the port in docker-compose.yml:
   ```yaml
   ports:
     - "3001:3000"  # Use 3001 instead of 3000
   ```

### Network Not Found

**Problem:** "network ai-infra-net not found"

**Solution:**
```powershell
docker network create ai-infra-net
```

### Out of Memory

**Problem:** Services crashing with OOM errors

**Solutions:**
1. Increase Docker Desktop memory:
   - Open Docker Desktop
   - Settings → Resources → Memory
   - Increase to 16GB (or more)
2. Stop unused services:
   ```powershell
   cd ai-infra
   .\ai-infra-manage.ps1 -Action stop -Service <unused-service>
   ```

### Database Connection Errors

**Problem:** "connection refused" or "could not connect to database"

**Solutions:**
1. Check database containers are running:
   ```powershell
   docker ps | findstr postgres
   ```
2. Wait for databases to initialize (can take 30-60 seconds on first start)
3. Check logs:
   ```powershell
   cd ai-infra/dify
   docker compose logs dify-db
   ```

### API Key Not Working

**Problem:** LiteLLM returns 401 or authentication errors

**Solutions:**
1. Verify keys in `.env`:
   ```powershell
   type .env | findstr API_KEY
   ```
2. Ensure no spaces or quotes around keys
3. Restart LiteLLM after changing keys:
   ```powershell
   cd ai-infra
   .\ai-infra-manage.ps1 -Action restart -Service litellm
   ```

### Integration Tests Fail

**Problem:** `test_mpc_api_litellm.mjs` fails

**Solutions:**
1. Ensure all services are running:
   ```powershell
   cd ai-infra
   .\ai-infra-manage.ps1 -Action health
   ```
2. Check you have valid API keys in `.env`
3. Verify MPC-API can reach LiteLLM:
   ```powershell
   docker exec mpc-api wget -qO- http://litellm:4000/health
   ```

## Common Tasks

### Stop All Services

```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action stop -Service all
```

### Restart a Service

```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action restart -Service mpc-api
```

### View Logs

```powershell
# All logs
cd ai-infra
.\ai-infra-manage.ps1 -Action logs -Service all

# Specific service
.\ai-infra-manage.ps1 -Action logs -Service litellm

# Follow logs in real-time
.\ai-infra-manage.ps1 -Action logs -Service mpc-api -Follow
```

### Update Services

```powershell
cd ai-infra/litellm
docker compose pull
docker compose up -d

# Repeat for other services
```

### Clean Up (Remove All Data)

```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action clean
```

**Warning:** This removes all containers, volumes, and data!

### Backup Data

```powershell
# Backup Dify database
docker run --rm -v dify-db-data:/data -v ${PWD}:/backup alpine tar czf /backup/dify-backup.tar.gz /data

# Backup Langflow database
docker run --rm -v langflow-db-data:/data -v ${PWD}:/backup alpine tar czf /backup/langflow-backup.tar.gz /data
```

## Next Steps

### 1. Explore Dify
- Create your first LLM application
- Configure custom model providers
- Build multi-agent workflows

### 2. Build with Langflow
- Design visual AI pipelines
- Connect to MPC-API for model access
- Export and deploy flows

### 3. Automate with Activepieces
- Create automation workflows
- Integrate with external services (Notion, etc.)
- Use MPC-API for AI capabilities

### 4. Develop with MPC-API
- Build custom applications using MPC-API
- See `mpc-api/README.md` for API documentation
- Test with `test_mpc_api_litellm.mjs`

## Additional Resources

- [Local Infrastructure Architecture](../docs/LOCAL_INFRASTRUCTURE.md)
- [MPC-API Documentation](../mpc-api/README.md)
- [AI Infrastructure README](README.md)
- [Activepieces Integration Guide](../docs/ACTIVEPIECES_MCP_API_INTEGRATION.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs with `.\ai-infra-manage.ps1 -Action logs`
3. Consult service-specific documentation
4. Open an issue on GitHub

---

**Last Updated:** 2025-11-18
