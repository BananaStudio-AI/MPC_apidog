# Local AI Infrastructure Stack - Complete Setup Guide

This guide provides a comprehensive setup for three essential AI development services running on Docker Desktop.

## 🎯 Overview

| Service | Purpose | URL | Port |
|---------|---------|-----|------|
| **Dify** | LLM app platform with workflows & RAG | http://localhost | 80 |
| **Activepieces** | No-code automation & workflow engine | http://localhost:8080 | 8080 |
| **Langflow** | Visual RAG & multi-agent builder | http://localhost:7860 | 7860 |

## 📋 Prerequisites

### System Requirements
- **Docker Desktop** installed and running
- **RAM**: 8GB+ recommended (4GB minimum)
- **Disk Space**: 10GB+ free space
- **OS**: macOS, Windows (with WSL2), or Linux

### Port Requirements
Ensure these ports are available:
- **80** - Dify web interface
- **8080** - Activepieces UI
- **7860** - Langflow UI
- (Optional) **3000** - MPC-API service for Activepieces integration

### Check Port Availability

```bash
# macOS / Linux
lsof -i :80 -i :8080 -i :7860

# Windows PowerShell
netstat -ano | findstr "80 8080 7860"
```

If ports are in use, either:
1. Stop the conflicting services
2. Modify the port mappings in docker-compose.yml files

## 🚀 Quick Start (All Services)

```bash
# Create base directory
mkdir -p ~/ai-infra
cd ~/ai-infra

# Clone or copy configuration files to:
# ~/ai-infra/dify/
# ~/ai-infra/activepieces/
# ~/ai-infra/langflow/

# Start all services (run each in separate terminal or use screen/tmux)
cd ~/ai-infra/dify && docker compose up -d
cd ~/ai-infra/activepieces && docker compose up -d
cd ~/ai-infra/langflow && docker compose up -d
```

## 📦 Service-Specific Setup

### A. Dify Setup

**Location:** `~/ai-infra/dify`

#### Files Required
- `docker-compose.yml` - Defines 6 services (db, redis, api, worker, web, nginx)
- `.env` - Configuration with safe defaults
- `nginx.conf` - Reverse proxy configuration

#### Environment Variables (.env)
```bash
# Database
DB_USERNAME=dify
DB_PASSWORD=dify_password_local_dev_12345
DB_DATABASE=dify

# Redis
REDIS_PASSWORD=dify_redis_local_dev_67890

# Application (CHANGE FOR PRODUCTION!)
SECRET_KEY=dify-secret-key-local-dev-abc123xyz789-change-me
```

#### Startup Commands
```bash
cd ~/ai-infra/dify

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs (all services)
docker compose logs -f --tail=200 db redis api web nginx

# View specific service
docker compose logs -f api
```

#### Health Check Indicators

**Database (db):**
```
LOG:  database system is ready to accept connections
```

**Redis (redis):**
```
* Ready to accept connections
```

**API (api):**
```
INFO:     Uvicorn running on http://0.0.0.0:5001
INFO:     Application startup complete
```

**Worker (worker):**
```
[INFO] celery@hostname ready.
```

**Web (web):**
```
ready - started server on 0.0.0.0:3000
```

**Nginx (nginx):**
```
nginx: [notice] start worker processes
```

#### Verification
```bash
# Test health endpoint
curl http://localhost/health
# Should return: healthy

# Access web UI
open http://localhost
```

---

### B. Activepieces Setup

**Location:** `~/ai-infra/activepieces`

#### Files Required
- `docker-compose.yml` - Defines 3 services (postgres, redis, activepieces)
- `.env` - Configuration including MPC-API integration

#### Environment Variables (.env)

**Database & Redis:**
```bash
AP_POSTGRES_USER=activepieces
AP_POSTGRES_PASSWORD=activepieces_pg_local_dev_secure_12345
AP_POSTGRES_DATABASE=activepieces

AP_REDIS_PASSWORD=activepieces_redis_local_dev_secure_67890
```

