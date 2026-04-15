import { Router } from 'express';
import { prisma } from '../services/db.js';
import { generatePlan } from '../services/claude.service.js';
import { authMiddleware } from '../middleware/auth.js';

export const planRoutes = Router();

planRoutes.use(authMiddleware);

// Generate a new plan from questionnaire
planRoutes.post('/generate-plan', async (req, res) => {
  try {
    const telegramId = BigInt(req.telegramUser!.id);
    const { questionnaire, preferences } = req.body;
    const q = questionnaire || req.body;

    // Find or create user
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {
        questionnaire: q,
        difficulty: preferences?.difficulty || 'medium',
        lastActive: new Date(),
      },
      create: {
        telegramId,
        questionnaire: q,
        difficulty: preferences?.difficulty || 'medium',
        lastActive: new Date(),
      },
    });

    // Generate plan via Claude
    const plan = await generatePlan({
      age: q.age || 45,
      goals: q.goals || [],
      fitnessLevel: q.fitnessLevel || q.activityLevel || 'beginner',
      timeAvailable: q.timeAvailable || 15,
      foodPreferences: q.foodPreferences || [],
      dailySchedule: q.dailySchedule || 'standard',
      trainingTypes: q.trainingTypes || [],
      healthRestrictions: q.healthRestrictions || [],
      measurements: q.measurements,
      nutritionMode: preferences?.nutritionMode,
      difficulty: preferences?.difficulty || user.difficulty,
    });

    // Save plan to DB
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.plan.create({
      data: {
        userId: user.id,
        date: today,
        nutrition: plan.nutrition,
        workout: plan.workout,
      },
    });

    // Update user's current plan
    await prisma.user.update({
      where: { id: user.id },
      data: { currentPlan: plan as any },
    });

    res.json({
      planId: user.id,
      nutrition: plan.nutrition,
      workout: plan.workout,
      weeklyWorkout: plan.weeklyWorkout,
      message: plan.message,
    });
  } catch (err) {
    console.error('[generate-plan] Error:', err);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
});

// Get today's plan
planRoutes.get('/plan/today', async (req, res) => {
  try {
    const telegramId = BigInt(req.telegramUser!.id);

    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plan = await prisma.plan.findFirst({
      where: {
        userId: user.id,
        date: { gte: today },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Always prefer currentPlan from User (has weeklyWorkout)
    if (user.currentPlan) {
      res.json({
        ...(user.currentPlan as any),
        streak: user.streak,
        questionnaire: user.questionnaire,
      });
      return;
    }

    if (!plan) {
      res.status(404).json({ error: 'No plan found. Generate one first.' });
      return;
    }

    res.json({ nutrition: plan.nutrition, workout: plan.workout, streak: user.streak });
  } catch (err) {
    console.error('[plan/today] Error:', err);
    res.status(500).json({ error: 'Failed to get plan' });
  }
});
