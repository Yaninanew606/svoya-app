import { Router } from 'express';
import { generateMotivation } from '../services/claude.service.js';
import { authMiddleware } from '../middleware/auth.js';

export const motivationRoutes = Router();

motivationRoutes.use(authMiddleware);

motivationRoutes.post('/motivation', async (req, res) => {
  const { mood, sleep, nutrition, workout, streak } = req.body;

  const message = await generateMotivation({
    mood: mood ?? 3,
    sleep: sleep ?? 'normal',
    nutrition: nutrition ?? 'partial',
    workout: workout ?? 'partial',
    streak: streak ?? 0,
  });

  res.json({ message });
});
