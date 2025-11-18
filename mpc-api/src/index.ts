/**
 * MPC-API Server
 * Main Express application that proxies requests to LiteLLM Gateway
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

// Import routes
import healthRouter from './routes/health.js';
import modelsRouter from './routes/models.js';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
  }, 'Incoming request');
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/api/models', modelsRouter);
app.use('/api/chat', chatRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'mpc-api',
    version: '1.0.0',
    description: 'MPC API Gateway - Proxies requests to LiteLLM and AI services',
    endpoints: {
      health: '/health',
      models: '/api/models',
      chat: '/api/chat/completions',
    },
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`MPC-API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`LiteLLM URL: ${process.env.LITELLM_BASE_URL || 'http://localhost:4000'}`);
});
