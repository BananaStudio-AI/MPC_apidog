# LiteLLM Gateway Setup

A unified gateway for multiple LLM providers using LiteLLM.

## Quick Start

### 1. Set Environment Variables

Create a `.env` file or export variables:

```bash
# Required: At least one provider API key
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."

# Optional: Gateway authentication
export LITELLM_MASTER_KEY="your-secret-key"
```

### 2. Start the Gateway

**Using config file (recommended):**
```bash
litellm --config litellm_config.yaml --port 4000
```

**Quick test (no config):**
```bash
litellm --model gpt-4o-mini --port 4000
```

### 3. Use the Client

```python
from gateway_client import GatewayClient

client = GatewayClient()

# Simple chat
response = client.chat_completion(
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    model="gpt-4o-mini"
)

print(response['choices'][0]['message']['content'])
```

## Gateway Client API

### Initialize

```python
client = GatewayClient(
    base_url="http://localhost:4000",
    api_key="optional-if-master-key-set"
)
```

### Chat Completion

```python
response = client.chat_completion(
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user", "content": "Say hi"}
    ],
    model="gpt-4o-mini",
    temperature=0.7,
    max_tokens=100
)
```

### Streaming

```python
for chunk in client.chat_completion(
    messages=[{"role": "user", "content": "Count to 5"}],
    stream=True
):
    if 'choices' in chunk:
        content = chunk['choices'][0].get('delta', {}).get('content', '')
        print(content, end='', flush=True)
```

### Text Completion

```python
response = client.completion(
    prompt="Once upon a time",
    model="gpt-4o-mini",
    max_tokens=50
)
```

### List Models

```python
models = client.models()
for model in models['data']:
    print(model['id'])
```

### Health Check

```python
health = client.health()
print(health)
```

## Running the Example

```bash
# Terminal 1: Start gateway
litellm --config litellm_config.yaml --port 4000

# Terminal 2: Test client
python gateway_client.py
```

## Configuration

The `litellm_config.yaml` file defines:

- **model_list**: Available models and their provider mappings
- **general_settings**: Authentication, database, etc.
- **litellm_settings**: Logging and behavior options

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For OpenAI models | OpenAI API key |
| `ANTHROPIC_API_KEY` | For Claude models | Anthropic API key |
| `LITELLM_MASTER_KEY` | Optional | Gateway authentication |
| `LITELLM_API_KEY` | Optional | Client authentication |

## Common Commands

```bash
# Start with config
litellm --config litellm_config.yaml --port 4000

# Start with single model (testing)
litellm --model gpt-4o-mini --port 4000

# Start with debug logging
litellm --config litellm_config.yaml --port 4000 --debug

# Different port
litellm --config litellm_config.yaml --port 8000
```

## Troubleshooting

### Port already in use
```bash
# Find and kill process
lsof -ti:4000 | xargs kill -9

# Or use different port
litellm --config litellm_config.yaml --port 4001
```

### Missing API key
```bash
# Check environment
echo $OPENAI_API_KEY

# Set it
export OPENAI_API_KEY="sk-..."
```

### Connection refused
```bash
# Check if server is running
curl http://localhost:4000/health

# Check server logs
# (server outputs to stdout when running in foreground)
```

## API Endpoints

The LiteLLM gateway exposes OpenAI-compatible endpoints:

- `POST /chat/completions` - Chat completions
- `POST /completions` - Text completions  
- `GET /models` - List available models
- `GET /health` - Health check
- `POST /embeddings` - Generate embeddings

See [LiteLLM docs](https://docs.litellm.ai/) for full API reference.