**Security Keys (CHANGE FOR PRODUCTION!):**
```bash
AP_ENCRYPTION_KEY=activepieces-encryption-key-local-dev-must-be-32-chars-minimum-abc123
AP_JWT_SECRET=activepieces-jwt-secret-local-dev-change-in-production-xyz789-secure
AP_API_KEY=activepieces-api-key-local-dev-change-in-production-secure-key-123
```

**MPC-API Integration (per ACTIVEPIECES_MCP_API_INTEGRATION.md):**
```bash
MPC_API_BASE_URL=http://host.docker.internal:3000
MPC_API_KEY=mpc-api-secure-key-local-dev-change-in-production-12345
MPC_API_TIMEOUT=120000
```

#### Startup Commands
```bash
cd ~/ai-infra/activepieces

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f activepieces postgres redis

# View specific service
docker compose logs -f activepieces
```

#### Health Check Indicators

**PostgreSQL (postgres):**
```
LOG:  database system is ready to accept connections
```

**Redis (redis):**
```
* Ready to accept connections
```

**Activepieces (activepieces):**
```
Application started successfully
Listening on port 80
Database migrations completed
```

#### Verification
```bash
# Test API health
curl http://localhost:8080/api/v1/health

# Access web UI
open http://localhost:8080

# Test MPC-API connectivity (if running)
docker compose exec activepieces curl http://host.docker.internal:3000/health
```

#### MPC-API Integration Usage

In Activepieces flows, use these patterns:

**HTTP Request Step:**
```
Method: POST
URL: {{env.MPC_API_BASE_URL}}/generate/script

Headers:
  Content-Type: application/json
  Authorization: Bearer {{env.MPC_API_KEY}}

Body:
{
  "prompt": "{{trigger.data}}",
  "duration": 60
}

Timeout: 120000
```

See `docs/ACTIVEPIECES_MCP_API_INTEGRATION.md` for complete endpoint documentation.

---

### C. Langflow Setup

**Location:** `~/ai-infra/langflow`

#### Files Required
- `docker-compose.yml` - Defines 1 service (langflow)
- `.env` - Configuration with optional LiteLLM integration

#### Environment Variables (.env)
```bash
# Server
LANGFLOW_HOST=0.0.0.0
LANGFLOW_PORT=7860
LANGFLOW_LOG_LEVEL=INFO

# Database (SQLite in volume)
LANGFLOW_DATABASE_URL=sqlite:////app/langflow/langflow.db

# Optional: LiteLLM Gateway (uncomment to use)
# LITELLM_BASE_URL=http://host.docker.internal:4000
# LITELLM_API_KEY=sk-local-dev-litellm-key-change-me
```

#### Startup Commands
```bash
cd ~/ai-infra/langflow

# Start service
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f langflow

# View recent logs
docker compose logs --tail=100 langflow
```

#### Health Check Indicators

**Langflow (langflow):**
```
INFO:     Uvicorn running on http://0.0.0.0:7860
INFO:     Application startup complete
```

Or:
```
Starting Langflow on http://0.0.0.0:7860
Langflow is ready!
```

#### Verification
```bash
# Test health endpoint
curl http://localhost:7860/health

# Access web UI
open http://localhost:7860
```

---

## 🎛️ Consolidated Management Commands

### Start All Services
```bash
# Option 1: Sequential (recommended for first run)
cd ~/ai-infra/dify && docker compose up -d && \
cd ~/ai-infra/activepieces && docker compose up -d && \
cd ~/ai-infra/langflow && docker compose up -d

# Option 2: Parallel (using background jobs)
(cd ~/ai-infra/dify && docker compose up -d) &
(cd ~/ai-infra/activepieces && docker compose up -d) &
(cd ~/ai-infra/langflow && docker compose up -d) &
wait
```

### Check All Services
```bash
echo "=== Dify Status ===" && \
cd ~/ai-infra/dify && docker compose ps && \
echo -e "\n=== Activepieces Status ===" && \
cd ~/ai-infra/activepieces && docker compose ps && \
echo -e "\n=== Langflow Status ===" && \
cd ~/ai-infra/langflow && docker compose ps
```

