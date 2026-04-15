import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionnaireData, PlanResponse, DailyCheckin } from '../types';

interface AppState {
  questionnaire: Partial<QuestionnaireData>;
  plan: PlanResponse | null;
  checkin: Partial<DailyCheckin>;
  streak: number;
  isReturningUser: boolean;
  nutritionMode: 'standard' | 'budget' | 'no-cook' | 'vegetarian';

  setQuestionnaire: (data: Partial<QuestionnaireData>) => void;
  setPlan: (plan: PlanResponse | null) => void;
  setCheckin: (data: Partial<DailyCheckin>) => void;
  setStreak: (streak: number) => void;
  setNutritionMode: (mode: 'standard' | 'budget' | 'no-cook' | 'vegetarian') => void;
  resetCheckin: () => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      questionnaire: {},
      plan: null,
      checkin: {},
      streak: 0,
      isReturningUser: false,
      nutritionMode: 'standard',

      setQuestionnaire: (data) =>
        set((state) => ({ questionnaire: { ...state.questionnaire, ...data } })),

      setPlan: (plan) => set({ plan, isReturningUser: true }),

      setCheckin: (data) =>
        set((state) => ({ checkin: { ...state.checkin, ...data } })),

      setStreak: (streak) => set({ streak }),

      setNutritionMode: (mode) => set({ nutritionMode: mode }),

      resetCheckin: () => set({ checkin: {} }),

      clearAll: () =>
        set({
          questionnaire: {},
          plan: null,
          checkin: {},
          streak: 0,
          isReturningUser: false,
        }),
    }),
    { name: 'wellness-app-store' }
  )
);
