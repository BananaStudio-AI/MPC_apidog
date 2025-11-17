# Langflow Local Development Setup

Langflow is a visual framework for building multi-agent and RAG applications with a drag-and-drop interface.

## 🚀 Quick Start

```bash
cd ~/ai-infra/langflow
docker compose up -d
```

Access at: **http://localhost:7860**

## 📋 Prerequisites

- Docker Desktop installed and running
- At least 1GB free RAM
- Port 7860 must be available
- (Optional) LiteLLM gateway running on port 4000

## 🔧 Configuration Files

### docker-compose.yml
Defines 1 service:
- **langflow** - Main Langflow application

### .env
Contains all configuration:
- Langflow server settings
- Database configuration (SQLite by default)
- Optional LiteLLM gateway integration
- Optional direct LLM provider keys

## 🎯 Service Architecture

```
User → langflow:7860 (Web UI + API)
            ↓
        SQLite DB (in volume)
            ↓
        LiteLLM:4000 (Optional unified LLM gateway)
```

## 📦 Startup Commands

```bash
# Start Langflow
cd ~/ai-infra/langflow
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f langflow

# View recent logs
docker compose logs --tail=100 langflow

# Stop service
docker compose down

# Stop and remove volume (⚠️ deletes all flows and data)
docker compose down -v
```

## ✅ Health Check Indicators

### Langflow (langflow)
```
INFO:     Uvicorn running on http://0.0.0.0:7860
INFO:     Application startup complete
```

Alternative success indicators:
```
Starting Langflow on http://0.0.0.0:7860
Langflow is ready!
Database initialized successfully
```

## 🔍 Verification Steps

1. **Check container is running:**
   ```bash
   docker compose ps
   ```
   Should show "Up (healthy)" status.

2. **Test health endpoint:**
   ```bash
   curl http://localhost:7860/health
   ```

3. **Access web UI:**
   Open browser to http://localhost:7860

4. **Create your first flow:**
   - Click "New Flow"
   - Drag components from sidebar
   - Connect components
   - Run and test!

## 🔗 LiteLLM Gateway Integration

To connect Langflow to a unified LLM gateway (LiteLLM), uncomment these lines in `.env`:

```bash
# In .env file:
LITELLM_BASE_URL=http://host.docker.internal:4000
LITELLM_API_KEY=sk-local-dev-litellm-key-change-me

# Or use OpenAI-compatible endpoint:
OPENAI_API_BASE=http://host.docker.internal:4000
OPENAI_API_KEY=sk-local-dev-key-change-me
```

### Verify LiteLLM Connection

```bash
# Test LiteLLM gateway is accessible
curl http://localhost:4000/health

# From within Langflow container
docker compose exec langflow curl http://host.docker.internal:4000/health
```

### Using in Flows

1. Add an **LLM component** to your flow
2. Select **OpenAI** as provider
3. The base URL will automatically use your configured endpoint
4. API key will be read from environment

## 🛠️ Troubleshooting

### Port 7860 already in use
```bash
# Check what's using port 7860
lsof -nP -iTCP:7860 | grep LISTEN

# Change port in docker-compose.yml (e.g., "7861:7860")
```

### Cannot connect to LiteLLM
```bash
# Verify LiteLLM is running
curl http://localhost:4000/health

# Check if host.docker.internal resolves
docker compose exec langflow ping host.docker.internal

# On Linux, you may need to use:
# - 172.17.0.1 (default Docker bridge)
# - host.docker.internal (if Docker 20.10+)
# - Or run Langflow with --network=host
```

### Flows not persisting
```bash
# Verify volume is mounted
docker volume inspect langflow_langflow_data

# Check volume contents
docker compose exec langflow ls -la /app/langflow
```

### Out of memory errors
```bash
# Increase Docker Desktop memory allocation
# Settings → Resources → Memory (recommend 4GB+)

# Or add memory limit in docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G
```

## 📊 Resource Usage

Expected resource consumption:
- **RAM**: ~500 MB - 1 GB (more during flow execution)
- **CPU**: Low (moderate during LLM calls)
- **Disk**: ~200 MB for image, grows with flows and data

