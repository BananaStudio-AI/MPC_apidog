#!/usr/bin/env python3
"""
Quick test: POST /v1/chat/completions
"""

import os
import requests
import json
import sys

# Gateway endpoint
BASE_URL = os.getenv("LITELLM_BASE_URL", "http://localhost:4000")

def test_chat_completion(model="gpt-4o-mini", message="Hello! Reply in one sentence."):
    """Send a chat completion request"""
    
    url = f"{BASE_URL}/v1/chat/completions"
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": message}
        ],
        "temperature": 0.7,
        "max_tokens": 100
    }
    
    print(f"🔄 POST {url}")
    print(f"📝 Model: {model}")
    print(f"💬 Message: {message}\n")
    
    try:
        headers = {"Content-Type": "application/json"}
        # Use env-provided gateway auth if present
        api_key = os.getenv("LITELLM_API_KEY") or os.getenv("LITELLM_MASTER_KEY")
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # Pretty print response
        print("✅ Response:")
        print(json.dumps(data, indent=2))
        
        # Extract message
        if 'choices' in data and len(data['choices']) > 0:
            content = data['choices'][0]['message']['content']
            print(f"\n💡 Assistant: {content}")
            
        # Show usage
        if 'usage' in data:
            usage = data['usage']
            print(f"\n📊 Tokens: {usage.get('total_tokens')} " +
                  f"(prompt: {usage.get('prompt_tokens')}, " +
                  f"completion: {usage.get('completion_tokens')})")
            
        return data
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Is LiteLLM server running on port 4000?")
        print("\nStart server with:")
        print("  litellm --config litellm_config.yaml --port 4000")
        sys.exit(1)
        
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        sys.exit(1)
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        print(f"Response: {e.response.text}")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Parse command line args
    model = sys.argv[1] if len(sys.argv) > 1 else "gpt-4o-mini"
    message = sys.argv[2] if len(sys.argv) > 2 else "Hello! Reply in one sentence."
    
    test_chat_completion(model, message)
