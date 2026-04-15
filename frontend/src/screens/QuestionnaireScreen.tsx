import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import ProgressBar from '../components/ProgressBar';

const TOTAL_STEPS = 9;

const GOALS = [
  { id: 'tonus', label: 'Тонус и упругость' },
  { id: 'weight', label: 'Снижение веса' },
  { id: 'energy', label: 'Больше энергии' },
  { id: 'posture', label: 'Осанка и спина' },
];

const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Новичок — никогда не тренировалась регулярно' },
  { id: 'returning', label: 'Возвращаюсь — был перерыв больше полугода' },
  { id: 'moderate', label: 'Занимаюсь — тренируюсь 1-2 раза в неделю' },
  { id: 'active', label: 'Активно тренируюсь — 3+ раз в неделю' },
];

const TIME_OPTIONS = [
  { value: 15, label: 'До 15 минут' },
  { value: 20, label: '20 минут' },
  { value: 30, label: '30 минут' },
  { value: 45, label: '45+ минут' },
];

const FOOD_OPTIONS = [
  { id: 'no-restrictions', label: 'Без ограничений — ем все' },
  { id: 'no-meat', label: 'Не ем мясо' },
  { id: 'no-dairy', label: 'Не ем молочное' },
  { id: 'no-gluten', label: 'Без глютена' },
  { id: 'low-sugar', label: 'Минимум сахара' },
  { id: 'intermittent-fasting', label: 'Интервальное голодание' },
];

const SCHEDULE_OPTIONS = [
  { id: 'early', label: 'Ранний подъем — встаю до 7:00' },
  { id: 'standard', label: 'Стандартный — встаю 7:00-9:00' },
  { id: 'late', label: 'Поздний — встаю после 9:00' },
  { id: 'irregular', label: 'Ненормированный график' },
];

const TRAINING_TYPE_OPTIONS = [
  { id: 'strength', label: 'Силовые с весом тела' },
  { id: 'cardio', label: 'Кардио и жиросжигание' },
  { id: 'flexibility', label: 'Растяжка и гибкость' },
  { id: 'yoga', label: 'Йога и дыхание' },
  { id: 'ortho', label: 'Ортопедическая гимнастика' },
  { id: 'any', label: 'Мне все равно — подбери сама' },
];

const HEALTH_OPTIONS = [
  { id: 'none', label: 'Нет ограничений' },
  { id: 'knees', label: 'Проблемы с коленями' },
  { id: 'back', label: 'Проблемы со спиной' },
  { id: 'pressure', label: 'Высокое давление' },
  { id: 'varicose', label: 'Варикоз' },
  { id: 'neck', label: 'Проблемы с шеей' },
  { id: 'other', label: 'Другое' },
];

function OptionCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center bg-white rounded-2xl p-4 border-2 transition-all ${
        selected
          ? 'border-[#B5886A] bg-[#E8D5C4]/30'
          : 'border-transparent hover:border-[#E8D5C4]'
      }`}
    >
      <span className="text-[var(--text)] text-left text-sm font-medium">{label}</span>
    </button>
  );
}

function CheckboxCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 bg-white rounded-2xl p-4 border-2 transition-all ${
        selected
          ? 'border-[#B5886A] bg-[#E8D5C4]/30'
          : 'border-transparent hover:border-[#E8D5C4]'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
          selected ? 'border-[#B5886A] bg-[#B5886A]' : 'border-gray-300'
        }`}
      >
        {selected && <span className="text-white text-xs">✓</span>}
      </div>
      <span className="text-[var(--text)] text-left text-sm font-medium">{label}</span>
    </button>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function QuestionnaireScreen() {
  const navigate = useNavigate();
  const { setQuestionnaire, questionnaire } = useAppStore();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [age, setAge] = useState(questionnaire.age ?? 45);
  const [goals, setGoals] = useState<string[]>(questionnaire.goals ?? []);
  const [fitnessLevel, setFitnessLevel] = useState(questionnaire.fitnessLevel ?? '');
  const [time, setTime] = useState(questionnaire.timeAvailable ?? 0);
  const [foodPreferences, setFoodPreferences] = useState<string[]>(questionnaire.foodPreferences ?? []);
  const [dailySchedule, setDailySchedule] = useState(questionnaire.dailySchedule ?? '');
  const [trainingTypes, setTrainingTypes] = useState<string[]>(questionnaire.trainingTypes ?? []);
  const [health, setHealth] = useState<string[]>(questionnaire.healthRestrictions ?? []);
  const [otherText, setOtherText] = useState('');
  const [height, setHeight] = useState<string>(questionnaire.measurements?.height?.toString() ?? '');
  const [weight, setWeight] = useState<string>(questionnaire.measurements?.weight?.toString() ?? '');
  const [waist, setWaist] = useState<string>(questionnaire.measurements?.waist?.toString() ?? '');

  // Telegram BackButton
  useEffect(() => {
    const bb = window.Telegram?.WebApp?.BackButton;
    if (!bb) return;

    if (step > 1) {
      bb.show();
      const handler = () => {
        setDirection(-1);
        setStep((s) => s - 1);
      };
      bb.onClick(handler);
      return () => {
        bb.offClick(handler);
        bb.hide();
      };
    } else {
      bb.hide();
    }
  }, [step]);

  const canProceed = useCallback(() => {
    switch (step) {
      case 1: return true;
      case 2: return goals.length > 0;
      case 3: return fitnessLevel !== '';
      case 4: return time > 0;
      case 5: return foodPreferences.length > 0;
      case 6: return dailySchedule !== '';
      case 7: return trainingTypes.length > 0;
      case 8: return true;
      case 9: return true;
      default: return false;
    }
  }, [step, goals, fitnessLevel, time, foodPreferences, dailySchedule, trainingTypes]);

  const savePartial = () => {
    setQuestionnaire({
      age,
      goals,
      fitnessLevel,
      timeAvailable: time,
      foodPreferences,
      dailySchedule,
      trainingTypes,
    });
  };

  const goNext = () => {
    savePartial();

    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    const restrictions = health.includes('other')
      ? [...health.filter((h) => h !== 'other'), otherText].filter(Boolean)
      : health;

    const measurements: { height?: number; weight?: number; waist?: number } = {};
    if (height) measurements.height = Number(height);
    if (weight) measurements.weight = Number(weight);
    if (waist) measurements.waist = Number(waist);

    setQuestionnaire({
      age,
      goals,
      fitnessLevel,
      timeAvailable: time,
      foodPreferences,
      dailySchedule,
      trainingTypes,
      healthRestrictions: restrictions,
      measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
    });
    navigate('/generating');
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.includes(id)
        ? prev.filter((g) => g !== id)
        : prev.length < 2
          ? [...prev, id]
          : prev
    );
  };

  const toggleHealth = (id: string) => {
    if (id === 'none') {
      setHealth(['none']);
      return;
    }
    setHealth((prev) => {
      const without = prev.filter((h) => h !== 'none');
      return without.includes(id)
        ? without.filter((h) => h !== id)
        : [...without, id];
    });
  };

  const toggleFood = (id: string) => {
    if (id === 'no-restrictions') {
      setFoodPreferences(['no-restrictions']);
      return;
    }
    setFoodPreferences((prev) => {
      const without = prev.filter((f) => f !== 'no-restrictions');
      if (without.includes(id)) return without.filter((f) => f !== id);
      if (without.length < 3) return [...without, id];
      return without;
    });
  };

  const toggleTraining = (id: string) => {
    if (id === 'any') {
      setTrainingTypes(['any']);
      return;
    }
    setTrainingTypes((prev) => {
      const without = prev.filter((t) => t !== 'any');
      if (without.includes(id)) return without.filter((t) => t !== id);
      if (without.length < 3) return [...without, id];
      return without;
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center gap-8">
            <h2 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)] text-center">
              Сколько тебе лет?
            </h2>
            <span className="text-6xl font-[Cormorant_Garamond] font-bold text-[var(--primary)]">
              {age}
            </span>
            <input
              type="range"
              min={40}
              max={70}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-[var(--secondary)] accent-[#B5886A] cursor-pointer"
            />
            <div className="flex justify-between w-full text-xs text-[var(--text)] opacity-50">
              <span>40</span>
              <span>70</span>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-4">
            <h2 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)] text-center">
              Какая у тебя цель?
            </h2>
            <p className="text-center text-sm text-[var(--text)] opacity-50">(выбери до 2)</p>
            <div className="flex flex-col gap-3">
              {GOALS.map((g) => (
                <OptionCard
                  key={g.id}
                  label={g.label}
                  selected={goals.includes(g.id)}
                  onClick={() => toggleGoal(g.id)}
                />
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-4">
            <h2 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)] text-center">
              Твой уровень подготовки
            </h2>
            <div className="flex flex-col gap-3">
              {FITNESS_LEVELS.map((a) => (
                <OptionCard
                  key={a.id}
                  label={a.label}
                  selected={fitnessLevel === a.id}
                  onClick={() => setFitnessLevel(a.id)}
                />
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-4">
            <h2 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)] text-center">
              Сколько времени готова уделять?
            </h2>
            <div className="flex flex-col gap-3">
              {TIME_OPTIONS.map((t) => (
                <OptionCard
                  key={t.value}
                  label={t.label}
                  selected={time === t.value}
                  onClick={() => setTime(t.value)}
                />
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col gap-4">
            <h2 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)] text-center">
              Предпочтения в питании
            </h2>
            <p className="text-center text-sm text-[var(--text)] opacity-50">(выбери до 3)</p>
            <div className="flex flex-col gap-3">
              {FOOD_OPTIONS.map((f) => (
                <CheckboxCard
                  key={f.id}
                  label={f.label}
                  selected={foodPreferences.includes(f.id)}
                  onClick={() => toggleFood(f.id)}
                />
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col gap-4">
            <h2 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)] text-center">
              Твой обычный режим дня
            </h2>
            <div className="flex flex-col gap-3">
              {SCHEDULE_OPTIONS.map((s) => (
                <OptionCard
                  key={s.id}
                  label={s.label}
                  selected={dailySchedule === s.id}
                  onClick={() => setDailySchedule(s.id)}
                />
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col gap-4">
            <h2 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)] text-center">
              Какие тренировки ближе
            </h2>
            <p className="text-center text-sm text-[var(--text)] opacity-50">(выбери до 3)</p>
            <div className="flex flex-col gap-3">
              {TRAINING_TYPE_OPTIONS.map((t) => (
                <CheckboxCard
                  key={t.id}
                  label={t.label}
                  selected={trainingTypes.includes(t.id)}
                  onClick={() => toggleTraining(t.id)}
                />
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="flex flex-col gap-4">
            <h2 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)] text-center">
              Есть ли ограничения по здоровью
            </h2>
            <div className="flex flex-col gap-3">
              {HEALTH_OPTIONS.map((h) => (
                <div key={h.id}>
                  <CheckboxCard
                    label={h.label}
                    selected={health.includes(h.id)}
                    onClick={() => toggleHealth(h.id)}
                  />
                  {h.id === 'other' && health.includes('other') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-2 ml-8"
                    >
                      <input
                        type="text"
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                        placeholder="Опиши кратко..."
                        className="w-full border border-[var(--secondary)] rounded-xl px-4 py-3 text-sm text-[var(--text)] bg-white focus:outline-none focus:border-[var(--primary)]"
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)]">
                Текущие параметры
              </h2>
              <p className="mt-2 text-sm text-[var(--text)] opacity-50">
                Необязательно — поможет точнее подобрать план
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[var(--text)] opacity-70 mb-1">Рост (см)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="165"
                  className="w-full border border-[var(--secondary)] rounded-xl px-4 py-3 text-sm text-[var(--text)] bg-white focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text)] opacity-70 mb-1">Вес (кг)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className="w-full border border-[var(--secondary)] rounded-xl px-4 py-3 text-sm text-[var(--text)] bg-white focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text)] opacity-70 mb-1">Объем талии (см)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="80"
                  className="w-full border border-[var(--secondary)] rounded-xl px-4 py-3 text-sm text-[var(--text)] bg-white focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  const isSkippableStep = step === 8 || step === 9;

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 max-w-md mx-auto">
      <div className="mb-6">
        <ProgressBar current={step} total={TOTAL_STEPS} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pt-6 flex flex-col gap-3">
        {isSkippableStep && (
          <button
            onClick={goNext}
            className="text-[var(--text)] opacity-50 text-sm underline"
          >
            Пропустить
          </button>
        )}
        <button
          onClick={goNext}
          disabled={!canProceed()}
          className={`w-full rounded-2xl py-4 text-lg font-semibold transition-opacity ${
            canProceed()
              ? 'bg-[#B5886A] text-white shadow-md'
              : 'bg-[#E8D5C4] text-white opacity-50 cursor-not-allowed'
          }`}
        >
          {step === TOTAL_STEPS ? 'Готово' : 'Далее'}
        </button>
      </div>
    </div>
  );
}
