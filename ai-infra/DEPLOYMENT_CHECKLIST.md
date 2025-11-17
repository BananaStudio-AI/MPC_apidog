# AI Infrastructure Stack - Deployment Checklist

Use this checklist to deploy and verify your local AI infrastructure stack.

## 📋 Pre-Deployment Checklist

- [ ] **Docker Desktop installed and running**
  ```bash
  docker --version
  docker info
  ```

- [ ] **Sufficient system resources**
  - [ ] At least 8GB RAM available
  - [ ] At least 10GB free disk space
  - [ ] Docker Desktop memory set to 8GB+ (Settings → Resources)

- [ ] **Ports available**
  ```bash
  # Check if ports are free
  lsof -i :80 -i :8080 -i :7860
  # Or on Windows: netstat -ano | findstr "80 8080 7860"
  ```
  - [ ] Port 80 (for Dify)
  - [ ] Port 8080 (for Activepieces)
  - [ ] Port 7860 (for Langflow)

- [ ] **(Optional) MPC-API service running**
  ```bash
  curl http://localhost:3000/health
  ```

## 🚀 Deployment Steps

### Step 1: Deploy Configuration

**Option A - Automated (Recommended):**
```bash
cd ai-infra
./deploy.sh
```
- [ ] Script completed successfully
- [ ] Configuration copied to ~/ai-infra
- [ ] Services started (if selected)

**Option B - Manual:**
```bash
cp -r ai-infra ~/ai-infra
```
- [ ] Files copied to ~/ai-infra
- [ ] All subdirectories present (dify, activepieces, langflow)

### Step 2: Review Configuration (Optional)

- [ ] Review `~/ai-infra/dify/.env` and adjust if needed
- [ ] Review `~/ai-infra/activepieces/.env` and verify MPC-API settings
- [ ] Review `~/ai-infra/langflow/.env` and uncomment LiteLLM if needed

### Step 3: Start Services

**Start All Services:**
```bash
cd ~/ai-infra/dify && docker compose up -d && \
cd ~/ai-infra/activepieces && docker compose up -d && \
cd ~/ai-infra/langflow && docker compose up -d
```

**Or Start Individually:**

**Dify:**
```bash
cd ~/ai-infra/dify
docker compose up -d
```
- [ ] All containers started
- [ ] No error messages in output

**Activepieces:**
```bash
cd ~/ai-infra/activepieces
docker compose up -d
```
- [ ] All containers started
- [ ] No error messages in output

**Langflow:**
```bash
cd ~/ai-infra/langflow
docker compose up -d
```
- [ ] Container started
- [ ] No error messages in output

### Step 4: Verify Container Status

**Check All Services:**
```bash
cd ~/ai-infra/dify && docker compose ps
cd ~/ai-infra/activepieces && docker compose ps
cd ~/ai-infra/langflow && docker compose ps
```

**Dify Containers:**
- [ ] db - Up (healthy)
- [ ] redis - Up (healthy)
- [ ] api - Up (healthy)
- [ ] worker - Up
- [ ] web - Up
- [ ] nginx - Up (healthy)

**Activepieces Containers:**
- [ ] postgres - Up (healthy)
- [ ] redis - Up (healthy)
- [ ] activepieces - Up (healthy)

**Langflow Container:**
- [ ] langflow - Up (healthy)

### Step 5: Check Logs

**Dify Logs:**
```bash
cd ~/ai-infra/dify
docker compose logs --tail=50 db redis api web nginx
```
Look for:
- [ ] db: `database system is ready to accept connections`
- [ ] redis: `Ready to accept connections`
- [ ] api: `Uvicorn running on http://0.0.0.0:5001`
- [ ] web: `ready - started server on 0.0.0.0:3000`
- [ ] nginx: `start worker processes`

**Activepieces Logs:**
```bash
cd ~/ai-infra/activepieces
docker compose logs --tail=50 activepieces postgres redis
```
Look for:
- [ ] postgres: `database system is ready to accept connections`
- [ ] redis: `Ready to accept connections`
- [ ] activepieces: `Application started successfully`

**Langflow Logs:**
```bash
cd ~/ai-infra/langflow
docker compose logs --tail=50 langflow
```
Look for:
- [ ] langflow: `Uvicorn running on http://0.0.0.0:7860`

