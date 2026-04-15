import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, Flower2, RotateCcw, Wind } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { Exercise, WorkoutPlan, DaySchedule } from '../types';
import TabBar from '../components/TabBar';

const YOGA_EXERCISES: Exercise[] = [
  { name: 'Поза ребёнка', duration: 60, description: 'Сядь на пятки, вытяни руки вперёд, опусти лоб на пол. Дыши глубоко.', isSkippable: false },
  { name: 'Кошка-корова', duration: 60, description: 'На четвереньках: прогибай и округляй спину в ритме дыхания.', isSkippable: false },
  { name: 'Скручивание лёжа', duration: 45, description: 'Ляг на спину, колени согнуты. Опусти оба колена вправо, голову влево. Поменяй сторону.', isSkippable: false },
  { name: 'Поза голубя', duration: 60, description: 'Одна нога согнута впереди, другая вытянута назад. Мягко опускайся вниз.', isSkippable: false },
  { name: 'Шавасана', duration: 120, description: 'Ляг на спину, закрой глаза. Расслабь всё тело. Просто дыши.', isSkippable: false },
];

const MOBILITY_EXERCISES: Exercise[] = [
  { name: 'Круги шеей', duration: 45, description: 'Медленные круговые движения головой. По 5 раз в каждую сторону.', isSkippable: false },
  { name: 'Вращения плечами', duration: 45, description: 'Круговые движения плечами вперёд и назад. По 10 раз.', isSkippable: false },
  { name: 'Круги бёдрами', duration: 45, description: 'Руки на поясе, рисуй большие круги бёдрами. По 10 раз.', isSkippable: false },
  { name: 'Вращения коленями', duration: 45, description: 'Ноги вместе, слегка согнуты. Круговые движения коленями.', isSkippable: false },
  { name: 'Перекаты стоп', duration: 45, description: 'Перекатывайся с носка на пятку и обратно. 15 раз.', isSkippable: false },
];

const BREATHING_EXERCISES: Exercise[] = [
  { name: 'Дыхание 4-7-8', duration: 60, description: 'Вдох на 4 счёта, задержка на 7, выдох на 8. Успокаивает нервную систему.', isSkippable: false },
  { name: 'Диафрагмальное дыхание', duration: 60, description: 'Руки на животе. Вдох — живот надувается, выдох — втягивается. Грудь неподвижна.', isSkippable: false },
  { name: 'Попеременное дыхание', duration: 60, description: 'Закрой правую ноздрю — вдох левой. Закрой левую — выдох правой. Чередуй.', isSkippable: false },
];

const REST_DAY_OPTIONS = [
  {
    id: 'yoga',
    title: 'Мягкая йога',
    duration: '10 мин',
    icon: Flower2,
    iconColor: 'text-teal-500',
    exercises: YOGA_EXERCISES,
  },
  {
    id: 'mobility',
    title: 'Мобильность суставов',
    duration: '8 мин',
    icon: RotateCcw,
    iconColor: 'text-amber-500',
    exercises: MOBILITY_EXERCISES,
  },
  {
    id: 'breathing',
    title: 'Дыхательная практика',
    duration: '5 мин',
    icon: Wind,
    iconColor: 'text-blue-500',
    exercises: BREATHING_EXERCISES,
  },
] as const;

const DAY_NAMES = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const TYPE_LABELS: Record<string, string> = {
  strength: 'Силовая',
  cardio: 'Кардио',
  flexibility: 'Растяжка',
  rest: 'Отдых',
};
const TYPE_COLORS: Record<string, string> = {
  strength: 'bg-orange-50 text-orange-700 border-orange-200',
  cardio: 'bg-rose-50 text-rose-700 border-rose-200',
  flexibility: 'bg-teal-50 text-teal-700 border-teal-200',
  rest: 'bg-gray-50 text-gray-500 border-gray-200',
};

function DifficultyBadge({ difficulty }: { difficulty: WorkoutPlan['difficulty'] }) {
  const colors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-orange-100 text-orange-700',
    hard: 'bg-red-100 text-red-700',
  };
  const labels = { easy: 'Лёгкая', medium: 'Средняя', hard: 'Интенсивная' };
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
            ? `${exercise.reps} повт. x ${exercise.sets} подх.`
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
  title,
  exercises,
  defaultOpen = false,
}: {
  title: string;
  exercises: Exercise[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3">
        <span className="font-semibold text-[var(--text)]">{title} ({exercises.length})</span>
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

function Timer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    setLeft(seconds);
    intervalRef.current = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current!); onDone(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [seconds, onDone]);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return <span className="text-5xl font-mono text-[var(--primary)]">{mm}:{ss}</span>;
}

