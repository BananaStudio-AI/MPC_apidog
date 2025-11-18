/**
 * Health check routes
 */

import { Router } from 'express';
import { getLiteLLMClient } from '../clients/litellm.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /health - Health check for MPC-API and dependencies
 */
router.get('/', async (req, res) => {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mpc-api',
    version: '1.0.0',
    checks: {
      litellm: 'unknown',
    },
  };

  // Check LiteLLM gateway
  try {
    const client = getLiteLLMClient();
    await client.health();
    health.checks.litellm = 'ok';
  } catch (error: any) {
    logger.warn({ error: error.message }, 'LiteLLM health check failed');
    health.checks.litellm = 'error';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
