import type {
  QuestionnaireData,
  PlanResponse,
  NutritionPlan,
  WorkoutPlan,
  DailyCheckin,
  CheckinResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

function getInitData(): string {
  try {
    return window.Telegram?.WebApp?.initData || '';
  } catch {
    return '';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  generatePlan: (data: {
    questionnaire: QuestionnaireData;
    preferences?: { nutritionMode?: string; difficulty?: string };
  }) =>
    request<PlanResponse>('/api/generate-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTodayPlan: () =>
    request<{ nutrition: NutritionPlan; workout: WorkoutPlan; streak: number }>(
      '/api/plan/today'
    ),

  submitCheckin: (checkin: DailyCheckin) =>
    request<CheckinResponse>('/api/checkin', {
      method: 'POST',
      body: JSON.stringify({ checkin }),
    }),

  getMotivation: (context: string) =>
    request<{ message: string }>('/api/motivation', {
      method: 'POST',
      body: JSON.stringify({ context }),
    }),
};