function StepByStep({ exercises, onFinish }: { exercises: Exercise[]; onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const [, setTimerDone] = useState(false);
  const ex = exercises[index];
  const next = useCallback(() => {
    if (index + 1 >= exercises.length) onFinish();
    else { setIndex(index + 1); setTimerDone(false); }
  }, [index, exercises.length, onFinish]);
  const handleTimerDone = useCallback(() => setTimerDone(true), []);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col">
      <div className="px-6 pt-6 pb-2">
        <p className="text-sm text-gray-400 text-center">Упражнение {index + 1} из {exercises.length}</p>
        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
          <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${((index + 1) / exercises.length) * 100}%` }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -80, opacity: 0 }} transition={{ duration: 0.25 }} className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <h2 className="text-2xl font-bold text-[var(--text)] text-center">{ex.name}</h2>
          <p className="text-gray-400 text-center">{ex.description}</p>
          {ex.duration ? <Timer seconds={ex.duration} onDone={handleTimerDone} /> : ex.reps && ex.sets ? <p className="text-4xl font-mono text-[var(--primary)]">{ex.reps} x {ex.sets}</p> : null}
        </motion.div>
      </AnimatePresence>
      <div className="px-6 pb-10 flex flex-col gap-3">
        <button onClick={next} className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-lg">Готово</button>
        {ex.isSkippable && <button onClick={next} className="w-full py-2.5 text-gray-400 text-sm">Пропустить</button>}
      </div>
    </div>
  );
}

function CompletionScreen() {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col items-center justify-center gap-6 px-6">
      <h2 className="text-3xl font-bold text-[var(--text)]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Отличная работа</h2>
      <p className="text-gray-400 text-center">Тренировка завершена. Время для чек-ина.</p>
      <button onClick={() => navigate('/checkin')} className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-lg">Перейти к чек-ину</button>
    </motion.div>
  );
}

function RestDayOptionCard({
  option,
  expanded,
  onToggle,
  onStart,
}: {
  option: typeof REST_DAY_OPTIONS[number];
  expanded: boolean;
  onToggle: () => void;
  onStart: () => void;
}) {
  const Icon = option.icon;
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4">
        <div className={`${option.iconColor}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1 text-left">
          <span className="font-semibold text-[var(--text)]">{option.title}</span>
          <span className="text-sm text-gray-400 ml-2">{option.duration}</span>
        </div>
        {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-2">
              {option.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-sm text-[var(--text)]">{ex.name}</span>
                  <span className="text-xs text-gray-400">{ex.duration} сек</span>
                </div>
              ))}
              <button
                onClick={onStart}
                className="w-full py-3 rounded-2xl bg-[var(--primary)] text-white font-semibold mt-2"
              >
                Начать
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SmartRestDay({ onStartSession }: { onStartSession: (exercises: Exercise[]) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <div className="px-6">
      <h2
        className="text-xl font-semibold text-[var(--text)] mb-2"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
      >
        День отдыха
      </h2>
      <p className="text-gray-400 text-sm mb-5 leading-relaxed">
        Восстановление — часть программы. Выбери мягкую активность или просто отдохни.
      </p>
      <div className="flex flex-col gap-3">
        {REST_DAY_OPTIONS.map((opt) => (
          <RestDayOptionCard
            key={opt.id}
            option={opt}
            expanded={expandedId === opt.id}
            onToggle={() => setExpandedId(expandedId === opt.id ? null : opt.id)}
            onStart={() => onStartSession([...opt.exercises])}
          />
        ))}
      </div>
    </div>
  );
}

/* Weekly schedule strip */
function WeekStrip({ schedule, selectedDay, onSelect }: { schedule: DaySchedule[]; selectedDay: number; onSelect: (i: number) => void }) {
  const today = new Date().getDay(); // 0=Sun
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-6 -mx-6 scrollbar-hide">
      {schedule.map((day, i) => {
        const dayIndex = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'].indexOf(day.day);
        const isToday = dayIndex === today;
        const isSelected = i === selectedDay;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`flex flex-col items-center min-w-[64px] px-3 py-2 rounded-xl border transition-all ${
              isSelected ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-gray-200 bg-white'
            }`}
          >
            <span className={`text-xs font-medium ${isSelected ? 'text-[var(--primary)]' : 'text-gray-500'}`}>
              {day.day.slice(0, 2)}
            </span>
            <span className={`text-[10px] mt-0.5 ${TYPE_COLORS[day.type]?.split(' ')[1] || 'text-gray-400'}`}>
              {TYPE_LABELS[day.type]}
            </span>
            {isToday && <div className="w-1 h-1 rounded-full bg-[var(--primary)] mt-1" />}
          </button>
        );
      })}
    </div>
  );
}

