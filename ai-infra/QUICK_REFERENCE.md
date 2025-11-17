# AI Infrastructure Stack - Quick Reference

## 📋 Service Access

| Service | URL | Port | Status Check |
|---------|-----|------|--------------|
| **Dify** | http://localhost | 80 | `curl http://localhost/health` |
| **Activepieces** | http://localhost:8080 | 8080 | `curl http://localhost:8080/api/v1/health` |
| **Langflow** | http://localhost:7860 | 7860 | `curl http://localhost:7860/health` |

## 🚀 Deployment Instructions

### Option 1: Automated Deployment (Recommended)

```bash
# From repository root
cd ai-infra
./deploy.sh
```

This script will:
1. Check Docker is running
2. Check for port conflicts
3. Copy configuration to ~/ai-infra
4. Optionally start all services
5. Display status

### Option 2: Manual Deployment

```bash
# Copy to home directory
cp -r ai-infra ~/ai-infra

# Start services
cd ~/ai-infra/dify && docker compose up -d
cd ~/ai-infra/activepieces && docker compose up -d
cd ~/ai-infra/langflow && docker compose up -d
```

## 📦 Startup Commands

### All Services (Sequential)
```bash
cd ~/ai-infra/dify && docker compose up -d && \
cd ~/ai-infra/activepieces && docker compose up -d && \
cd ~/ai-infra/langflow && docker compose up -d
```

### Individual Services

**Dify:**
```bash
cd ~/ai-infra/dify
docker compose up -d
docker compose ps
docker compose logs -f --tail=200 db redis api web nginx
```

**Activepieces:**
```bash
cd ~/ai-infra/activepieces
docker compose up -d
docker compose ps
docker compose logs -f activepieces postgres redis
```

**Langflow:**
```bash
cd ~/ai-infra/langflow
docker compose up -d
docker compose ps
docker compose logs -f langflow
```

## ✅ Health Check Log Indicators

### Dify
- **db**: `database system is ready to accept connections`
- **redis**: `Ready to accept connections`
- **api**: `Uvicorn running on http://0.0.0.0:5001`
- **worker**: `celery@hostname ready`
- **web**: `ready - started server on 0.0.0.0:3000`
- **nginx**: `start worker processes`

### Activepieces
- **postgres**: `database system is ready to accept connections`
- **redis**: `Ready to accept connections`
- **activepieces**: `Application started successfully` or `Listening on port 80`

### Langflow
- **langflow**: `Uvicorn running on http://0.0.0.0:7860` or `Langflow is ready!`

## 🔍 Verification Commands

```bash
# Check all containers
cd ~/ai-infra/dify && docker compose ps
cd ~/ai-infra/activepieces && docker compose ps
cd ~/ai-infra/langflow && docker compose ps

# Test health endpoints
curl http://localhost/health
curl http://localhost:8080/api/v1/health
curl http://localhost:7860/health

# Access web UIs
open http://localhost              # Dify
open http://localhost:8080         # Activepieces
open http://localhost:7860         # Langflow
```

## 🛑 Stop Commands

### All Services
```bash
cd ~/ai-infra/dify && docker compose down && \
cd ~/ai-infra/activepieces && docker compose down && \
cd ~/ai-infra/langflow && docker compose down
```

### Individual Services
```bash
cd ~/ai-infra/dify && docker compose down
cd ~/ai-infra/activepieces && docker compose down
cd ~/ai-infra/langflow && docker compose down
```

## 🔄 Update Commands

```bash
# Pull latest images
cd ~/ai-infra/dify && docker compose pull
cd ~/ai-infra/activepieces && docker compose pull
cd ~/ai-infra/langflow && docker compose pull

# Recreate with new images
cd ~/ai-infra/dify && docker compose up -d --force-recreate
cd ~/ai-infra/activepieces && docker compose up -d --force-recreate
cd ~/ai-infra/langflow && docker compose up -d --force-recreate
```

## ⚠️ Port Conflict Resolution

If ports are in use:

