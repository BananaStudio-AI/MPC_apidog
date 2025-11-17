# Activepieces Local Development Setup

Activepieces is an open-source business automation tool that lets you connect apps and automate workflows without code.

## 🚀 Quick Start

```bash
cd ~/ai-infra/activepieces
docker compose up -d
```

Access at: **http://localhost:8080**

## 📋 Prerequisites

- Docker Desktop installed and running
- At least 2GB free RAM
- Port 8080 must be available
- (Optional) MPC-API service running on port 3000

## 🔧 Configuration Files

### docker-compose.yml
Defines 3 services:
- **postgres** - PostgreSQL 15 database
- **redis** - Redis 7 cache
- **activepieces** - Main application server

### .env
Contains all configuration:
- Database credentials (Postgres)
- Redis password
- Application security keys (encryption, JWT, API)
- **MPC-API integration** (per ACTIVEPIECES_MCP_API_INTEGRATION.md)

**⚠️ SECURITY WARNING**: The `.env` file contains development-only credentials. Never use these in production!

## 🎯 Service Architecture

```
User → activepieces:8080 (Web UI + API)
              ↓
          postgres:5432 (Database)
          redis:6379 (Cache)
              ↓
          MPC-API:3000 (External integration)
```

## 📦 Startup Commands

```bash
# Start all services
cd ~/ai-infra/activepieces
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f activepieces postgres redis

# View specific service logs
docker compose logs -f activepieces
docker compose logs -f postgres
docker compose logs -f redis

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes all data)
docker compose down -v
```

## ✅ Health Check Indicators

### PostgreSQL (postgres)
```
LOG:  database system is ready to accept connections
```

### Redis (redis)
```
* Ready to accept connections
```

### Activepieces (activepieces)
```
Application started successfully
Listening on port 80
Database migrations completed
```

Alternative health indicators:
```
Server is running on port 80
Connected to PostgreSQL
Connected to Redis
```

## 🔍 Verification Steps

1. **Check all containers are running:**
   ```bash
   docker compose ps
   ```
   All should show "Up (healthy)" status.

2. **Test API health endpoint:**
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

3. **Access web UI:**
   Open browser to http://localhost:8080

4. **Create first account:**
   - Navigate to http://localhost:8080
   - Sign up with email and password
   - Start creating flows!

## 🔗 MPC-API Integration

Per `ACTIVEPIECES_MCP_API_INTEGRATION.md`, the following environment variables are configured:

```bash
MPC_API_BASE_URL=http://host.docker.internal:3000
MPC_API_KEY=mpc-api-secure-key-local-dev-change-in-production-12345
MPC_API_TIMEOUT=120000
```

### Using MPC-API in Flows

1. **Add HTTP Request step** in your flow
2. **Configure endpoint:**
   ```
   Method: POST
   URL: {{env.MPC_API_BASE_URL}}/generate/script
   ```
3. **Add headers:**
   ```
   Content-Type: application/json
   Authorization: Bearer {{env.MPC_API_KEY}}
   ```
4. **Set body:**
   ```json
   {
     "prompt": "{{your_variable}}",
     "duration": 60
   }
   ```

See `ACTIVEPIECES_MCP_API_INTEGRATION.md` for complete endpoint documentation and examples.

## 🛠️ Troubleshooting

### Port 8080 already in use
```bash
# Check what's using port 8080
lsof -nP -iTCP:8080 | grep LISTEN

# Option 1: Stop conflicting service
# Option 2: Change port in docker-compose.yml (e.g., "8081:80")
```

### Cannot connect to MPC-API
```bash
# Verify MPC-API is running
curl http://localhost:3000/health

# Check if host.docker.internal resolves
docker compose exec activepieces ping host.docker.internal

# Alternative: Use actual IP address instead of host.docker.internal
# On Linux, use: host.docker.internal OR 172.17.0.1
# On Mac/Windows: host.docker.internal should work
```

