export interface QuestionnaireData {
  age: number;
  goals: string[];
  fitnessLevel: string;
  timeAvailable: number;
  foodPreferences: string[];
  dailySchedule: string;
  trainingTypes: string[];
  healthRestrictions: string[];
  measurements?: {
    height?: number;
    weight?: number;
    waist?: number;
  };
  cycleStatus?: string; // regular, irregular, perimenopause, menopause, skip
  lastPeriodDate?: string; // ISO date
  healthFeatures?: string[]; // postpartum, sedentary_work, headaches, swelling, hot_flashes, sleep_issues
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
  image?: string;
  muscleGroup?: string;
}

export interface WorkoutPlan {
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  focus: string;
  phases: {
    warmup: Exercise[];
    main: Exercise[];
    cooldown: Exercise[];
  };
}

export interface DaySchedule {
  day: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'rest';
  workout: WorkoutPlan | null;
}

export interface WeeklyWorkout {
  schedule: DaySchedule[];
}

export interface DailyCheckin {
  userId: string;
  date: string;
  mood: 1 | 2 | 3 | 4;
  sleep: 'yes' | 'no' | 'almost';
  nutrition: 'yes' | 'partial' | 'no';
  workout: 'yes' | 'partial' | 'no' | 'skipped-health';
  symptoms?: string[];
  overallStatus: 'good' | 'hard-day' | 'need-easier';
}

export interface PlanResponse {
  planId: string;
  nutrition: NutritionPlan;
  workout: WorkoutPlan;
  weeklyWorkout?: WeeklyWorkout;
  message: string;
}

export interface CheckinResponse {
  adjustment: 'easier' | 'harder' | 'same';
  tomorrowPlan: { nutrition: NutritionPlan; workout: WorkoutPlan };
  supportMessage: string;
  streak: number;
}
