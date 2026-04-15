import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sunrise, Sun, Moon, Apple, ShoppingCart, Copy, Download,
  Clock, ChevronDown, Timer, Droplets, ClipboardList,
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import TabBar from '../components/TabBar';
import WaterTracker from '../components/WaterTracker';
import FastingWindow from '../components/FastingWindow';
import type { Meal, NutritionPlan } from '../types';

const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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

/* Calculate meal times from fasting window or defaults */
function getMealTimes(fastingEnabled: boolean): { times: Record<string, string>; hideMeals: string[] } {
  if (!fastingEnabled) {
    return {
      times: { breakfast: '08:00', lunch: '13:00', snack: '16:00', dinner: '18:30' },
      hideMeals: [],
    };
  }
  let start = 12, end = 20;
  try {
    const stored = localStorage.getItem('fasting-window');
    if (stored) {
      const parsed = JSON.parse(stored);
      start = parsed.start;
      end = parsed.end;
    }
  } catch {}
  const duration = end - start;
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');

  if (duration <= 6) {
    // Short window (18:6 or less) — only 2 meals, no snack, no breakfast
    return {
      times: {
        lunch: `${pad(start)}:00`,
        dinner: `${pad(end - 1)}:00`,
      },
      hideMeals: ['breakfast', 'snack'],
    };
  }
  // 8+ hour window — 3 meals, no snack, no breakfast
  const mid = start + duration / 2;
  return {
    times: {
      lunch: `${pad(start)}:00`,
      dinner: `${pad(mid)}:00`,
      snack: `${pad(end - 1)}:00`, // это третий полноценный приём, не перекус
    },
    hideMeals: ['breakfast'],
  };
}

