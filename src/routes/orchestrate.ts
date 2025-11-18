import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/orchestrate
router.post('/api/orchestrate', (req: Request, res: Response) => {
  const { job_type } = req.body;

  // Handle tariff_video_overlay job type
  if (job_type === 'tariff_video_overlay') {
    return res.json([
      { step: 'generate_text', model: 'text_tariff_precision' },
      { step: 'layout_overlay_spec', model: 'text_general_high' },
      { step: 'render_video', model: 'video_animated_text_overlay' }
    ]);
  }

  // Handle unknown job types
  return res.status(400).json({
    error: 'No orchestration plan exists for this job_type yet.'
  });
});

export default router;
