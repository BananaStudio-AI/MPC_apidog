/**
 * Chat routes - Proxy to LiteLLM for chat completions
 */

import { Router } from 'express';
import { getLiteLLMClient } from '../clients/litellm.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/chat/completions - Send chat completion request to LiteLLM
 */
router.post('/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens, stream, ...rest } = req.body;

    if (!model || !messages) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'model and messages are required',
      });
    }

    const client = getLiteLLMClient();
    const response = await client.chatCompletion({
      model,
      messages,
      temperature,
      max_tokens,
      stream,
      ...rest,
    });

    res.json(response);
  } catch (error: any) {
    logger.error({ error: error.message }, 'Chat completion failed');
    res.status(500).json({
      error: 'Chat completion failed',
      message: error.message,
    });
  }
});

export default router;
