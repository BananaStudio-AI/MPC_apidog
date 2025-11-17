#!/usr/bin/env python3
"""
LiteLLM Gateway Client
Interacts with the local LiteLLM proxy running on http://localhost:4000
"""

import os
import json
from typing import Optional, Dict, Any, List
import requests


class GatewayClient:
    """Client for interacting with LiteLLM gateway"""
    
    def __init__(
        self,
        base_url: str = "http://localhost:4000",
        api_key: Optional[str] = None
    ):
        """
        Initialize the gateway client.
        
        Args:
            base_url: Base URL of the LiteLLM gateway
            api_key: Optional API key for authentication
        """
        # Allow overriding base URL via env
        self.base_url = (os.getenv('LITELLM_BASE_URL') or base_url).rstrip('/')
        # Prefer explicit arg, else env vars: LITELLM_API_KEY (client) then LITELLM_MASTER_KEY (server-side auth)
        self.api_key = api_key or os.getenv('LITELLM_API_KEY') or os.getenv('LITELLM_MASTER_KEY')
        self.session = requests.Session()
        
        if self.api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {self.api_key}'
            })
    
    def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "openai/gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send a chat completion request.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model identifier (default: openai/gpt-4o-mini)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            **kwargs: Additional parameters to pass to the API
            
        Returns:
            API response as dict
        """
        endpoint = f"{self.base_url}/chat/completions"
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            **kwargs
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        if stream:
            payload["stream"] = True
            return self._stream_completion(endpoint, payload)
        
        response = self.session.post(endpoint, json=payload)
        response.raise_for_status()
        return response.json()
    
    def _stream_completion(self, endpoint: str, payload: Dict[str, Any]):
        """Handle streaming responses"""
        response = self.session.post(endpoint, json=payload, stream=True)
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    data = line_str[6:]
                    if data.strip() == '[DONE]':
                        break
                    try:
                        yield json.loads(data)
                    except json.JSONDecodeError:
                        continue
    
    def completion(
        self,
        prompt: str,
        model: str = "openai/gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send a text completion request.
        
        Args:
            prompt: Text prompt
            model: Model identifier
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional parameters
            
        Returns:
            API response as dict
        """
        endpoint = f"{self.base_url}/completions"
        
        payload = {
            "model": model,
            "prompt": prompt,
            "temperature": temperature,
            **kwargs
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        response = self.session.post(endpoint, json=payload)
        response.raise_for_status()
        return response.json()
    
    def models(self) -> Dict[str, Any]:
        """
        List available models.
        
        Returns:
            API response with available models
        """
        endpoint = f"{self.base_url}/models"
        response = self.session.get(endpoint)
        response.raise_for_status()
        return response.json()
    
    def health(self) -> Dict[str, Any]:
        """
        Check gateway health status.
        
        Returns:
            Health status response
        """
        endpoint = f"{self.base_url}/health"
        response = self.session.get(endpoint)
        response.raise_for_status()
        return response.json()


def main():
    """Example usage of the gateway client"""
    client = GatewayClient()
    
    # Check health
    print("🔍 Checking gateway health...")
    try:
        health = client.health()
        print(f"✓ Gateway healthy: {health}")
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return
    
    # List models
    print("\n📋 Available models:")
    try:
        models = client.models()
        for model in models.get('data', []):
            print(f"  - {model.get('id', 'unknown')}")
    except Exception as e:
        print(f"✗ Failed to list models: {e}")
    
    # Simple chat completion
    print("\n💬 Testing chat completion...")
    try:
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say hello in one sentence."}
        ]
        
        response = client.chat_completion(messages=messages, max_tokens=50)
        
        if 'choices' in response and len(response['choices']) > 0:
            message = response['choices'][0]['message']['content']
            print(f"✓ Response: {message}")
            print(f"  Usage: {response.get('usage', {})}")
        else:
            print(f"✗ Unexpected response format: {response}")
    except Exception as e:
        print(f"✗ Chat completion failed: {e}")
    
    # Streaming example
    print("\n🌊 Testing streaming completion...")
    try:
        messages = [
            {"role": "user", "content": "Count from 1 to 5, one number per line."}
        ]
        
        print("Stream output: ", end="", flush=True)
        for chunk in client.chat_completion(messages=messages, stream=True, max_tokens=50):
            if 'choices' in chunk and len(chunk['choices']) > 0:
                delta = chunk['choices'][0].get('delta', {})
                content = delta.get('content', '')
                if content:
                    print(content, end="", flush=True)
        print()  # Newline after stream
    except Exception as e:
        print(f"\n✗ Streaming failed: {e}")


if __name__ == "__main__":
    main()
