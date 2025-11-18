/**
 * Model routes - Proxy to LiteLLM for model operations
 */

import { Router } from 'express';
import { getLiteLLMClient } from '../clients/litellm.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/models - List available models from LiteLLM
 */
router.get('/', async (req, res) => {
  try {
    const client = getLiteLLMClient();
    const models = await client.getModels();
    res.json(models);
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch models');
    res.status(500).json({
      error: 'Failed to fetch models',
      message: error.message,
    });
  }
});

export default router;