export default function WorkoutScreen() {
  const navigate = useNavigate();
  const plan = useAppStore((s) => s.plan);
  const [mode, setMode] = useState<'overview' | 'active' | 'done'>('overview');
  const [selectedDay, setSelectedDay] = useState(0);
  const [restExercises, setRestExercises] = useState<Exercise[] | null>(null);

  useEffect(() => {
    if (!plan) navigate('/', { replace: true });
  }, [plan, navigate]);

  // Find today in weekly schedule
  useEffect(() => {
    if (plan?.weeklyWorkout?.schedule) {
      const todayName = DAY_NAMES[new Date().getDay()];
      const idx = plan.weeklyWorkout.schedule.findIndex((d) => d.day === todayName);
      if (idx >= 0) setSelectedDay(idx);
    }
  }, [plan]);

  if (!plan) return null;

  const weeklySchedule = plan.weeklyWorkout?.schedule;
  const currentDaySchedule = weeklySchedule?.[selectedDay];
  const workout: WorkoutPlan | null = currentDaySchedule?.workout || plan.workout;

  if (mode === 'done') return <CompletionScreen />;
  if (mode === 'active' && restExercises) {
    return <StepByStep exercises={restExercises} onFinish={() => { setRestExercises(null); setMode('done'); }} />;
  }
  if (mode === 'active' && workout) {
    const allExercises = [...workout.phases.warmup, ...workout.phases.main, ...workout.phases.cooldown];
    return <StepByStep exercises={allExercises} onFinish={() => setMode('done')} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Тренировки
        </h1>
        <p className="text-sm text-gray-400 mt-1">Недельная программа</p>
      </div>

      {/* Weekly schedule strip */}
      {weeklySchedule && (
        <div className="px-6 mb-4">
          <WeekStrip schedule={weeklySchedule} selectedDay={selectedDay} onSelect={setSelectedDay} />
        </div>
      )}

      {/* Selected day info */}
      {currentDaySchedule && (
        <div className="px-6 mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${TYPE_COLORS[currentDaySchedule.type]}`}>
            {currentDaySchedule.day} — {TYPE_LABELS[currentDaySchedule.type]}
          </div>
        </div>
      )}

      {/* Rest day */}
      {currentDaySchedule?.type === 'rest' && !currentDaySchedule.workout && (
        <div className="py-4">
          <SmartRestDay onStartSession={(exercises) => { setRestExercises(exercises); setMode('active'); }} />
        </div>
      )}

      {/* Workout details */}
      {workout && (currentDaySchedule?.type !== 'rest') && (
        <>
          <div className="px-6 pb-2 flex items-center gap-3">
            <span className="text-sm text-gray-500">{workout.duration} мин</span>
            <DifficultyBadge difficulty={workout.difficulty} />
            {workout.focus && <span className="text-sm text-gray-400">{workout.focus}</span>}
          </div>

          <div className="px-6 flex flex-col gap-2">
            <CollapsibleSection title="Разминка" exercises={workout.phases.warmup} defaultOpen />
            <CollapsibleSection title="Основной блок" exercises={workout.phases.main} defaultOpen />
            <CollapsibleSection title="Заминка" exercises={workout.phases.cooldown} />
          </div>

          <div className="px-6 mt-8 flex flex-col gap-3">
            <button onClick={() => setMode('active')} className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-lg">
              Начать тренировку
            </button>
            <button onClick={() => navigate('/')} className="text-sm text-gray-400 mt-2 text-center">
              Пропустить сегодня
            </button>
            <button onClick={() => navigate('/generating', { state: { difficulty: 'easy', reason: 'pain' } })} className="text-sm text-red-400 text-center">
              Мне больно / дискомфорт
            </button>
          </div>
        </>
      )}

      {/* Pelvic floor block */}
      <div className="px-6 mt-6 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[var(--text)]">Тазовое дно</p>
              <p className="text-xs text-gray-400 mt-0.5">3 мин</p>
            </div>
            {localStorage.getItem(`pelvic-floor-${new Date().toISOString().slice(0, 10)}`) === 'true' ? (
              <div className="flex items-center gap-1.5 text-green-600">
                <Check size={16} />
                <span className="text-sm font-medium">Выполнено сегодня</span>
              </div>
            ) : (
              <button
                onClick={() => navigate('/pelvic-floor')}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold"
              >
                Начать
              </button>
            )}
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
