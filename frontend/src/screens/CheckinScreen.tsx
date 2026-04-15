import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { api } from '../api/client';
import type { DailyCheckin } from '../types';
import TabBar from '../components/TabBar';

const TOTAL_STEPS = 4;

function ProgressBar({ step }: { step: number }) {
  // step 1-4 = questions, step 5 = summary
  const progress = step <= TOTAL_STEPS ? step / TOTAL_STEPS : 1;
  return (
    <div className="w-full h-1.5 bg-gray-200 rounded-full">
      <motion.div
        className="h-full bg-[var(--primary)] rounded-full"
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

interface OptionCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function OptionCard({ emoji, label, selected, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 bg-white rounded-2xl p-4 transition-all ${
        selected
          ? 'border-2 border-[#B5886A] bg-[#E8D5C4]/20'
          : 'border-2 border-transparent'
      }`}
    >
      <span className="text-4xl">{emoji}</span>
      <span className="text-sm text-[var(--text)] font-medium">{label}</span>
    </button>
  );
}

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

export default function CheckinScreen() {
  const navigate = useNavigate();
  const { checkin, setCheckin, resetCheckin, plan, setStreak, setPlan } = useAppStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const canProceed = () => {
    if (step === 1) return checkin.mood != null;
    if (step === 2) return checkin.sleep != null;
    if (step === 3) return checkin.nutrition != null;
    if (step === 4) return checkin.workout != null;
    return true;
  };

  const next = () => {
    if (canProceed() && step <= TOTAL_STEPS) setStep(step + 1);
  };

  const handleSubmit = async (overallStatus: DailyCheckin['overallStatus']) => {
    setCheckin({ overallStatus });
    setSubmitting(true);
    try {
      const full: DailyCheckin = {
        userId: '',
        date: new Date().toISOString().slice(0, 10),
        mood: checkin.mood as DailyCheckin['mood'],
        sleep: checkin.sleep as DailyCheckin['sleep'],
        nutrition: checkin.nutrition as DailyCheckin['nutrition'],
        workout: checkin.workout as DailyCheckin['workout'],
        overallStatus,
      };
      const res = await api.submitCheckin(full);
      setStreak(res.streak);
      if (plan) {
        setPlan({
          ...plan,
          nutrition: res.tomorrowPlan.nutrition,
          workout: res.tomorrowPlan.workout,
        });
      }
      resetCheckin();
      navigate('/support', { state: { message: res.supportMessage } });
    } catch {
      // allow retry
    } finally {
      setSubmitting(false);
    }
  };

  const summaryLabels = {
    mood: { 1: '😩 Плохо', 2: '😕 Так себе', 3: '😊 Нормально', 4: '😄 Отлично' },
    sleep: { yes: 'Да', no: 'Нет', almost: 'Почти' },
    nutrition: { yes: '✅ Да', partial: '⚡ Частично', no: '❌ Нет' },
    workout: {
      yes: '✅ Да',
      partial: '🏃 Частично',
      no: '❌ Нет',
      'skipped-health': '🤕 Пропустила',
    },
  } as const;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 px-6 pt-8">
      <ProgressBar step={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="s1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="mt-8"
          >
            <h2
              className="text-2xl font-bold text-[var(--text)] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Как ты себя чувствуешь?
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {([
                { emoji: '😩', label: 'Плохо', value: 1 },
                { emoji: '😕', label: 'Так себе', value: 2 },
                { emoji: '😊', label: 'Нормально', value: 3 },
                { emoji: '😄', label: 'Отлично', value: 4 },
              ] as const).map((opt) => (
                <OptionCard
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={checkin.mood === opt.value}
                  onClick={() => setCheckin({ mood: opt.value })}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="s2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="mt-8"
          >
            <h2
              className="text-2xl font-bold text-[var(--text)] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Сон был нормальным?
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {([
                { emoji: '✅', label: 'Да', value: 'yes' as const },
                { emoji: '❌', label: 'Нет', value: 'no' as const },
                { emoji: '😐', label: 'Почти', value: 'almost' as const },
              ]).map((opt) => (
                <OptionCard
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={checkin.sleep === opt.value}
                  onClick={() => setCheckin({ sleep: opt.value })}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="s3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="mt-8"
          >
            <h2
              className="text-2xl font-bold text-[var(--text)] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Удалось придерживаться питания?
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {([
                { emoji: '✅', label: 'Да', value: 'yes' as const },
                { emoji: '⚡', label: 'Частично', value: 'partial' as const },
                { emoji: '❌', label: 'Нет', value: 'no' as const },
              ]).map((opt) => (
                <OptionCard
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={checkin.nutrition === opt.value}
                  onClick={() => setCheckin({ nutrition: opt.value })}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="s4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="mt-8"
          >
            <h2
              className="text-2xl font-bold text-[var(--text)] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Тренировка выполнена?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { emoji: '✅', label: 'Да', value: 'yes' as const },
                { emoji: '🏃', label: 'Частично', value: 'partial' as const },
                { emoji: '❌', label: 'Нет', value: 'no' as const },
                { emoji: '🤕', label: 'Пропустила', value: 'skipped-health' as const },
              ]).map((opt) => (
                <OptionCard
                  key={opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={checkin.workout === opt.value}
                  onClick={() => setCheckin({ workout: opt.value })}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="s5"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="mt-8"
          >
            <h2
              className="text-2xl font-bold text-[var(--text)] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Итоги дня
            </h2>
            <div className="flex flex-col gap-3 mb-8">
              {[
                { label: 'Самочувствие', value: summaryLabels.mood[checkin.mood as keyof typeof summaryLabels.mood] },
                { label: 'Сон', value: summaryLabels.sleep[checkin.sleep as keyof typeof summaryLabels.sleep] },
                { label: 'Питание', value: summaryLabels.nutrition[checkin.nutrition as keyof typeof summaryLabels.nutrition] },
                { label: 'Тренировка', value: summaryLabels.workout[checkin.workout as keyof typeof summaryLabels.workout] },
              ].map((row) => (
                <div key={row.label} className="flex justify-between bg-white rounded-xl p-4">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="font-medium text-[var(--text)]">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={submitting}
                onClick={() => handleSubmit('good')}
                className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold disabled:opacity-50"
              >
                Всё хорошо ✨
              </button>
              <button
                disabled={submitting}
                onClick={() => handleSubmit('hard-day')}
                className="w-full py-3 rounded-2xl border-2 border-[var(--primary)] text-[var(--primary)] font-semibold disabled:opacity-50"
              >
                Был тяжёлый день 😔
              </button>
              <button
                disabled={submitting}
                onClick={() => handleSubmit('need-easier')}
                className="w-full py-3 rounded-2xl border-2 border-[var(--primary)] text-[var(--primary)] font-semibold disabled:opacity-50"
              >
                Нужен более лёгкий план
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step <= TOTAL_STEPS && (
        <div className="mt-8">
          <button
            disabled={!canProceed()}
            onClick={next}
            className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold disabled:opacity-30 transition-opacity"
          >
            Далее
          </button>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-full py-2.5 text-gray-400 text-sm mt-2"
            >
              Назад
            </button>
          )}
        </div>
      )}

      <TabBar />
    </div>
  );
}
