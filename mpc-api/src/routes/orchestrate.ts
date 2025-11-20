 import { Router, Request, Response } from 'express';

const router = Router();

router.post('/api/orchestrate', (req: Request, res: Response) => {
  const { job_type: jobType } = req.body as { job_type?: string };

  const plans: Record<
    string,
    { steps: Array<{ step: string; model: string }> }
  > = {
    tariff_video_overlay: {
      steps: [
        { step: 'transcribe_audio', model: 'text_general_draft' },
        { step: 'layout_tariff_overlay', model: 'text_tariff_precision' },
        { step: 'render_video', model: 'video_overlay_flagship' }
      ]
    },
    campaign_video_overlay: {
      steps: [
        { step: 'generate_campaign_script', model: 'text_reasoning_flagship' },
        { step: 'breakdown_scenes', model: 'text_general_flagship' },
        { step: 'layout_overlay_spec', model: 'text_tariff_precision' },
        { step: 'render_video', model: 'video_overlay_flagship' }
      ]
    },
    youtube_explainer_video: {
      steps: [
        { step: 'outline_chapters', model: 'text_reasoning_flagship' },
        { step: 'write_script', model: 'text_general_flagship' },
        { step: 'generate_thumbnail_prompt', model: 'image_brand_assets' },
        { step: 'render_thumbnail', model: 'image_brand_pack_flagship' }
      ]
    },
    tiktok_short_vertical: {
      steps: [
        { step: 'generate_hook_script', model: 'text_hook_fast' },
        { step: 'storyboard_short', model: 'text_general_flagship' },
        { step: 'render_vertical_video', model: 'video_overlay_fast' }
      ]
    },
    brand_pack_assets: {
      steps: [
        { step: 'brand_positioning_summary', model: 'text_reasoning_flagship' },
        { step: 'script_snippets', model: 'text_general_draft' },
        { step: 'image_prompt_pack', model: 'image_brand_pack_flagship' }
      ]
    },
    storyboard_with_frames: {
      steps: [
        { step: 'story_outline', model: 'text_reasoning_flagship' },
        { step: 'expand_frames', model: 'text_general_flagship' },
        { step: 'camera_and_motion_notes', model: 'text_reasoning_flagship' }
      ]
    }
  };

  if (!jobType || !plans[jobType]) {
    return res.status(400).json({ error: `Unsupported job_type: ${jobType ?? 'unknown'}` });
  }

  return res.json({
    job_type: jobType,
    plan: plans[jobType]
  });
});

export default router;
