import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fetch from 'node-fetch';
import { errorHandler, ErrorTypes, asyncHandler, successResponse } from './errors.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// API Key authentication middleware
const requireApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  const validKey = process.env.MPC_API_KEY;

  if (!validKey) {
    // If no API key is configured, skip authentication
    return next();
  }

  if (!apiKey || apiKey !== validKey) {
    throw ErrorTypes.UNAUTHORIZED('Invalid or missing API key');
  }

  next();
};

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mpc-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// LiteLLM proxy helper
async function callLiteLLM(messages, model = 'gpt-4o-mini', options = {}) {
  const litellmBaseUrl = process.env.LITELLM_BASE_URL || 'http://localhost:4000';
  const litellmApiKey = process.env.LITELLM_API_KEY;

  const response = await fetch(`${litellmBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(litellmApiKey && { 'Authorization': `Bearer ${litellmApiKey}` })
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      ...options
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw ErrorTypes.LLM_ERROR(`LiteLLM request failed: ${response.statusText}`, { error });
  }

  return await response.json();
}

// Generate script endpoint
app.post('/generate/script', requireApiKey, asyncHandler(async (req, res) => {
  const { prompt, style, duration, context } = req.body;

  if (!prompt) {
    throw ErrorTypes.BAD_REQUEST('Prompt is required', { field: 'prompt' });
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a creative video script writer. Generate engaging scripts based on user prompts.'
    },
    {
      role: 'user',
      content: `Generate a video script for: ${prompt}${style ? `\nStyle: ${style}` : ''}${duration ? `\nTarget duration: ${duration} seconds` : ''}`
    }
  ];

  try {
    const llmResponse = await callLiteLLM(messages);
    const script = llmResponse.choices[0].message.content;

    const result = {
      id: `script_${Date.now()}`,
      script,
      metadata: {
        prompt,
        style: style || null,
        duration: duration || null,
        context: context || null,
        generatedAt: new Date().toISOString()
      }
    };

    res.json(successResponse(result, 'Script generated successfully'));
  } catch (error) {
    throw ErrorTypes.GENERATION_FAILED('Failed to generate script', { 
      originalError: error.message 
    });
  }
}));

// Generate thumbnail prompt endpoint
app.post('/generate/thumbnail-prompt', requireApiKey, asyncHandler(async (req, res) => {
  const { script_id, script_content, style_preferences, keywords } = req.body;

  if (!script_content) {
    throw ErrorTypes.BAD_REQUEST('Script content is required', { field: 'script_content' });
  }

  const messages = [
    {
      role: 'system',
      content: 'You are an expert at creating compelling image generation prompts for thumbnails.'
    },
    {
      role: 'user',
      content: `Create a detailed image prompt for a thumbnail based on this script: ${script_content}${style_preferences ? `\nStyle preferences: ${JSON.stringify(style_preferences)}` : ''}${keywords ? `\nKeywords: ${keywords.join(', ')}` : ''}`
    }
  ];

  try {
    const llmResponse = await callLiteLLM(messages, 'gpt-4o-mini');
    const prompt = llmResponse.choices[0].message.content;

    const result = {
      script_id: script_id || null,
      prompt,
      style_tags: keywords || [],
      generatedAt: new Date().toISOString()
    };

    res.json(successResponse(result, 'Thumbnail prompt generated successfully'));
  } catch (error) {
    throw ErrorTypes.GENERATION_FAILED('Failed to generate thumbnail prompt', {
      originalError: error.message
    });
  }
}));

// Generate metadata endpoint
app.post('/generate/metadata', requireApiKey, asyncHandler(async (req, res) => {
  const { content, title } = req.body;

  if (!content) {
    throw ErrorTypes.BAD_REQUEST('Content is required', { field: 'content' });
  }

  const messages = [
    {
      role: 'system',
      content: 'You are an SEO expert. Generate optimized titles, descriptions, and tags for content.'
    },
    {
      role: 'user',
      content: `Generate metadata (title, description, and tags) for this content:\n\nTitle: ${title || 'Untitled'}\n\nContent: ${content}\n\nRespond in JSON format with: { "title": "...", "description": "...", "tags": ["..."] }`
    }
  ];

  try {
    const llmResponse = await callLiteLLM(messages, 'gpt-4o-mini', { temperature: 0.5 });
    const metadataText = llmResponse.choices[0].message.content;
    
    // Try to parse JSON from the response
    const jsonMatch = metadataText.match(/\{[\s\S]*\}/);
    const metadata = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      title: title || 'Generated Content',
      description: metadataText,
      tags: []
    };

    res.json(successResponse(metadata, 'Metadata generated successfully'));
  } catch (error) {
    throw ErrorTypes.GENERATION_FAILED('Failed to generate metadata', {
      originalError: error.message
    });
  }
}));

// 404 handler
app.use((req, res) => {
  throw ErrorTypes.NOT_FOUND(`Endpoint not found: ${req.method} ${req.path}`);
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MPC-API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`LiteLLM URL: ${process.env.LITELLM_BASE_URL || 'http://localhost:4000'}`);
});
