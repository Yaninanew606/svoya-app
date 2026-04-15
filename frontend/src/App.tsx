import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './stores/appStore';
import { api } from './api/client';

const WelcomeScreen = lazy(() => import('./screens/WelcomeScreen'));
const QuestionnaireScreen = lazy(() => import('./screens/QuestionnaireScreen'));
const GeneratingScreen = lazy(() => import('./screens/GeneratingScreen'));
const NutritionScreen = lazy(() => import('./screens/NutritionScreen'));
const WorkoutScreen = lazy(() => import('./screens/WorkoutScreen'));
const CheckinScreen = lazy(() => import('./screens/CheckinScreen'));
const SupportScreen = lazy(() => import('./screens/SupportScreen'));
const WeeklyPlanScreen = lazy(() => import('./screens/WeeklyPlanScreen'));
const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen'));
const FoodDiaryScreen = lazy(() => import('./screens/FoodDiaryScreen'));

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
      <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SessionRestorer({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, setPlan, setQuestionnaire, setStreak } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Only restore on initial load at root path
    if (location.pathname !== '/' || plan) {
      setReady(true);
      return;
    }

    api.getTodayPlan()
      .then((data: any) => {
        // Restore plan into store
        setPlan({
          planId: data.planId || '',
          nutrition: data.nutrition,
          workout: data.workout,
          weeklyWorkout: data.weeklyWorkout,
          message: data.message || '',
        });
        if (data.streak) setStreak(data.streak);
        if (data.questionnaire) setQuestionnaire(data.questionnaire);
        // Navigate to weekly plan (returning user)
        navigate('/weekly-plan', { replace: true });
      })
      .catch(() => {
        // No plan found — show welcome screen as normal
      })
      .finally(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <Loading />;
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();

  return (
    <SessionRestorer>
      <Suspense fallback={<Loading />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/questionnaire" element={<QuestionnaireScreen />} />
            <Route path="/generating" element={<GeneratingScreen />} />
            <Route path="/weekly-plan" element={<WeeklyPlanScreen />} />
            <Route path="/nutrition" element={<NutritionScreen />} />
            <Route path="/workout" element={<WorkoutScreen />} />
            <Route path="/checkin" element={<CheckinScreen />} />
            <Route path="/support" element={<SupportScreen />} />
            <Route path="/analytics" element={<AnalyticsScreen />} />
            <Route path="/diary" element={<FoodDiaryScreen />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </SessionRestorer>
  );
}
