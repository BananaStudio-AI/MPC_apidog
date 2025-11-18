import express from 'express';
import healthRouter from './routes/health.js';
import chatRouter from './routes/chat.js';
import selectModelRouter from './routes/selectModel.js';
import orchestrateRouter from './routes/orchestrate.js';

const app = express();
app.use(express.json());

app.use(healthRouter);
app.use(chatRouter);
app.use(selectModelRouter);
app.use(orchestrateRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`MPC API server listening on port ${PORT}`);
});

export default app;
