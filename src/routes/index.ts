import { Router } from 'express';
import orchestrateRouter from './orchestrate.js';

const router = Router();

// Register routes
router.use(orchestrateRouter);

export default router;
