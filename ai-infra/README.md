# AI Infrastructure Stack

Local development environment for three essential AI services: Dify, Activepieces, and Langflow.

## 📁 Directory Structure

```
ai-infra/
├── AI_INFRA_SETUP.md          # Complete setup guide (START HERE)
├── dify/                       # Dify LLM app platform
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── .env
│   └── README.md
├── activepieces/               # Activepieces automation platform
│   ├── docker-compose.yml
│   ├── .env
│   └── README.md
└── langflow/                   # Langflow visual RAG builder
    ├── docker-compose.yml
    ├── .env
    └── README.md
```

## 🚀 Quick Start

### Deploy to ~/ai-infra

Copy this entire directory structure to `~/ai-infra`:

```bash
# From repository root
cp -r ai-infra ~/ai-infra
cd ~/ai-infra
```

### Start All Services

```bash
cd ~/ai-infra/dify && docker compose up -d
cd ~/ai-infra/activepieces && docker compose up -d
cd ~/ai-infra/langflow && docker compose up -d
```

### Access Services

- **Dify**: http://localhost
- **Activepieces**: http://localhost:8080
- **Langflow**: http://localhost:7860

## 📖 Documentation

- **[AI_INFRA_SETUP.md](AI_INFRA_SETUP.md)** - Complete setup guide with all commands
- **[dify/README.md](dify/README.md)** - Dify-specific documentation
- **[activepieces/README.md](activepieces/README.md)** - Activepieces setup & MPC-API integration
- **[langflow/README.md](langflow/README.md)** - Langflow configuration
- **[../docs/ACTIVEPIECES_MCP_API_INTEGRATION.md](../docs/ACTIVEPIECES_MCP_API_INTEGRATION.md)** - MPC-API integration patterns

## ⚙️ What's Included

### Dify (Port 80)
- PostgreSQL 15 database
- Redis 7 cache
- Dify API server
- Background worker
- Next.js web UI
- Nginx reverse proxy

### Activepieces (Port 8080)
- PostgreSQL 15 database
- Redis 7 cache
- Activepieces main service
- MPC-API integration pre-configured

### Langflow (Port 7860)
- Langflow service
- SQLite database (in volume)
- Optional LiteLLM gateway support

## ⚠️ Important Notes

### Security
- **All passwords are development-only**
- **Change all secrets before production use**
- **Never commit .env files with real credentials**

### Ports
Ensure these ports are free:
- 80 (Dify)
- 8080 (Activepieces)
- 7860 (Langflow)

### Resources
Minimum requirements:
- 8GB RAM
- 10GB disk space
- Docker Desktop installed

## 🔧 Configuration

Each service has its own `.env` file with:
- Database credentials
- Application secrets
- Service-specific settings

**All `.env` files include safe development defaults** - no setup required for local testing.

## 📊 Management

### Check Status
```bash
cd ~/ai-infra/dify && docker compose ps
cd ~/ai-infra/activepieces && docker compose ps
cd ~/ai-infra/langflow && docker compose ps
```

### View Logs
```bash
cd ~/ai-infra/dify && docker compose logs -f
cd ~/ai-infra/activepieces && docker compose logs -f
cd ~/ai-infra/langflow && docker compose logs -f
```

### Stop Services
```bash
cd ~/ai-infra/dify && docker compose down
cd ~/ai-infra/activepieces && docker compose down
cd ~/ai-infra/langflow && docker compose down
```

## 🎯 Use Cases

- **Dify**: Build LLM applications with workflows and RAG
- **Activepieces**: Create automation flows with HTTP steps to MPC-API
- **Langflow**: Prototype multi-agent systems visually

## 📚 Learn More

Read **[AI_INFRA_SETUP.md](AI_INFRA_SETUP.md)** for:
- Detailed setup instructions
- Health check procedures
- Troubleshooting guide
- Security best practices
- Resource monitoring
- Production deployment tips

---

**Quick Reference:**
```bash
# Start all
cd ~/ai-infra/dify && docker compose up -d && \
cd ~/ai-infra/activepieces && docker compose up -d && \
cd ~/ai-infra/langflow && docker compose up -d

# Stop all
cd ~/ai-infra/dify && docker compose down && \
cd ~/ai-infra/activepieces && docker compose down && \
cd ~/ai-infra/langflow && docker compose down
```

**Version**: 1.0  
**Last Updated**: 2025-11-17
