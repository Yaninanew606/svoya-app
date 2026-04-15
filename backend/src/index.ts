import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { planRoutes } from './routes/plan.js';
import { checkinRoutes } from './routes/checkin.js';
import { motivationRoutes } from './routes/motivation.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', planRoutes);
app.use('/api', checkinRoutes);
app.use('/api', motivationRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

import { startBot } from './bot/index.js';
startBot();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
