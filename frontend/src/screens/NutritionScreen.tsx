import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import TabBar from '../components/TabBar';
import type { Meal } from '../types';

const mealKeys = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const mealLabels: Record<string, { emoji: string; label: string }> = {
  breakfast: { emoji: '🌅', label: 'Завтрак' },
  lunch: { emoji: '☀️', label: 'Обед' },
  dinner: { emoji: '🌙', label: 'Ужин' },
  snack: { emoji: '🍎', label: 'Перекус' },
};

const modeFilters = [
  { key: 'no-cook' as const, label: 'Без готовки 🥗' },
  { key: 'budget' as const, label: 'Бюджетно 💰' },
  { key: 'vegetarian' as const, label: 'Вегетарианский 🌱' },
];

export default function NutritionScreen() {
  const navigate = useNavigate();
  const { plan, nutritionMode, setNutritionMode } = useAppStore();
  const [expandedAlts, setExpandedAlts] = useState<Record<string, boolean>>({});
  const [expandedIngr, setExpandedIngr] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!plan) navigate('/', { replace: true });
  }, [plan, navigate]);

  if (!plan) return null;

  const { nutrition } = plan;
  const { totalCalories, macros, meals } = nutrition;

  const toggleAlts = (key: string) =>
    setExpandedAlts((s) => ({ ...s, [key]: !s[key] }));
  const toggleIngr = (key: string) =>
    setExpandedIngr((s) => ({ ...s, [key]: !s[key] }));

  const handleModeClick = (mode: 'no-cook' | 'budget' | 'vegetarian') => {
    const newMode = nutritionMode === mode ? 'standard' : mode;
    setNutritionMode(newMode);
    navigate('/generating', { replace: true });
  };

  const handleSimplify = () => {
    setNutritionMode('no-cook');
    navigate('/generating', { replace: true });
  };

  return (
    <div className="bg-[#FAF7F4] min-h-screen pb-24">
      <div className="px-5 pt-6">
        {/* Header */}
        <h1
          className="text-2xl font-bold text-[#3D2B1F] mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Питание на сегодня 🍽️
        </h1>

        {/* Macro summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
          <div className="flex items-center justify-between text-sm">
            <span>
              ~<span className="font-bold text-[#B5886A]">{totalCalories}</span>{' '}
              ккал
            </span>
            <span>
              Б:{' '}
              <span className="font-bold text-[#B5886A]">{macros.protein}</span>
              г
            </span>
            <span>
              Ж:{' '}
              <span className="font-bold text-[#B5886A]">{macros.fat}</span>г
            </span>
            <span>
              У:{' '}
              <span className="font-bold text-[#B5886A]">{macros.carbs}</span>г
            </span>
          </div>
        </div>

        {/* Mode filters */}
        <div className="flex gap-2 overflow-x-auto mb-5 -mx-5 px-5 scrollbar-hide">
          {modeFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleModeClick(key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors ${
                nutritionMode === key
                  ? 'bg-[#B5886A] text-white'
                  : 'bg-white border border-[#E8D5C4] text-[#3D2B1F]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Meal cards */}
        {mealKeys.map((key, index) => {
          const meal: Meal | undefined = meals[key];
          if (!meal) return null;
          const { emoji, label } = mealLabels[key];

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl p-5 shadow-sm mb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{emoji}</span>
                <span className="font-bold text-[#3D2B1F]">{label}</span>
              </div>

              <p className="font-semibold text-[#3D2B1F] mb-1">{meal.name}</p>
              <p className="text-sm text-[#3D2B1F]/70 mb-2">
                {meal.description}
              </p>

              <div className="flex items-center gap-3 text-xs text-[#3D2B1F]/60 mb-3">
                <span>{meal.calories} ккал · белок {meal.protein}г</span>
                {meal.prepTime && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {meal.prepTime} мин
                  </span>
                )}
              </div>

              {/* Alternatives */}
              {meal.alternatives && meal.alternatives.length > 0 && (
                <div className="border-t border-[#E8D5C4]/50 pt-2">
                  <button
                    onClick={() => toggleAlts(key)}
                    className="flex items-center gap-1 text-sm text-[#B5886A] font-medium"
                  >
                    Замены
                    {expandedAlts[key] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {expandedAlts[key] && (
                    <ul className="mt-2 space-y-1 text-sm text-[#3D2B1F]/70">
                      {meal.alternatives.map((alt, i) => (
                        <li key={i}>• {alt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Ingredients */}
              {meal.ingredients.length > 0 && (
                <div className="border-t border-[#E8D5C4]/50 pt-2 mt-2">
                  <button
                    onClick={() => toggleIngr(key)}
                    className="flex items-center gap-1 text-sm text-[#B5886A] font-medium"
                  >
                    Ингредиенты
                    {expandedIngr[key] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {expandedIngr[key] && (
                    <ul className="mt-2 space-y-1 text-sm text-[#3D2B1F]/70">
                      {meal.ingredients.map((ing, i) => (
                        <li key={i}>• {ing}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Simplify button */}
        <button
          onClick={handleSimplify}
          className="w-full bg-white border border-[#E8D5C4] text-[#3D2B1F] py-3 rounded-2xl text-base font-medium mb-4"
        >
          Сделать проще
        </button>
      </div>

      <TabBar />
    </div>
  );
}