### Database connection errors
```bash
# Check database logs
docker compose logs postgres

# Test database connection
docker compose exec postgres psql -U activepieces -d activepieces -c "SELECT 1"
```

### Redis connection errors
```bash
# Check Redis logs
docker compose logs redis

# Test Redis connection
docker compose exec redis redis-cli -a activepieces_redis_local_dev_secure_67890 ping
```

### Authentication errors
```bash
# Reset admin password (if needed)
docker compose exec activepieces npm run reset-password

# Check encryption key is set correctly
docker compose exec activepieces env | grep AP_ENCRYPTION_KEY
```

## 📊 Resource Usage

Expected resource consumption:
- **RAM**: ~1-2 GB total
- **CPU**: Low (moderate during flow execution)
- **Disk**: ~500 MB for images, grows with flows and data

## 🔄 Updating Activepieces

```bash
cd ~/ai-infra/activepieces

# Pull latest image
docker compose pull

# Recreate container with new image
docker compose up -d --force-recreate
```

## 🗄️ Data Persistence

Data is stored in Docker volumes:
- `postgres_data` - PostgreSQL database (flows, users, executions)
- `redis_data` - Redis cache (sessions, queues)
- `activepieces_data` - Application data

To backup:
```bash
# Backup database
docker compose exec postgres pg_dump -U activepieces -d activepieces > activepieces_backup_$(date +%Y%m%d).sql

# Restore database
cat backup.sql | docker compose exec -T postgres psql -U activepieces -d activepieces
```

## 🎛️ Environment Variables

Key variables in `.env`:

### Database
| Variable | Description | Default |
|----------|-------------|---------|
| `AP_POSTGRES_USER` | Postgres username | `activepieces` |
| `AP_POSTGRES_PASSWORD` | Postgres password | Dev password |
| `AP_POSTGRES_DATABASE` | Database name | `activepieces` |

### Security (MUST CHANGE FOR PRODUCTION)
| Variable | Description | Min Length |
|----------|-------------|------------|
| `AP_ENCRYPTION_KEY` | Data encryption key | 32 chars |
| `AP_JWT_SECRET` | JWT signing secret | 32 chars |
| `AP_API_KEY` | API authentication | 20 chars |

### MPC-API Integration
| Variable | Description | Default |
|----------|-------------|---------|
| `MPC_API_BASE_URL` | MPC-API endpoint | `http://host.docker.internal:3000` |
| `MPC_API_KEY` | MPC-API auth key | Dev key (change for prod) |
| `MPC_API_TIMEOUT` | Request timeout (ms) | `120000` (2 minutes) |

## 🔐 Security Notes

1. **Generate secure keys for production:**
   ```bash
   # Encryption key (32 chars min)
   openssl rand -hex 32
   
   # JWT secret
   openssl rand -base64 32
   
   # API key
   openssl rand -base64 24
   ```

2. **Change all passwords** before deploying to production
3. **Use HTTPS** in production (reverse proxy with SSL)
4. **Restrict database access** (firewall rules)
5. **Regular backups** of database and volumes
6. **Keep images updated** for security patches

## 🎨 Creating Your First Flow

1. Access http://localhost:8080
2. Sign up / Sign in
3. Click "Create Flow"
4. Choose a trigger (e.g., Webhook, Schedule, Database)
5. Add actions (HTTP Request, Data Transform, etc.)
6. Use `{{env.MPC_API_BASE_URL}}` in HTTP steps
7. Test and publish!

## 📚 Additional Resources

- Official Docs: https://www.activepieces.com/docs
- GitHub Repository: https://github.com/activepieces/activepieces
- MCP-API Integration: See `ACTIVEPIECES_MCP_API_INTEGRATION.md` in docs/

---

**Last Updated**: 2025-11-17  
**Activepieces Version**: Latest stable  
**Docker Compose Version**: 3.8
