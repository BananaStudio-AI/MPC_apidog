import { Router } from 'express';
import { getModelByAlias } from '../catalog/catalog.js';

const router = Router();

const LITELLM_ENDPOINT = 'http://litellm:4000/chat/completions';

router.post('/api/chat/completions', async (req, res) => {
  const { model } = req.body;

  if (!model) {
    return res.status(400).json({ error: 'Missing model alias' });
  }

  const resolvedModel = getModelByAlias(model);

  if (!resolvedModel) {
    return res.status(400).json({ error: `Unknown model alias: ${model}` });
  }

  try {
    const response = await fetch(LITELLM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, model: resolvedModel.provider_id })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('LiteLLM proxy error:', error);
    return res.status(502).json({ error: 'Failed to reach LiteLLM proxy' });
  }
});

export default router;
