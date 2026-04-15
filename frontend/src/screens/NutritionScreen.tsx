import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sunrise, Sun, Moon, Apple, ShoppingCart, Copy, Download,
  Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import TabBar from '../components/TabBar';
import WaterTracker from '../components/WaterTracker';
import type { Meal, NutritionPlan } from '../types';

const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const DAY_NAMES_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const mealKeys = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const mealLabels: Record<string, { icon: typeof Sunrise; label: string }> = {
  breakfast: { icon: Sunrise, label: 'Завтрак' },
  lunch: { icon: Sun, label: 'Обед' },
  dinner: { icon: Moon, label: 'Ужин' },
  snack: { icon: Apple, label: 'Перекус' },
};

function getTodayIndex(): number {
  const jsDay = new Date().getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1; // convert to 0=Mon
}

function buildGroceryList(nutrition: NutritionPlan): string[] {
  const allIngredients: string[] = [];
  const { meals } = nutrition;
  for (const key of mealKeys) {
    const meal = meals[key as keyof typeof meals];
    if (meal) allIngredients.push(...meal.ingredients);
  }
  return [...new Set(allIngredients)];
}

async function copyToClipboard(items: string[]) {
  const text = 'Список продуктов на неделю:\n' + items.map(i => `\u2610 ${i}`).join('\n');
  await navigator.clipboard.writeText(text);
}

function downloadList(items: string[]) {
  const text = 'Список продуктов на неделю\n\n' + items.map(i => `[ ] ${i}`).join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'grocery-list.txt';
  a.click();
  URL.revokeObjectURL(url);
}

/* Week day strip */
function WeekStrip({ selectedDay, onSelect }: { selectedDay: number; onSelect: (i: number) => void }) {
  const today = getTodayIndex();
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-6 -mx-6 scrollbar-hide">
      {DAY_NAMES_SHORT.map((name, i) => {
        const isToday = i === today;
        const isSelected = i === selectedDay;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`flex flex-col items-center min-w-[56px] px-3 py-2.5 rounded-xl border transition-all ${
              isSelected ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-gray-200 bg-white'
            }`}
          >
            <span className={`text-sm font-medium ${isSelected ? 'text-[var(--primary)]' : 'text-gray-500'}`}>
              {name}
            </span>
            {isToday && <div className="w-1 h-1 rounded-full bg-[var(--primary)] mt-1" />}
          </button>
        );
      })}
    </div>
  );
}

/* Meal card */
function MealCard({ mealKey, meal, index }: { mealKey: string; meal: Meal; index: number }) {
  const [showIngredients, setShowIngredients] = useState(false);
  const { icon: MealIcon, label } = mealLabels[mealKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="bg-white rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <MealIcon size={20} className="text-[var(--primary)]" />
        <span className="font-bold text-[var(--text)]">{label}</span>
      </div>

      <p className="font-semibold text-[var(--text)] mb-1">{meal.name}</p>
      <p className="text-sm text-gray-500 mb-2">{meal.description}</p>

      <div className="flex items-center gap-3 text-xs text-gray-400 mb-1">
        <span>{meal.calories} ккал</span>
        <span>белок {meal.protein}г</span>
        {meal.prepTime && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {meal.prepTime} мин
          </span>
        )}
      </div>

      {meal.ingredients.length > 0 && (
        <div className="border-t border-gray-100 pt-2 mt-3">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="flex items-center gap-1 text-sm text-[var(--primary)] font-medium"
          >
            Ингредиенты
            {showIngredients ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {showIngredients && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 text-sm text-gray-500 overflow-hidden"
              >
                {meal.ingredients.map((ing, i) => (
                  <li key={i}>- {ing}</li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/* Grocery list section */
function GroceryList({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggle = (i: number) => setChecked(s => ({ ...s, [i]: !s[i] }));

  const handleCopy = async () => {
    await copyToClipboard(items);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart size={20} className="text-[var(--primary)]" />
        <h2 className="font-bold text-[var(--text)] text-lg">Список продуктов на неделю</h2>
      </div>

      <ul className="space-y-2 mb-5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3">
            <button
              onClick={() => toggle(i)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                checked[i] ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-gray-300'
              }`}
            >
              {checked[i] && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className={`text-sm ${checked[i] ? 'line-through text-gray-400' : 'text-[var(--text)]'}`}>
              {item}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[var(--text)] transition-colors hover:bg-gray-50"
        >
          <Copy size={16} />
          {copied ? 'Скопировано' : 'Скопировать список'}
        </button>
        <button
          onClick={() => downloadList(items)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[var(--text)] transition-colors hover:bg-gray-50"
        >
          <Download size={16} />
          Скачать файл
        </button>
      </div>
    </div>
  );
}

export default function NutritionScreen() {
  const navigate = useNavigate();
  const plan = useAppStore((s) => s.plan);
  const [selectedDay, setSelectedDay] = useState(getTodayIndex);

  useEffect(() => {
    if (!plan) navigate('/', { replace: true });
  }, [plan, navigate]);

  if (!plan) return null;

  const { nutrition } = plan;
  const { totalCalories, macros, meals } = nutrition;

  // Build weekly grocery list (same meals each day, so deduplicate and note x7)
  const dailyIngredients = buildGroceryList(nutrition);
  const weeklyIngredients = dailyIngredients.map(item => `${item} (x7)`);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1
          className="text-2xl font-bold text-[var(--text)]"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Питание
        </h1>
        <p className="text-sm text-gray-400 mt-1">Недельный план</p>
      </div>

      {/* Week strip */}
      <div className="px-6 mb-4">
        <WeekStrip selectedDay={selectedDay} onSelect={setSelectedDay} />
      </div>

      {/* Water tracker */}
      <div className="px-6 mb-4">
        <WaterTracker />
      </div>

      {/* Selected day label */}
      <div className="px-6 mb-4">
        <span className="text-sm font-medium text-gray-500">{DAY_NAMES_FULL[selectedDay]}</span>
      </div>

      {/* Macro summary */}
      <div className="px-6 mb-4">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between text-sm">
            <span>
              ~<span className="font-bold text-[var(--primary)]">{totalCalories}</span> ккал
            </span>
            <span>
              Б: <span className="font-bold text-[var(--primary)]">{macros.protein}</span>г
            </span>
            <span>
              Ж: <span className="font-bold text-[var(--primary)]">{macros.fat}</span>г
            </span>
            <span>
              У: <span className="font-bold text-[var(--primary)]">{macros.carbs}</span>г
            </span>
          </div>
        </motion.div>
      </div>

      {/* Meal cards */}
      <div className="px-6 flex flex-col gap-4 mb-6">
        {mealKeys.map((key, index) => {
          const meal: Meal | undefined = meals[key];
          if (!meal) return null;
          return <MealCard key={`${selectedDay}-${key}`} mealKey={key} meal={meal} index={index} />;
        })}
      </div>

      {/* Food diary link */}
      <div className="px-6 mb-4">
        <button
          onClick={() => navigate('/diary')}
          className="w-full py-3 rounded-2xl border border-[var(--primary)] text-[var(--primary)] font-semibold text-sm transition-colors hover:bg-[var(--primary)]/5"
        >
          Дневник питания
        </button>
      </div>

      {/* Weekly grocery list */}
      <div className="px-6 mb-6">
        <GroceryList items={weeklyIngredients} />
      </div>

      <TabBar />
    </div>
  );
}
