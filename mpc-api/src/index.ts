import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL || 'http://litellm:4000';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'mpc-api',
    timestamp: new Date().toISOString(),
    litellm_url: LITELLM_BASE_URL
  });
});

// List available models from LiteLLM
app.get('/api/models', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${LITELLM_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`LiteLLM returned status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching models from LiteLLM:', error);
    res.status(502).json({
      error: 'Failed to fetch models from LiteLLM',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Chat completions endpoint - proxy to LiteLLM
app.post('/api/chat/completions', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${LITELLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.LITELLM_API_KEY && {
          'Authorization': `Bearer ${process.env.LITELLM_API_KEY}`
        })
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LiteLLM returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling LiteLLM chat completions:', error);
    res.status(502).json({
      error: 'Failed to complete chat request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MPC-API server listening on port ${PORT}`);
  console.log(`LiteLLM Gateway: ${LITELLM_BASE_URL}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
