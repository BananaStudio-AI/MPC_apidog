# Quick Reference - Local AI Infrastructure

One-page reference for the BananaStudio local AI infrastructure.

## 🚀 Quick Commands

### Start Everything
```powershell
cd ai-infra
.\ai-infra-manage.ps1 -Action start -Service all
```

### Stop Everything
```powershell
.\ai-infra-manage.ps1 -Action stop -Service all
```

### Check Status
```powershell
.\ai-infra-manage.ps1 -Action status
```

### Health Check
```powershell
.\ai-infra-manage.ps1 -Action health
```

### View Logs
```powershell
.\ai-infra-manage.ps1 -Action logs -Service mpc-api -Follow
```

---

## 🌐 Service URLs

| Service | URL | Port |
|---------|-----|------|
| Dify | http://localhost | 80 |
| Langflow | http://localhost:7860 | 7860 |
| Activepieces | http://localhost:8080 | 8080 |
| LiteLLM | http://localhost:4000 | 4000 |
| MPC-API | http://localhost:3000 | 3000 |

---

## 🔧 API Endpoints

### MPC-API (localhost:3000)

```bash
# Health check
GET /health

# List models
GET /api/models

# Chat completions
POST /api/chat/completions
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

---

## ⚙️ Environment Setup

```bash
# 1. Copy template
cp .env.template .env

# 2. Edit and add keys
notepad .env

# Required:
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
POSTGRES_PASSWORD=secure-password
```

---

## 🐳 Docker Commands

```powershell
# Create network (first time only)
docker network create ai-infra-net

# Check running containers
docker ps

# View logs
docker logs mpc-api -f

# Check network
docker network inspect ai-infra-net

# Container stats
docker stats
```

---

## 🧪 Testing

```bash
# Run integration tests
node test_mpc_api_litellm.mjs

# Test specific endpoint
curl http://localhost:3000/health
curl http://localhost:3000/api/models
```

---

## 🔍 Troubleshooting

### Service won't start
```powershell
# Check logs
.\ai-infra-manage.ps1 -Action logs -Service <service>

# Restart service
.\ai-infra-manage.ps1 -Action restart -Service <service>
```

### Port already in use
```powershell
# Find process
netstat -ano | findstr :<port>

# Kill process
taskkill /PID <pid> /F
```

### Network issues
```powershell
# Check network
.\ai-infra-manage.ps1 -Action network

# Recreate if needed
docker network rm ai-infra-net
docker network create ai-infra-net
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.env` | Environment configuration |
| `ai-infra/ai-infra-manage.ps1` | Management script |
| `ai-infra/SETUP_GUIDE.md` | Setup instructions |
| `test_mpc_api_litellm.mjs` | Integration tests |
| `VALIDATION_SUMMARY.md` | Architecture validation |

---

## 🔐 Security

- ✅ Never commit `.env` file
- ✅ Store API keys in `.env` only
- ✅ Use strong passwords for databases
- ✅ Rotate keys regularly
- ✅ Keep Docker Desktop updated

---

## 📚 Documentation

- **Setup:** `ai-infra/SETUP_GUIDE.md`
- **Architecture:** `docs/LOCAL_INFRASTRUCTURE.md`
- **API:** `mpc-api/README.md`
- **Services:** `ai-infra/README.md`

---

## 💡 Common Tasks

### Add a new model to LiteLLM
1. Edit `ai-infra/litellm/config.yaml`
2. Add model under `model_list:`
3. Restart LiteLLM:
   ```powershell
   .\ai-infra-manage.ps1 -Action restart -Service litellm
   ```

### View real-time logs
```powershell
.\ai-infra-manage.ps1 -Action logs -Service all -Follow
```

### Clean up everything
```powershell
# WARNING: Removes all data!
.\ai-infra-manage.ps1 -Action clean
```

### Backup data
```powershell
# Backup Dify database
docker run --rm -v dify-db-data:/data -v ${PWD}:/backup alpine tar czf /backup/dify-backup.tar.gz /data
```

---

## 🎯 Architecture Flow

```
Application → MPC-API → LiteLLM → Provider (OpenAI/Anthropic)
```

**Never call providers directly!** Always use MPC-API.

---

## 📞 Support

1. Check troubleshooting section above
2. Review logs
3. Consult documentation
4. Check GitHub issues

---

**Quick Ref Version:** 1.0  
**Last Updated:** 2025-11-18