**Port 80 (Dify):**
```yaml
# Edit ~/ai-infra/dify/docker-compose.yml
nginx:
  ports:
    - "8000:80"  # Change to available port
```

**Port 8080 (Activepieces):**
```yaml
# Edit ~/ai-infra/activepieces/docker-compose.yml
activepieces:
  ports:
    - "8081:80"  # Change to available port
```

**Port 7860 (Langflow):**
```yaml
# Edit ~/ai-infra/langflow/docker-compose.yml
langflow:
  ports:
    - "7861:7860"  # Change to available port
```

## 🔐 MPC-API Integration (Activepieces)

The Activepieces .env includes:

```bash
MPC_API_BASE_URL=http://host.docker.internal:3000
MPC_API_KEY=mpc-api-secure-key-local-dev-change-in-production-12345
MPC_API_TIMEOUT=120000
```

### Using in Flows

**HTTP Request Step:**
```
Method: POST
URL: {{env.MPC_API_BASE_URL}}/generate/script

Headers:
  Content-Type: application/json
  Authorization: Bearer {{env.MPC_API_KEY}}

Body:
{
  "prompt": "{{your_data}}",
  "duration": 60
}

Timeout: 120000
```

See `docs/ACTIVEPIECES_MCP_API_INTEGRATION.md` for complete documentation.

## 🔧 Troubleshooting

### Services won't start
```bash
# Check Docker
docker info

# Check logs
docker compose logs --tail=100

# Restart specific service
docker compose restart <service-name>
```

### Database connection errors
```bash
# Check database health
docker compose exec db pg_isready -U dify       # Dify
docker compose exec postgres pg_isready -U activepieces  # Activepieces

# View database logs
docker compose logs db
docker compose logs postgres
```

### Cannot access MPC-API from Activepieces
```bash
# Test from Activepieces container
docker compose exec activepieces curl http://host.docker.internal:3000/health

# On Linux, you may need to add to docker-compose.yml:
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### Out of memory
```bash
# Check resource usage
docker stats --no-stream

# Increase Docker Desktop memory:
# Settings → Resources → Memory → 8GB+
```

## 📊 Resource Requirements

**Minimum:**
- RAM: 8GB
- Disk: 10GB free
- CPU: 2+ cores

**Recommended:**
- RAM: 16GB
- Disk: 20GB free
- CPU: 4+ cores

## 🗄️ Data Backup

```bash
# Backup Dify database
cd ~/ai-infra/dify
docker compose exec db pg_dump -U dify -d dify > dify_backup_$(date +%Y%m%d).sql

# Backup Activepieces database
cd ~/ai-infra/activepieces
docker compose exec postgres pg_dump -U activepieces -d activepieces > activepieces_backup_$(date +%Y%m%d).sql

# Backup Langflow volume
cd ~/ai-infra/langflow
docker run --rm -v langflow_langflow_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/langflow_backup_$(date +%Y%m%d).tar.gz -C /data .
```

## 📚 Documentation Links

- **Complete Setup Guide**: `ai-infra/AI_INFRA_SETUP.md`
- **Dify Details**: `ai-infra/dify/README.md`
- **Activepieces Details**: `ai-infra/activepieces/README.md`
- **Langflow Details**: `ai-infra/langflow/README.md`
- **MPC-API Integration**: `docs/ACTIVEPIECES_MCP_API_INTEGRATION.md`

## 🔐 Security Notes

**⚠️ IMPORTANT**: All .env files contain **development-only** credentials.

**Before production:**
1. Generate secure passwords:
   ```bash
   openssl rand -hex 32     # Encryption keys
   openssl rand -base64 32  # JWT secrets
   openssl rand -base64 24  # API keys
   ```

2. Update all passwords in .env files
3. Enable SSL/TLS (reverse proxy with Let's Encrypt)
4. Restrict database access (remove port mappings)
5. Set up firewall rules
6. Regular backups

---

**Version**: 1.0  
**Last Updated**: 2025-11-17  
**Ready for Deployment**: ✅
