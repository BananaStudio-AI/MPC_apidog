# Dify Local Development Setup

Dify is an LLM app development platform combining AI workflow, RAG pipeline, agent capabilities, model management, and observability features.

## 🚀 Quick Start

```bash
cd ~/ai-infra/dify
docker compose up -d
```

Access at: **http://localhost** (port 80)

## 📋 Prerequisites

- Docker Desktop installed and running
- At least 4GB free RAM
- Port 80 must be available (not used by other services)

## 🔧 Configuration Files

### docker-compose.yml
Defines 6 services:
- **db** - PostgreSQL 15 database
- **redis** - Redis 7 cache
- **api** - Dify API server
- **worker** - Background task worker
- **web** - Next.js frontend
- **nginx** - Reverse proxy on port 80

### .env
Contains all configuration:
- Database credentials (Postgres)
- Redis password
- Application secrets
- Storage configuration

**⚠️ SECURITY WARNING**: The `.env` file contains development-only credentials. Never use these in production!

## 🎯 Service Architecture

```
User → nginx:80 → web:3000 (Frontend)
                → api:5001 (Backend API)
                     ↓
                  db:5432 (PostgreSQL)
                  redis:6379 (Cache)
                     ↓
                  worker (Background tasks)
```

## 📦 Startup Commands

```bash
# Start all services
cd ~/ai-infra/dify
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f --tail=200 db redis api web nginx

# View specific service logs
docker compose logs -f api
docker compose logs -f web
docker compose logs -f nginx

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes all data)
docker compose down -v
```

## ✅ Health Check Indicators

### Database (db)
```
LOG:  database system is ready to accept connections
```

### Redis (redis)
```
* Ready to accept connections
```

### API (api)
```
INFO:     Uvicorn running on http://0.0.0.0:5001
INFO:     Application startup complete
```

### Worker (worker)
```
[INFO] celery@hostname ready.
```

### Web (web)
```
ready - started server on 0.0.0.0:3000
```

### Nginx (nginx)
```
nginx: [notice] start worker processes
```

## 🔍 Verification Steps

1. **Check all containers are running:**
   ```bash
   docker compose ps
   ```
   All should show "Up" status.

2. **Test nginx health endpoint:**
   ```bash
   curl http://localhost/health
   # Should return: healthy
   ```

3. **Access web UI:**
   Open browser to http://localhost

4. **Check API health:**
   ```bash
   curl http://localhost/api/health
   ```

## 🛠️ Troubleshooting

### Port 80 already in use
```bash
# Check what's using port 80
sudo lsof -i :80
# Or on macOS
lsof -nP -iTCP:80 | grep LISTEN

# Stop the conflicting service or change Dify port in docker-compose.yml
```

### Database connection errors
```bash
# Check database logs
docker compose logs db

# Verify database is healthy
docker compose exec db pg_isready -U dify
```

### Redis connection errors
```bash
# Check Redis logs
docker compose logs redis

# Test Redis connection
docker compose exec redis redis-cli -a dify_redis_local_dev_67890 ping
```

### Containers won't start
```bash
# View detailed logs
docker compose logs --tail=100

# Restart specific service
docker compose restart api

# Rebuild containers (if images were updated)
docker compose up -d --force-recreate
```

## 📊 Resource Usage

Expected resource consumption:
- **RAM**: ~2-3 GB total
- **CPU**: Low to moderate (spikes during processing)
- **Disk**: ~1 GB for images, grows with data storage

## 🔄 Updating Dify

```bash
cd ~/ai-infra/dify

# Pull latest images
docker compose pull

# Recreate containers with new images
docker compose up -d --force-recreate
```

## 🗄️ Data Persistence

Data is stored in Docker volumes:
- `db_data` - PostgreSQL database
- `redis_data` - Redis cache
- `api_storage` - File storage

To backup:
```bash
# Backup database
docker compose exec db pg_dump -U dify -d dify > dify_backup_$(date +%Y%m%d).sql

# Backup volumes
docker run --rm -v dify_db_data:/data -v $(pwd):/backup alpine tar czf /backup/dify_db_backup.tar.gz /data
```

## 🎛️ Environment Variables

Key variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USERNAME` | Postgres username | `dify` |
| `DB_PASSWORD` | Postgres password | `dify_password_local_dev_12345` |
| `DB_DATABASE` | Database name | `dify` |
| `REDIS_PASSWORD` | Redis password | `dify_redis_local_dev_67890` |
| `SECRET_KEY` | App encryption key | Dev secret (change for prod) |
| `STORAGE_TYPE` | Storage backend | `local` |

## 🔐 Security Notes

1. **Change all passwords** before deploying to production
2. **Use strong SECRET_KEY** (32+ random characters)
3. **Enable SSL/TLS** for production (nginx configuration)
4. **Set up proper firewall rules**
5. **Regular security updates** (pull latest images)

## 📚 Additional Resources

- Official Dify Docs: https://docs.dify.ai
- GitHub Repository: https://github.com/langgenius/dify
- Community Forum: https://github.com/langgenius/dify/discussions

---

**Last Updated**: 2025-11-17  
**Dify Version**: Latest stable  
**Docker Compose Version**: 3.8
