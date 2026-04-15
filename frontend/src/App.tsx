import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

const WelcomeScreen = lazy(() => import('./screens/WelcomeScreen'));
const QuestionnaireScreen = lazy(() => import('./screens/QuestionnaireScreen'));
const GeneratingScreen = lazy(() => import('./screens/GeneratingScreen'));
const NutritionScreen = lazy(() => import('./screens/NutritionScreen'));
const WorkoutScreen = lazy(() => import('./screens/WorkoutScreen'));
const CheckinScreen = lazy(() => import('./screens/CheckinScreen'));
const SupportScreen = lazy(() => import('./screens/SupportScreen'));

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<Loading />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/questionnaire" element={<QuestionnaireScreen />} />
          <Route path="/generating" element={<GeneratingScreen />} />
          <Route path="/nutrition" element={<NutritionScreen />} />
          <Route path="/workout" element={<WorkoutScreen />} />
          <Route path="/checkin" element={<CheckinScreen />} />
          <Route path="/support" element={<SupportScreen />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