### Step 6: Test Health Endpoints

```bash
# Test Dify
curl http://localhost/health

# Test Activepieces
curl http://localhost:8080/api/v1/health

# Test Langflow
curl http://localhost:7860/health
```

- [ ] Dify health check returns `healthy`
- [ ] Activepieces health check returns success
- [ ] Langflow health check returns success

### Step 7: Access Web UIs

**Open in Browser:**
- [ ] http://localhost - Dify UI loads
- [ ] http://localhost:8080 - Activepieces UI loads
- [ ] http://localhost:7860 - Langflow UI loads

**Dify:**
- [ ] Can create account or sign in
- [ ] Dashboard loads correctly

**Activepieces:**
- [ ] Can create account or sign in
- [ ] Can create new flow

**Langflow:**
- [ ] Interface loads
- [ ] Can create new flow

### Step 8: Test MPC-API Integration (Activepieces)

If MPC-API is running:

```bash
# From Activepieces container
cd ~/ai-infra/activepieces
docker compose exec activepieces curl http://host.docker.internal:3000/health
```

- [ ] MPC-API accessible from Activepieces container
- [ ] Health check returns success

**In Activepieces UI:**
- [ ] Create test flow with HTTP Request step
- [ ] Configure URL: `{{env.MPC_API_BASE_URL}}/health`
- [ ] Run flow
- [ ] Flow executes successfully

## ✅ Post-Deployment Verification

### Resource Check
```bash
docker stats --no-stream
```
- [ ] Total RAM usage acceptable (< available RAM)
- [ ] No containers consuming excessive resources

### Volume Check
```bash
docker volume ls | grep -E "dify|activepieces|langflow"
```
- [ ] All volumes created
- [ ] Volumes showing data (check with `docker volume inspect`)

### Network Check
```bash
docker network ls | grep -E "dify|activepieces|langflow"
```
- [ ] All networks created
- [ ] Networks active

## 🎯 Success Criteria

All items below should be checked:

- [ ] All containers running and healthy
- [ ] All health endpoints responding
- [ ] All web UIs accessible
- [ ] No error messages in logs
- [ ] Resource usage within limits
- [ ] (Optional) MPC-API integration working

## 🛑 Troubleshooting

If any checks fail, see:
- `AI_INFRA_SETUP.md` - Complete troubleshooting guide
- `QUICK_REFERENCE.md` - Common issues and solutions
- Service-specific READMEs in each directory

### Common Issues

**Port Conflicts:**
- See `QUICK_REFERENCE.md` → "Port Conflict Resolution"
- Edit docker-compose.yml port mappings

**Out of Memory:**
- Increase Docker Desktop memory allocation
- Settings → Resources → Memory → 8GB+

**Database Connection Errors:**
- Check logs: `docker compose logs db` or `docker compose logs postgres`
- Verify environment variables in .env match docker-compose.yml

**Cannot Access MPC-API:**
- Verify MPC-API is running: `curl http://localhost:3000/health`
- On Linux, may need `extra_hosts` in docker-compose.yml
- See `activepieces/README.md` → "Cannot connect to MPC-API"

## 📝 Notes

**Startup Time:**
Services may take 1-2 minutes to fully initialize. Wait for all health checks to pass before testing.

**First Run:**
On first run, databases need to initialize. This adds ~30 seconds to startup time.

**Data Persistence:**
All data persists in Docker volumes. Use `docker compose down` (without `-v`) to preserve data.

## 🎉 Next Steps

Once all checks pass:

1. **Explore Dify**: Create your first LLM workflow
2. **Set up Activepieces**: Connect to Notion/GitHub and create automations
3. **Build in Langflow**: Create visual RAG flows
4. **Integrate Services**: Connect Activepieces to MPC-API for automation

## 📚 Documentation

- `AI_INFRA_SETUP.md` - Complete setup guide
- `QUICK_REFERENCE.md` - Command reference
- `dify/README.md` - Dify documentation
- `activepieces/README.md` - Activepieces + MPC-API guide
- `langflow/README.md` - Langflow documentation
- `../docs/ACTIVEPIECES_MCP_API_INTEGRATION.md` - MPC-API patterns

---

**Version**: 1.0  
**Last Updated**: 2025-11-17  
**Status**: Ready for Production Deployment ✅
