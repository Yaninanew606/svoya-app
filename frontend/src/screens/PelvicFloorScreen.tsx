import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown, ChevronUp, Check } from 'lucide-react';

function getDateKey() {
  return `pelvic-floor-${new Date().toISOString().slice(0, 10)}`;
}

function haptic() {
  try {
    (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  } catch {}
}

interface PelvicExercise {
  name: string;
  squeezeSec: number;
  relaxSec: number;
  reps: number;
  prompt: string;
  isLift?: boolean;
}

const EXERCISES: PelvicExercise[] = [
  { name: 'Медленное сжатие', squeezeSec: 5, relaxSec: 5, reps: 10, prompt: 'Сжимай' },
  { name: 'Быстрые сокращения', squeezeSec: 1, relaxSec: 1, reps: 15, prompt: 'Сжимай' },
  { name: 'Удержание', squeezeSec: 10, relaxSec: 10, reps: 5, prompt: 'Удерживай' },
  { name: 'Лифт', squeezeSec: 9, relaxSec: 5, reps: 5, prompt: 'Сжимай', isLift: true },
];

function InfoCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-[var(--primary)]" />
          <span className="font-semibold text-[var(--text)] text-sm">Зачем это нужно</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-sm text-gray-500 mt-3 leading-relaxed overflow-hidden"
          >
            Мышцы тазового дна поддерживают внутренние органы, влияют на осанку и самочувствие.
            Тренировка особенно важна после родов, при сидячей работе и в период перименопаузы.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExerciseRunner({ onComplete }: { onComplete: () => void }) {
  const [exIdx, setExIdx] = useState(0);
  const [rep, setRep] = useState(0);
  const [phase, setPhase] = useState<'squeeze' | 'relax'>('squeeze');
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ex = EXERCISES[exIdx];

  const getPhaseDuration = useCallback(() => {
    return phase === 'squeeze' ? ex.squeezeSec : ex.relaxSec;
  }, [phase, ex]);

  // Start timer for current phase
  useEffect(() => {
    setTimer(getPhaseDuration());
    haptic();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, rep, exIdx, getPhaseDuration]);

  // When timer hits 0, advance
  useEffect(() => {
    if (timer !== 0) return;
    // small delay before next phase
    const timeout = setTimeout(() => {
      if (phase === 'squeeze') {
        setPhase('relax');
      } else {
        // end of relax = end of rep
        const nextRep = rep + 1;
        if (nextRep >= ex.reps) {
          // next exercise
          const nextEx = exIdx + 1;
          if (nextEx >= EXERCISES.length) {
            onComplete();
            return;
          }
          setExIdx(nextEx);
          setRep(0);
          setPhase('squeeze');
        } else {
          setRep(nextRep);
          setPhase('squeeze');
        }
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [timer, phase, rep, exIdx, ex.reps, onComplete]);

  const isSqueeze = phase === 'squeeze';
  const liftLevel = ex.isLift && isSqueeze ? Math.min(Math.floor((ex.squeezeSec - timer) / 3) + 1, 3) : 0;
  const promptText = isSqueeze
    ? (ex.isLift ? `Уровень ${liftLevel} из 3` : ex.prompt)
    : 'Расслабь';

  // Circle scale: shrink on squeeze, expand on relax
  const circleScale = isSqueeze ? 0.5 : 1;

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col">
      {/* Progress header */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-sm text-gray-400 text-center">
          Упражнение {exIdx + 1} из {EXERCISES.length}
        </p>
        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all"
            style={{ width: `${((exIdx + 1) / EXERCISES.length) * 100}%` }}
          />
        </div>
        <p className="text-center font-semibold text-[var(--text)] mt-3">{ex.name}</p>
        <p className="text-center text-xs text-gray-400 mt-1">
          Повторение {rep + 1} из {ex.reps}
        </p>
      </div>

      {/* Pulsing circle + timer */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          animate={{
            scale: circleScale,
            backgroundColor: isSqueeze ? 'var(--primary)' : 'var(--secondary, #e8e0d8)',
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="w-40 h-40 rounded-full flex items-center justify-center"
        >
          <span className="text-5xl font-mono text-white mix-blend-difference">{timer}</span>
        </motion.div>

        <p className="text-xl font-semibold text-[var(--text)]">{promptText}</p>
      </div>

      {/* Skip button */}
      <div className="px-6 pb-10">
        <button
          onClick={onComplete}
          className="w-full py-2.5 text-gray-400 text-sm"
        >
          Пропустить
        </button>
      </div>
    </div>
  );
}

function CompletionView() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(getDateKey(), 'true');
    haptic();
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col items-center justify-center gap-6 px-6"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
        <Check size={32} className="text-[var(--primary)]" />
      </div>
      <h2
        className="text-2xl font-bold text-[var(--text)] text-center"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
      >
        Готово! Отличная привычка
      </h2>
      <button
        onClick={() => navigate('/workout')}
        className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-lg"
      >
        Вернуться к тренировке
      </button>
    </motion.div>
  );
}

export default function PelvicFloorScreen() {
  const [mode, setMode] = useState<'overview' | 'active' | 'done'>('overview');
  const navigate = useNavigate();
  const doneToday = localStorage.getItem(getDateKey()) === 'true';

  const handleComplete = useCallback(() => setMode('done'), []);

  if (mode === 'done') return <CompletionView />;
  if (mode === 'active') return <ExerciseRunner onComplete={handleComplete} />;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="px-6 pt-8 pb-4">
        <button onClick={() => navigate('/workout')} className="text-sm text-[var(--primary)] mb-4 block">
          &larr; Назад
        </button>
        <h1
          className="text-2xl font-bold text-[var(--text)]"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Тренировка тазового дна
        </h1>
        <p className="text-sm text-gray-400 mt-1">3 минуты для здоровья и тонуса</p>
      </div>

      <div className="px-6 flex flex-col gap-4">
        <InfoCard />

        {doneToday && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl">
            <Check size={18} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">Выполнено сегодня</span>
          </div>
        )}

        {/* Exercise list */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-[var(--text)] mb-3">Программа</h3>
          <div className="flex flex-col gap-3">
            {EXERCISES.map((ex, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[var(--primary)]">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{ex.name}</p>
                  <p className="text-xs text-gray-400">
                    {ex.isLift
                      ? `3 уровня по 3 сек + ${ex.relaxSec} сек отдых, ${ex.reps} повт.`
                      : `${ex.squeezeSec} сек / ${ex.relaxSec} сек, ${ex.reps} повт.`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setMode('active')}
          className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-lg"
        >
          Начать
        </button>
      </div>
    </div>
  );
}
