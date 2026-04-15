import { Router } from 'express';
import { prisma } from '../services/db.js';
import { generateMotivation } from '../services/claude.service.js';
import { authMiddleware } from '../middleware/auth.js';

export const checkinRoutes = Router();

checkinRoutes.use(authMiddleware);

checkinRoutes.post('/checkin', async (req, res) => {
  try {
  const telegramId = BigInt(req.telegramUser!.id);
  const checkinData = req.body.checkin || req.body;
  const { mood, sleep, nutrition, workout } = checkinData;

  const user = await prisma.user.findUnique({
    where: { telegramId },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Calculate streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const lastCheckin = await prisma.checkin.findFirst({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
  });

  let newStreak = 1;
  if (lastCheckin && lastCheckin.date >= yesterday) {
    newStreak = user.streak + 1;
  }

  // Determine status based on completion
  const completionScore = (nutrition === 'done' ? 1 : 0) + (workout === 'done' ? 1 : 0);
  const status = completionScore === 2 ? 'complete' : completionScore === 1 ? 'partial' : 'skipped';

  // Adaptive difficulty logic
  let newDifficulty = user.difficulty;
  if (mood <= 1 || (status === 'skipped' && newStreak <= 1)) {
    // Bad day or consistently skipping — lower difficulty
    if (newDifficulty === 'hard') newDifficulty = 'medium';
    else if (newDifficulty === 'medium') newDifficulty = 'easy';
  } else if (mood >= 4 && status === 'complete' && newStreak >= 5) {
    // Feeling great, completing everything, long streak — raise difficulty
    if (newDifficulty === 'easy') newDifficulty = 'medium';
    else if (newDifficulty === 'medium') newDifficulty = 'hard';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Save checkin
  const checkin = await prisma.checkin.create({
    data: {
      userId: user.id,
      date: today,
      mood,
      sleep,
      nutrition,
      workout,
      status,
    },
  });

  // Update user streak and difficulty
  await prisma.user.update({
    where: { id: user.id },
    data: {
      streak: newStreak,
      lastActive: new Date(),
      difficulty: newDifficulty,
    },
  });

  // Generate motivation message
  const motivationMessage = await generateMotivation({
    mood,
    sleep,
    nutrition,
    workout,
    streak: newStreak,
  });

  res.json({
    adjustment: newDifficulty !== user.difficulty ? (newDifficulty === 'easy' ? 'easier' : 'harder') : 'same',
    supportMessage: motivationMessage,
    streak: newStreak,
    tomorrowPlan: user.currentPlan || {},
  });
  } catch (err) {
    console.error('[checkin] Error:', err);
    res.status(500).json({ error: 'Failed to save checkin' });
  }
});