## 🔄 Updating Langflow

```bash
cd ~/ai-infra/langflow

# Pull latest image
docker compose pull

# Recreate container with new image
docker compose up -d --force-recreate
```

## 🗄️ Data Persistence

Data is stored in Docker volume:
- `langflow_data` - Contains:
  - SQLite database (flows, components, settings)
  - Flow store
  - Uploaded files
  - Cache

To backup:
```bash
# Create backup of entire volume
docker run --rm -v langflow_langflow_data:/data -v $(pwd):/backup alpine tar czf /backup/langflow_backup_$(date +%Y%m%d).tar.gz -C /data .

# Restore from backup
docker volume create langflow_langflow_data
docker run --rm -v langflow_langflow_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/langflow_backup_YYYYMMDD.tar.gz"
```

## 🎛️ Environment Variables

Key variables in `.env`:

### Server Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| `LANGFLOW_HOST` | Bind address | `0.0.0.0` |
| `LANGFLOW_PORT` | Server port | `7860` |
| `LANGFLOW_LOG_LEVEL` | Log verbosity | `INFO` |
| `LANGFLOW_WORKERS` | Worker processes | `1` |

### Database
| Variable | Description | Default |
|----------|-------------|---------|
| `LANGFLOW_DATABASE_URL` | Database connection | SQLite in volume |

### LiteLLM Integration (Optional)
| Variable | Description | Example |
|----------|-------------|---------|
| `LITELLM_BASE_URL` | LiteLLM endpoint | `http://host.docker.internal:4000` |
| `LITELLM_API_KEY` | Auth key | `sk-...` |
| `OPENAI_API_BASE` | Alt. endpoint var | `http://host.docker.internal:4000` |
| `OPENAI_API_KEY` | Alt. key var | `sk-...` |

### Direct LLM Providers (Optional)
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Direct OpenAI access |
| `ANTHROPIC_API_KEY` | Claude models |
| `GOOGLE_API_KEY` | Gemini models |
| `HUGGINGFACE_API_TOKEN` | HuggingFace models |

## 🎨 Creating Your First Flow

1. Access http://localhost:7860
2. Click **"New Flow"** or use a template
3. **Drag components** from the sidebar:
   - Inputs (Chat Input, Text Input)
   - LLMs (OpenAI, Anthropic, etc.)
   - Chains (LLMChain, ConversationChain)
   - Outputs (Chat Output, Text Output)
4. **Connect components** by dragging from output to input
5. **Configure each component** by clicking on it
6. **Test the flow** using the chat interface
7. **Export or Deploy** when ready

## 🔌 Available Components

### Language Models
- OpenAI (GPT-3.5, GPT-4)
- Anthropic (Claude)
- Cohere
- Hugging Face
- Google Vertex AI
- Custom LLMs

### Chains
- LLMChain (simple prompting)
- ConversationChain (with memory)
- RetrievalQA (RAG)
- SequentialChain (multi-step)

### Memory
- ConversationBufferMemory
- ConversationSummaryMemory
- VectorStoreMemory

### Data Loaders
- File Upload
- URL Loader
- PDF Loader
- Text Splitter

### Vector Stores
- Pinecone
- Weaviate
- Qdrant
- ChromaDB

## 📚 Additional Resources

- Official Docs: https://docs.langflow.org
- GitHub Repository: https://github.com/logspace-ai/langflow
- Component Library: https://docs.langflow.org/components
- Discord Community: https://discord.gg/langflow

## 💡 Tips & Best Practices

1. **Start Simple**: Begin with basic LLM → Output flows
2. **Use Templates**: Explore built-in templates for common patterns
3. **Test Incrementally**: Test each component before connecting more
4. **Use Memory**: Add conversation memory for chat applications
5. **Monitor Costs**: If using paid LLM APIs, monitor usage
6. **Version Control**: Export flows as JSON for backup

---

**Last Updated**: 2025-11-17  
**Langflow Version**: Latest stable  
**Docker Compose Version**: 3.8