### View All Logs
```bash
# Separate terminal windows recommended, or use tmux/screen

# Terminal 1: Dify
cd ~/ai-infra/dify && docker compose logs -f --tail=50

# Terminal 2: Activepieces
cd ~/ai-infra/activepieces && docker compose logs -f --tail=50

# Terminal 3: Langflow
cd ~/ai-infra/langflow && docker compose logs -f --tail=50
```

### Stop All Services
```bash
cd ~/ai-infra/dify && docker compose down && \
cd ~/ai-infra/activepieces && docker compose down && \
cd ~/ai-infra/langflow && docker compose down
```

### Update All Services
```bash
# Pull latest images
cd ~/ai-infra/dify && docker compose pull && \
cd ~/ai-infra/activepieces && docker compose pull && \
cd ~/ai-infra/langflow && docker compose pull

# Recreate with new images
cd ~/ai-infra/dify && docker compose up -d --force-recreate && \
cd ~/ai-infra/activepieces && docker compose up -d --force-recreate && \
cd ~/ai-infra/langflow && docker compose up -d --force-recreate
```

---

## ⚠️ Warnings & Prerequisites

### Port Conflicts

**Port 80 (Dify):**
- Most common conflict: Apache, Nginx, or other web servers
- Solution: Stop conflicting service or change Dify port mapping
  ```yaml
  # In dify/docker-compose.yml nginx service:
  ports:
    - "8000:80"  # Use 8000 instead
  ```

**Port 8080 (Activepieces):**
- Common conflict: Development servers, Jenkins, other apps
- Solution: Change port mapping in activepieces/docker-compose.yml
  ```yaml
  ports:
    - "8081:80"  # Use 8081 instead
  ```

**Port 7860 (Langflow):**
- Less common, but check for other AI tools
- Solution: Change port in langflow/docker-compose.yml

### Docker Resources

**Minimum Requirements:**
- RAM: 8GB (4GB may work but expect slowness)
- Disk: 10GB free space
- CPU: 2+ cores recommended

**Configure Docker Desktop:**
1. Open Docker Desktop Settings
2. Resources → Advanced
3. Set Memory to 8GB+ (or at least 6GB)
4. Set Disk to 20GB+
5. Click "Apply & Restart"

### Network Connectivity

**host.docker.internal:**
- Works on macOS and Windows
- On Linux (Docker 20.10+), add to docker-compose.yml:
  ```yaml
  extra_hosts:
    - "host.docker.internal:host-gateway"
  ```
- Alternative: Use actual IP address or Docker bridge IP (172.17.0.1)

### Data Persistence

All services use Docker volumes for data persistence:
- **Dify**: `db_data`, `redis_data`, `api_storage`
- **Activepieces**: `postgres_data`, `redis_data`, `activepieces_data`
- **Langflow**: `langflow_data`

**⚠️ WARNING**: `docker compose down -v` will DELETE ALL DATA!

Use `docker compose down` (without `-v`) to preserve data.

---

## 🔐 Security Considerations

### Development vs Production

**These configurations are for LOCAL DEVELOPMENT ONLY!**

Before production deployment:

1. **Change ALL passwords and secrets**
   ```bash
   # Generate secure passwords
   openssl rand -hex 32  # For encryption keys
   openssl rand -base64 32  # For JWT secrets
   openssl rand -base64 24  # For API keys
   ```

2. **Enable SSL/TLS**
   - Use reverse proxy (Traefik, Nginx) with Let's Encrypt
   - Or use cloud provider's load balancer with SSL

3. **Restrict database access**
   - Remove port mappings from docker-compose.yml
   - Use Docker networks only

4. **Set up firewall rules**
   - Only allow required ports
   - Use VPN for admin access

5. **Regular backups**
   - Automate database backups
   - Store backups off-site

6. **Update regularly**
   - Pull latest images weekly
   - Monitor security advisories

### Default Credentials

**Dify:**
- Database: `dify` / `dify_password_local_dev_12345`
- Redis: `dify_redis_local_dev_67890`

