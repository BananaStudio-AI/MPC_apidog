import { Router } from 'express';

const router = Router();

router.post('/api/orchestrate', (req, res) => {
  const { job_type: jobType } = req.body as { job_type?: string };

  if (jobType === 'tariff_video_overlay') {
    return res.json({
      job_type: jobType,
      steps: [
        'Transcribe the video to extract spoken tariff details.',
        'Generate on-screen overlay text and positioning for the tariffs.',
        'Render the final video with the tariff overlay applied.'
      ]
    });
  }

  return res.status(400).json({ error: `Unsupported job_type: ${jobType ?? 'unknown'}` });
});

export default router;