/* Meal card — compact by default, expandable */
function MealCard({ mealKey, meal, mealTime, labelOverride }: { mealKey: string; meal: Meal; index?: number; mealTime?: string; labelOverride?: string }) {
  const [expanded, setExpanded] = useState(false);
  const { icon: MealIcon, label: defaultLabel } = mealLabels[mealKey];
  const label = labelOverride || defaultLabel;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Compact header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4"
      >
        <MealIcon size={18} className="text-[var(--primary)] shrink-0" />
        <span className="font-medium text-[var(--text)] text-sm shrink-0">{label}</span>
        <span className="text-sm text-gray-500 truncate flex-1 text-left">· {meal.name}</span>
        <span className="text-xs text-gray-400 shrink-0">{meal.calories} ккал</span>
        {mealTime && <span className="text-xs text-gray-300 shrink-0">{mealTime}</span>}
        <ChevronDown size={14} className={`text-gray-300 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <p className="text-sm text-gray-500 mb-2">{meal.description}</p>
              <div className="flex gap-3 text-xs text-gray-400 mb-2">
                <span>белок {meal.protein}г</span>
                {meal.prepTime && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {meal.prepTime} мин
                  </span>
                )}
              </div>
              {meal.ingredients.length > 0 && (
                <ul className="space-y-1 text-xs text-gray-400">
                  {meal.ingredients.map((ing, i) => (
                    <li key={i}>· {ing}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Slide panel from right */
function SlidePanel({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[var(--background)] z-50 shadow-2xl overflow-y-auto"
          >
            <div className="p-6 pt-12">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* Grocery list section */
function GroceryList({ items }: { items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggle = (i: number) => setChecked(s => ({ ...s, [i]: !s[i] }));

  const handleCopy = async () => {
    await copyToClipboard(items);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4"
      >
        <ShoppingCart size={18} className="text-[var(--primary)] shrink-0" />
        <span className="font-medium text-[var(--text)] text-sm flex-1 text-left">Список продуктов на неделю</span>
        <span className="text-xs text-gray-400 shrink-0">{items.length} продуктов</span>
        <ChevronDown size={14} className={`text-gray-300 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <ul className="space-y-2 mb-4">
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
                  {copied ? 'Скопировано' : 'Скопировать'}
                </button>
                <button
                  onClick={() => downloadList(items)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[var(--text)] transition-colors hover:bg-gray-50"
                >
                  <Download size={16} />
                  Скачать
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MOTIVATIONS = [
  'Каждый день — маленький шаг к большим изменениям',
  'Ты уже здесь — значит, заботишься о себе',
  'Сегодня отличный день, чтобы сделать что-то для себя',
  'Твоё тело благодарно за каждое доброе решение',
  'Не идеально — а по-своему. И это правильно',
  'Маленькие привычки создают большие перемены',
  'Ты сильнее, чем думаешь',
  'Забота о себе — не эгоизм, а необходимость',
  'Один день за раз. Ты справляешься',
  'Лучшее время начать — сейчас. И ты уже начала',
  'Прогресс важнее перфекционизма',
  'Слушай своё тело — оно знает, что нужно',
  'Ты заслуживаешь чувствовать себя хорошо',
  'Движение — это благодарность своему телу',
];

function getTelegramFirstName(): string {
  try {
    // Try Telegram WebApp SDK
    const tgUser = (window.Telegram?.WebApp?.initDataUnsafe?.user as any);
    if (tgUser?.first_name) {
      // Cache it for next time
      localStorage.setItem('tg_first_name', tgUser.first_name);
      return tgUser.first_name;
    }
    // Fallback to cached name
    return localStorage.getItem('tg_first_name') || '';
  } catch {
    return localStorage.getItem('tg_first_name') || '';
  }
}

export default function NutritionScreen() {
  const navigate = useNavigate();
  const plan = useAppStore((s) => s.plan);
  const questionnaire = useAppStore((s) => s.questionnaire);
  const [selectedDay, setSelectedDay] = useState(getTodayIndex);
  const questionnaireFasting = questionnaire.foodPreferences?.includes('intermittent_fasting');
  const [fastingEnabled, setFastingEnabled] = useState(() => {
    const stored = localStorage.getItem('fasting-enabled');
    return stored !== null ? stored === 'true' : !!questionnaireFasting;
  });
  const [showFastingPanel, setShowFastingPanel] = useState(false);
  const [showWaterPanel, setShowWaterPanel] = useState(false);
  const [, forceUpdate] = useState(0);

  const toggleFasting = () => {
    const next = !fastingEnabled;
    setFastingEnabled(next);
    localStorage.setItem('fasting-enabled', String(next));
    if (next) setShowFastingPanel(true);
  };
  const firstName = useMemo(() => getTelegramFirstName(), []);
  const motivation = useMemo(() => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)], []);

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
          {firstName ? `Привет, ${firstName}` : 'Питание'}
        </h1>
        <p className="text-sm text-gray-400 mt-1 leading-relaxed">{motivation}</p>
        {plan.cyclePhase && (
          <div className="flex items-center gap-2 mt-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  plan.cyclePhase.phase === 'menstrual' ? '#F9A8D4'
                  : plan.cyclePhase.phase === 'follicular' ? '#7A9E7E'
                  : plan.cyclePhase.phase === 'ovulation' ? '#F59E0B'
                  : '#A78BFA',
              }}
            />
            <span className="text-xs text-gray-400">
              День {plan.cyclePhase.day} цикла · {plan.cyclePhase.name} · {
                plan.cyclePhase.intensity === 'light' ? 'Мягче с нагрузкой'
                : plan.cyclePhase.intensity === 'high' ? 'Можно интенсивнее'
                : 'Умеренная нагрузка'
              }
            </span>
          </div>
        )}
      </div>

      {/* Week strip */}
      <div className="px-6 mb-4">
        <WeekStrip selectedDay={selectedDay} onSelect={setSelectedDay} />
      </div>

      {/* Quick tools — big touch targets */}
      <div className="px-6 mb-4 flex justify-between gap-3">
        <button
          onClick={() => fastingEnabled ? setShowFastingPanel(true) : toggleFasting()}
          className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-white rounded-2xl shadow-sm relative"
        >
          <Timer size={22} className={fastingEnabled ? 'text-[var(--accent)]' : 'text-gray-400'} />
          <span className="text-[10px] text-gray-500">Голодание</span>
          {fastingEnabled && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
        </button>
        <button
          onClick={() => setShowWaterPanel(true)}
          className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-white rounded-2xl shadow-sm"
        >
          <Droplets size={22} className="text-gray-400" />
          <span className="text-[10px] text-gray-500">Вода</span>
        </button>
        <button
          onClick={() => navigate('/diary')}
          className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-white rounded-2xl shadow-sm"
        >
          <ClipboardList size={22} className="text-gray-400" />
          <span className="text-[10px] text-gray-500">Дневник</span>
        </button>
      </div>

      {/* Slide panels */}
      <SlidePanel open={showFastingPanel} onClose={() => { setShowFastingPanel(false); forceUpdate(n => n + 1); }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text)]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Интервальное голодание</h2>
          <button onClick={() => { setFastingEnabled(false); localStorage.setItem('fasting-enabled', 'false'); setShowFastingPanel(false); }} className="text-xs text-red-400">Выключить</button>
        </div>
        <FastingWindow dailySchedule={questionnaire.dailySchedule} />
      </SlidePanel>

      <SlidePanel open={showWaterPanel} onClose={() => setShowWaterPanel(false)}>
        <h2 className="text-lg font-bold text-[var(--text)] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Трекер воды</h2>
        <WaterTracker />
      </SlidePanel>

      {/* Today's summary */}
      <div className="px-6 mb-3">
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center justify-between text-sm">
          <span>
            ~<span className="font-bold text-[var(--primary)]">{totalCalories}</span> ккал
          </span>
          <span>
            Б <span className="font-bold text-[var(--primary)]">{macros.protein}</span>
          </span>
          <span>
            Ж <span className="font-bold text-[var(--primary)]">{macros.fat}</span>
          </span>
          <span>
            У <span className="font-bold text-[var(--primary)]">{macros.carbs}</span>
          </span>
        </div>
      </div>

      {/* Meal cards */}
      <div className="px-6 flex flex-col gap-1.5 mb-4">
        {mealKeys.map((key, index) => {
          const meal: Meal | undefined = meals[key];
          if (!meal) return null;
          const { times, hideMeals } = getMealTimes(fastingEnabled);
          if (hideMeals.includes(key)) return null;
          const mealTime = times[key as keyof typeof times];
          // Rename "snack" to full meal label in fasting mode
          const labelOverride = fastingEnabled && key === 'snack' ? 'Третий приём' : undefined;
          // Rename first meal
          const firstMealLabel = fastingEnabled && key === 'lunch' ? 'Первый приём' : undefined;
          return <MealCard key={`${selectedDay}-${key}`} mealKey={key} meal={meal} index={index} mealTime={mealTime} labelOverride={firstMealLabel || labelOverride} />;
        })}
      </div>

      {/* Weekly grocery list — collapsed */}
      <div className="px-6 mb-4">
        <GroceryList items={weeklyIngredients} />
      </div>

      <TabBar />
    </div>
  );
}
