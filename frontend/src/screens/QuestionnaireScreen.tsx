import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import ProgressBar from '../components/ProgressBar';

const GOALS = [
  { id: 'tonus', emoji: '🏃', label: 'Тонус и упругость' },
  { id: 'weight', emoji: '⚖️', label: 'Снижение веса' },
  { id: 'energy', emoji: '⚡', label: 'Больше энергии' },
  { id: 'posture', emoji: '🧍', label: 'Осанка и спина' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', emoji: '🛋️', label: 'Почти не двигаюсь' },
  { id: 'light', emoji: '🚶', label: 'Прогулки, лёгкая активность' },
  { id: 'moderate', emoji: '🏋️', label: 'Тренируюсь 1–2 раза в неделю' },
  { id: 'active', emoji: '💪', label: 'Активна регулярно' },
];

const TIME_OPTIONS = [
  { value: 10, emoji: '⏱️', label: 'До 10 минут' },
  { value: 15, emoji: '🕐', label: '15 минут' },
  { value: 20, emoji: '🕑', label: '20 минут' },
  { value: 30, emoji: '🕒', label: '30+ минут' },
];

const HEALTH_OPTIONS = [
  { id: 'none', label: 'Нет ограничений' },
  { id: 'knees', label: 'Проблемы с коленями' },
  { id: 'back', label: 'Проблемы со спиной' },
  { id: 'pressure', label: 'Высокое давление' },
  { id: 'other', label: 'Другое' },
];

function OptionCard({
  emoji,
  label,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 bg-white rounded-2xl p-4 border-2 transition-all ${
        selected
          ? 'border-[#B5886A] bg-[#E8D5C4]/30'
          : 'border-transparent hover:border-[#E8D5C4]'
      }`}
    >
      <span className="text-2xl shrink-0">{emoji}</span>
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
  const [activity, setActivity] = useState(questionnaire.activityLevel ?? '');
  const [time, setTime] = useState(questionnaire.timeAvailable ?? 0);
  const [health, setHealth] = useState<string[]>(questionnaire.healthRestrictions ?? []);
  const [otherText, setOtherText] = useState('');

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
      case 3: return activity !== '';
      case 4: return time > 0;
      case 5: return true;
      default: return false;
    }
  }, [step, goals, activity, time]);

  const goNext = () => {
    // Save partial data
    setQuestionnaire({ age, goals, activityLevel: activity, timeAvailable: time });

    if (step < 5) {
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
    setQuestionnaire({
      age,
      goals,
      activityLevel: activity,
      timeAvailable: time,
      healthRestrictions: restrictions,
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
                  emoji={g.emoji}
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
              Как часто ты двигаешься?
            </h2>
            <div className="flex flex-col gap-3">
              {ACTIVITY_LEVELS.map((a) => (
                <OptionCard
                  key={a.id}
                  emoji={a.emoji}
                  label={a.label}
                  selected={activity === a.id}
                  onClick={() => setActivity(a.id)}
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
                  emoji={t.emoji}
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
              Есть ли ограничения по здоровью?
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-6 max-w-md mx-auto">
      <div className="mb-6">
        <ProgressBar current={step} total={5} />
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
        {step === 5 && (
          <button
            onClick={finish}
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
          {step === 5 ? 'Готово' : 'Далее'}
        </button>
      </div>
    </div>
  );
}
