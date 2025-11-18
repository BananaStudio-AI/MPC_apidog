/**
 * Main routes index for MPC-API application
 * Registers all API routes
 */

import { Router } from 'express';
import selectModelRouter from './selectModel.js';

const router = Router();

// Register model selection route
router.use('/api', selectModelRouter);

export default router;