**Activepieces:**
- Database: `activepieces` / `activepieces_pg_local_dev_secure_12345`
- Redis: `activepieces_redis_local_dev_secure_67890`

**Langflow:**
- No authentication in dev mode
- Configure LANGFLOW_SECRET_KEY for production

---

## 📊 Resource Monitoring

### Check Docker Resource Usage
```bash
# Container resource stats
docker stats

# Disk usage
docker system df

# Volume sizes
docker volume ls
docker system df -v
```

### Expected Resource Usage

**Idle State:**
- Dify: ~2GB RAM, low CPU
- Activepieces: ~1GB RAM, low CPU
- Langflow: ~500MB RAM, low CPU
- **Total: ~3.5GB RAM**

**Active Usage:**
- Dify: +1-2GB during workflow execution
- Activepieces: +500MB during flow runs
- Langflow: +500MB-1GB during LLM calls
- **Peak: ~6-7GB RAM**

---

## 🛠️ Troubleshooting

### Services Won't Start

1. **Check Docker is running:**
   ```bash
   docker info
   ```

2. **Check logs for errors:**
   ```bash
   docker compose logs --tail=100
   ```

3. **Verify .env files exist:**
   ```bash
   ls -la ~/ai-infra/*/.*env
   ```

4. **Check port conflicts:**
   ```bash
   lsof -i :80 -i :8080 -i :7860
   ```

### Database Connection Errors

```bash
# Check database health
docker compose exec db pg_isready  # For Dify/Activepieces

# Check database logs
docker compose logs db
docker compose logs postgres

# Verify credentials match
grep -E "PASSWORD|USER" .env
```

### Out of Memory

```bash
# Check current memory usage
docker stats --no-stream

# Increase Docker Desktop memory:
# Settings → Resources → Memory → 8GB+

# Or stop some services:
docker compose down  # In service directory
```

### Cannot Access UI

1. **Verify container is running:**
   ```bash
   docker compose ps
   ```

2. **Check container logs:**
   ```bash
   docker compose logs -f
   ```

3. **Test from command line:**
   ```bash
   curl http://localhost  # Dify
   curl http://localhost:8080  # Activepieces
   curl http://localhost:7860  # Langflow
   ```

4. **Try different browser or clear cache**

---

## 📚 Additional Resources

### Official Documentation
- **Dify**: https://docs.dify.ai
- **Activepieces**: https://www.activepieces.com/docs
- **Langflow**: https://docs.langflow.org

### GitHub Repositories
- **Dify**: https://github.com/langgenius/dify
- **Activepieces**: https://github.com/activepieces/activepieces
- **Langflow**: https://github.com/logspace-ai/langflow

### Project-Specific Docs
- `docs/ACTIVEPIECES_MCP_API_INTEGRATION.md` - MPC-API integration guide
- `ai-infra/dify/README.md` - Dify detailed setup
- `ai-infra/activepieces/README.md` - Activepieces detailed setup
- `ai-infra/langflow/README.md` - Langflow detailed setup

---

## 📝 Quick Reference Card

### Service URLs
```
Dify:         http://localhost
Activepieces: http://localhost:8080
Langflow:     http://localhost:7860
```

### Start Commands
```bash
cd ~/ai-infra/dify && docker compose up -d
cd ~/ai-infra/activepieces && docker compose up -d
cd ~/ai-infra/langflow && docker compose up -d
```

### Stop Commands
```bash
cd ~/ai-infra/dify && docker compose down
cd ~/ai-infra/activepieces && docker compose down
cd ~/ai-infra/langflow && docker compose down
```

### View Logs
```bash
cd ~/ai-infra/dify && docker compose logs -f --tail=50
cd ~/ai-infra/activepieces && docker compose logs -f --tail=50
cd ~/ai-infra/langflow && docker compose logs -f --tail=50
```

### Health Checks
```bash
curl http://localhost/health           # Dify
curl http://localhost:8080/api/v1/health  # Activepieces
curl http://localhost:7860/health      # Langflow
```

---

**Last Updated**: 2025-11-17  
**Version**: 1.0  
**Maintained By**: BananaStudio DevOps Team
