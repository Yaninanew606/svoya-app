export interface QuestionnaireData {
  age: number;
  goals: string[];
  activityLevel: string;
  timeAvailable: number;
  healthRestrictions: string[];
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  ingredients: string[];
  alternatives?: string[];
  prepTime?: number;
}

export interface NutritionPlan {
  mode: 'standard' | 'budget' | 'no-cook' | 'vegetarian';
  totalCalories: number;
  macros: { protein: number; fat: number; carbs: number };
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack?: Meal;
  };
}

export interface Exercise {
  name: string;
  duration?: number;
  reps?: number;
  sets?: number;
  description: string;
  modification?: string;
  isSkippable: boolean;
}

export interface WorkoutPlan {
  duration: 10 | 15 | 20 | 30;
  difficulty: 'easy' | 'medium' | 'hard';
  focus: string;
  phases: {
    warmup: Exercise[];
    main: Exercise[];
    cooldown: Exercise[];
  };
}

export interface DailyCheckin {
  userId: string;
  date: string;
  mood: 1 | 2 | 3 | 4;
  sleep: 'yes' | 'no' | 'almost';
  nutrition: 'yes' | 'partial' | 'no';
  workout: 'yes' | 'partial' | 'no' | 'skipped-health';
  overallStatus: 'good' | 'hard-day' | 'need-easier';
}

export interface PlanResponse {
  planId: string;
  nutrition: NutritionPlan;
  workout: WorkoutPlan;
  message: string;
}

export interface CheckinResponse {
  adjustment: 'easier' | 'harder' | 'same';
  tomorrowPlan: { nutrition: NutritionPlan; workout: WorkoutPlan };
  supportMessage: string;
  streak: number;
}
