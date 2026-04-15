import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { Exercise, WorkoutPlan } from '../types';
import TabBar from '../components/TabBar';

function DifficultyBadge({ difficulty }: { difficulty: WorkoutPlan['difficulty'] }) {
  const colors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-orange-100 text-orange-700',
    hard: 'bg-red-100 text-red-700',
  };
  const labels = { easy: 'Лёгкая', medium: 'Средняя', hard: 'Тяжёлая' };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${colors[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-[var(--text)]">{exercise.name}</h4>
        {exercise.isSkippable && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
            можно пропустить
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-1">
        {exercise.duration
          ? `${exercise.duration} сек`
          : exercise.reps && exercise.sets
            ? `${exercise.reps} повт. × ${exercise.sets} подх.`
            : ''}
      </p>
      <p className="text-sm text-gray-400 mt-1">{exercise.description}</p>
      {exercise.modification && (
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-xs text-[var(--primary)] mt-2 flex items-center gap-1"
        >
          Как делать {showHint ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
      <AnimatePresence>
        {showHint && exercise.modification && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-xs text-gray-400 mt-1 overflow-hidden"
          >
            {exercise.modification}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function CollapsibleSection({
  emoji,
  title,
  exercises,
  defaultOpen = false,
}: {
  emoji: string;
  title: string;
  exercises: Exercise[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3"
      >
        <span className="font-semibold text-[var(--text)]">
          {emoji} {title} ({exercises.length})
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {exercises.map((ex, i) => (
              <ExerciseCard key={i} exercise={ex} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Timer for step-by-step mode ── */
function Timer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLeft(seconds);
    intervalRef.current = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds, onDone]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return <span className="text-5xl font-mono text-[var(--primary)]">{mm}:{ss}</span>;
}

/* ── Step-by-step workout ── */
function StepByStep({
  exercises,
  onFinish,
}: {
  exercises: Exercise[];
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [, setTimerDone] = useState(false);
  const ex = exercises[index];

  const next = useCallback(() => {
    if (index + 1 >= exercises.length) {
      onFinish();
    } else {
      setIndex(index + 1);
      setTimerDone(false);
    }
  }, [index, exercises.length, onFinish]);

  const handleTimerDone = useCallback(() => setTimerDone(true), []);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col">
      {/* progress */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-sm text-gray-400 text-center">
          Упражнение {index + 1} из {exercises.length}
        </p>
        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all"
            style={{ width: `${((index + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col items-center justify-center px-6 gap-4"
        >
          <h2 className="text-2xl font-bold text-[var(--text)] text-center">{ex.name}</h2>
          <p className="text-gray-400 text-center">{ex.description}</p>

          {ex.duration ? (
            <Timer seconds={ex.duration} onDone={handleTimerDone} />
          ) : ex.reps && ex.sets ? (
            <p className="text-4xl font-mono text-[var(--primary)]">
              {ex.reps} × {ex.sets}
            </p>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="px-6 pb-10 flex flex-col gap-3">
        <button
          onClick={next}
          className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-lg"
        >
          Готово ✓
        </button>
        {ex.isSkippable && (
          <button
            onClick={next}
            className="w-full py-2.5 text-gray-400 text-sm"
          >
            Пропустить
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Completion Screen ── */
function CompletionScreen() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col items-center justify-center gap-6 px-6"
    >
      <span className="text-7xl">🎉</span>
      <h2
        className="text-3xl font-bold text-[var(--text)]"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
      >
        Отличная работа!
      </h2>
      <p className="text-gray-400 text-center">Тренировка завершена. Время для чек-ина.</p>
      <button
        onClick={() => navigate('/checkin')}
        className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-lg"
      >
        Перейти к чек-ину
      </button>
    </motion.div>
  );
}

/* ── Main Screen ── */
export default function WorkoutScreen() {
  const navigate = useNavigate();
  const plan = useAppStore((s) => s.plan);
  const [mode, setMode] = useState<'overview' | 'active' | 'done'>('overview');

  useEffect(() => {
    if (!plan) navigate('/', { replace: true });
  }, [plan, navigate]);

  if (!plan) return null;

  const workout = plan.workout;
  const allExercises = [
    ...workout.phases.warmup,
    ...workout.phases.main,
    ...workout.phases.cooldown,
  ];

  if (mode === 'done') return <CompletionScreen />;
  if (mode === 'active')
    return <StepByStep exercises={allExercises} onFinish={() => setMode('done')} />;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="px-6 pt-8 pb-4">
        <h1
          className="text-2xl font-bold text-[var(--text)]"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          {workout.duration} мин · {workout.focus}
        </h1>
        <div className="mt-2">
          <DifficultyBadge difficulty={workout.difficulty} />
        </div>
      </div>

      <div className="px-6 flex flex-col gap-2">
        <CollapsibleSection
          emoji="🔥"
          title="Разминка"
          exercises={workout.phases.warmup}
          defaultOpen
        />
        <CollapsibleSection
          emoji="💪"
          title="Основной блок"
          exercises={workout.phases.main}
          defaultOpen
        />
        <CollapsibleSection
          emoji="🧘"
          title="Заминка"
          exercises={workout.phases.cooldown}
        />
      </div>

      <div className="px-6 mt-8 flex flex-col gap-3">
        <button
          onClick={() => setMode('active')}
          className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-lg"
        >
          Начать тренировку ▶️
        </button>
        <button
          onClick={() => navigate('/generating', { state: { difficulty: 'easy' } })}
          className="w-full py-3 rounded-2xl border-2 border-[var(--primary)] text-[var(--primary)] font-semibold"
        >
          Упростить 🕊️
        </button>
        <button
          onClick={() => navigate('/generating', { state: { difficulty: 'hard' } })}
          className="w-full py-3 rounded-2xl border-2 border-[var(--primary)] text-[var(--primary)] font-semibold"
        >
          Увеличить нагрузку 🔥
        </button>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 mt-2 text-center"
        >
          Пропустить сегодня
        </button>
        <button
          onClick={() => navigate('/generating', { state: { difficulty: 'easy', reason: 'pain' } })}
          className="text-sm text-red-400 text-center"
        >
          Мне больно / дискомфорт
        </button>
      </div>

      <TabBar />
    </div>
  );
}
