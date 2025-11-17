#!/bin/bash
# Quick test script for LiteLLM gateway

echo "🚀 Testing LiteLLM Gateway"
echo ""

# Check if server is running
if ! curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "❌ Gateway not running on port 4000"
    echo ""
    echo "Start it with:"
    echo "  litellm --config litellm_config.yaml --port 4000"
    echo ""
    echo "Or for quick test:"
    echo "  litellm --model gpt-4o-mini --port 4000"
    exit 1
fi

echo "✅ Gateway is running"
echo ""

# Resolve base URL and auth header
BASE_URL="${LITELLM_BASE_URL:-http://localhost:4000}"
AUTH_HEADER=()
if [[ -n "$LITELLM_API_KEY" ]]; then
  AUTH_HEADER=(-H "Authorization: Bearer $LITELLM_API_KEY")
elif [[ -n "$LITELLM_MASTER_KEY" ]]; then
  AUTH_HEADER=(-H "Authorization: Bearer $LITELLM_MASTER_KEY")
fi

# Test 1: Health check
echo "📍 GET /health"
curl -s "${BASE_URL}/health" "${AUTH_HEADER[@]}" | jq '.' || curl -s "${BASE_URL}/health" "${AUTH_HEADER[@]}"
echo ""
echo ""

# Test 2: List models
echo "📍 GET /models"
curl -s "${BASE_URL}/models" "${AUTH_HEADER[@]}" | jq '.data[].id' || curl -s "${BASE_URL}/models" "${AUTH_HEADER[@]}"
echo ""
echo ""

# Test 3: Chat completion
echo "📍 POST /v1/chat/completions"
curl -s "${BASE_URL}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  "${AUTH_HEADER[@]}" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Say hello in one sentence."}
    ],
    "max_tokens": 50
  }' | jq '.' || curl -s "${BASE_URL}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  "${AUTH_HEADER[@]}" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Say hello in one sentence."}
    ],
    "max_tokens": 50
  }'

echo ""
echo ""
echo "✅ Tests complete"
