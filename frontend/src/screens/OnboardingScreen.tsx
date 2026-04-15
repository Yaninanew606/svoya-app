import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const TYPE_LABELS: Record<string, string> = {
  strength: 'Силовая',
  cardio: 'Кардио',
  flexibility: 'Растяжка',
  rest: 'Отдых',
};

const TYPE_DOT_COLORS: Record<string, string> = {
  strength: 'bg-orange-400',
  cardio: 'bg-rose-400',
  flexibility: 'bg-teal-400',
  rest: 'bg-gray-300',
};

const TYPE_BG_COLORS: Record<string, string> = {
  strength: 'bg-orange-50',
  cardio: 'bg-rose-50',
  flexibility: 'bg-teal-50',
  rest: 'bg-gray-50',
};

const DAY_ABBR = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const questionnaire = useAppStore((s) => s.questionnaire);
  const plan = useAppStore((s) => s.plan);
  const [slide, setSlide] = useState(0);

  const q = questionnaire;
  const schedule = plan?.weeklyWorkout?.schedule || [];
  const nutrition = plan?.nutrition;

  const personalizedTexts = useMemo(() => {
    const texts: string[] = [];

    if (q.cycleStatus === 'regular' || q.cycleStatus === 'irregular') {
      texts.push('Я учла фазы твоего цикла — нагрузка будет меняться в зависимости от дня');
    }
    if (q.cycleStatus === 'perimenopause') {
      texts.push('Программа адаптирована под перименопаузу — мягче в дни с приливами, активнее когда энергия есть');
    }
    if (q.cycleStatus === 'menopause') {
      texts.push('Упор на укрепление костей и суставов — это особенно важно сейчас');
    }

    if (q.foodPreferences?.includes('no_meat')) {
      texts.push('Все блюда без мяса — растительный белок, бобовые, яйца');
    }
    if (q.foodPreferences?.includes('intermittent_fasting')) {
      texts.push('Питание в окне 8 часов — с учётом твоего режима дня');
    }
    if (q.foodPreferences?.includes('no_dairy')) {
      texts.push('Без молочных продуктов — растительные альтернативы');
    }

    if (q.healthFeatures?.includes('postpartum')) {
      texts.push('Добавлены упражнения для тазового дна — после родов это важно');
    }
    if (q.healthFeatures?.includes('sedentary_work')) {
      texts.push('Акцент на осанку и разминку для спины — для сидячей работы');
    }

    if (q.fitnessLevel === 'beginner') {
      texts.push('Начинаем мягко — каждое упражнение с модификацией, нагрузку увеличим постепенно');
    }

    if (q.healthRestrictions?.includes('knees')) {
      texts.push('Исключены прыжки и глубокие приседания — берегём колени');
    }
    if (q.healthRestrictions?.includes('back')) {
      texts.push('Добавлены упражнения для укрепления спины по методу Бубновского');
    }

    return texts;
  }, [q]);

  const weekSummary = useMemo(() => {
    const counts: Record<string, number> = { strength: 0, cardio: 0, flexibility: 0, rest: 0 };
    let totalDuration = 0;
    let daysWithWorkout = 0;
    schedule.forEach((d) => {
      counts[d.type] = (counts[d.type] || 0) + 1;
      if (d.workout) {
        totalDuration += d.workout.duration;
        daysWithWorkout++;
      }
    });
    const avgDuration = daysWithWorkout > 0 ? Math.round(totalDuration / daysWithWorkout) : 0;
    return { counts, avgDuration };
  }, [schedule]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <AnimatePresence mode="wait">
        {slide === 0 && (
          <motion.div
            key="slide-0"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col px-6 pt-12 pb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-[var(--primary)]" />
              <span className="text-sm text-[var(--primary)] font-medium">Вот что я для тебя подобрала</span>
            </div>

            <h1
              className="text-3xl font-bold text-[var(--text)] mb-1"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Твой персональный план готов
            </h1>

            {q.age && (
              <p className="text-base text-gray-400 mb-6">
                Для тебя, {q.age} лет
              </p>
            )}

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {personalizedTexts.map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.35 }}
                  className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[var(--primary)]"
                >
                  <p className="text-sm text-[var(--text)] leading-relaxed">{text}</p>
                </motion.div>
              ))}

              {personalizedTexts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[var(--primary)]"
                >
                  <p className="text-sm text-[var(--text)] leading-relaxed">
                    Программа составлена с учётом твоих целей и уровня подготовки
                  </p>
                </motion.div>
              )}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + personalizedTexts.length * 0.1 }}
              onClick={() => setSlide(1)}
              className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-base flex items-center justify-center gap-2 mt-6"
            >
              Далее
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {slide === 1 && (
          <motion.div
            key="slide-1"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col px-6 pt-12 pb-8"
          >
            <h1
              className="text-3xl font-bold text-[var(--text)] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              План на неделю
            </h1>

            {/* Mini weekly blocks */}
            <div className="flex gap-2 mb-8">
              {schedule.map((day, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl ${TYPE_BG_COLORS[day.type]}`}
                >
                  <span className="text-xs font-medium text-gray-500">{DAY_ABBR[i]}</span>
                  <div className={`w-3 h-3 rounded-full ${TYPE_DOT_COLORS[day.type]}`} />
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3 mb-8"
            >
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text)]">
                {weekSummary.counts.strength > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    {weekSummary.counts.strength} {TYPE_LABELS.strength.toLowerCase()}
                  </span>
                )}
                {weekSummary.counts.cardio > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    {weekSummary.counts.cardio} {TYPE_LABELS.cardio.toLowerCase()}
                  </span>
                )}
                {weekSummary.counts.flexibility > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    {weekSummary.counts.flexibility} {TYPE_LABELS.flexibility.toLowerCase()}
                  </span>
                )}
                {weekSummary.counts.rest > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    {weekSummary.counts.rest} {TYPE_LABELS.rest.toLowerCase()}
                  </span>
                )}
              </div>

              {nutrition && (
                <p className="text-sm text-gray-500">
                  Калорий в день: ~{nutrition.totalCalories} ккал
                </p>
              )}

              {weekSummary.avgDuration > 0 && (
                <p className="text-sm text-gray-500">
                  Время тренировки: {weekSummary.avgDuration} мин
                </p>
              )}
            </motion.div>

            <div className="mt-auto flex flex-col gap-3">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => navigate('/nutrition', { replace: true })}
                className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-base"
              >
                Начнём!
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                onClick={() => navigate('/weekly-plan')}
                className="w-full py-2.5 text-sm text-gray-400"
              >
                Изменить расписание
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
