import { Router } from 'express';
import { loadModelCatalog, ModelEntry, ModelTier } from '../catalog/catalog.js';

const router = Router();

const tierPriority: Record<ModelTier, number> = {
  flagship: 3,
  strong: 2,
  draft: 1
};

const matchesCriteria = (
  model: ModelEntry,
  taskType?: string,
  domain?: string,
  modality?: string
) => {
  const taskMatches = !taskType || model.task_types.includes(taskType);
  const domainMatches = !domain || model.domains.includes(domain);
  const modalityMatches = !modality || model.modality === modality;
  return taskMatches && domainMatches && modalityMatches;
};

router.post('/api/select-model', (req, res) => {
  const { task_type: taskType, domain, modality } = req.body as {
    task_type?: string;
    domain?: string;
    modality?: string;
  };

  const catalog = loadModelCatalog();
  const eligible = catalog.filter((model) => matchesCriteria(model, taskType, domain, modality));

  if (eligible.length === 0) {
    return res.status(404).json({ error: 'No models match the provided criteria' });
  }

  const bestModel = eligible.sort(
    (a, b) => tierPriority[b.tier] - tierPriority[a.tier]
  )[0];

  return res.json({ model: bestModel });
});

export default router;
