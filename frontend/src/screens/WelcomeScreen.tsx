import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, MessageCircle, ClipboardList, Heart } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(0);

  const slides = [
    { num: '1', icon: MessageCircle, text: 'Ответь на 5 вопросов \u2192 я пойму твой ритм жизни' },
    { num: '2', icon: ClipboardList, text: 'Получи план питания и тренировки на каждый день' },
    { num: '3', icon: Heart, text: 'Я буду адаптировать план под твоё самочувствие' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[var(--background)] rounded-3xl p-8 max-w-sm w-full shadow-xl relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text)] opacity-40 hover:opacity-80 text-xl"
        >
          ✕
        </button>

        <h3 className="font-[Cormorant_Garamond] text-2xl font-bold text-[var(--text)] mb-6 text-center">
          Как это работает
        </h3>

        <div className="relative overflow-hidden min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center gap-3"
            >
              {(() => {
                const Icon = slides[slide].icon;
                return <Icon size={36} className="text-[var(--primary)]" />;
              })()}
              <p className="text-[var(--text)] text-base leading-relaxed">
                {slides[slide].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-6 mb-4">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === slide ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-center gap-3">
          {slide < slides.length - 1 ? (
            <button
              onClick={() => setSlide(slide + 1)}
              className="bg-[var(--primary)] text-white rounded-2xl px-6 py-3 text-sm font-semibold"
            >
              Далее
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-[var(--primary)] text-white rounded-2xl px-6 py-3 text-sm font-semibold"
            >
              Понятно!
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { isReturningUser, clearAll } = useAppStore();
  const [showModal, setShowModal] = useState(false);

  const handleReset = () => {
    clearAll();
    // Remove Zustand persisted store before reload
    localStorage.removeItem('wellness-app-store');
    // Remove all app data
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('wellness') || key.startsWith('food-diary') || key.startsWith('water-') || key.startsWith('pelvic-floor')) {
        localStorage.removeItem(key);
      }
    }
    window.location.href = '/';
  };

  useEffect(() => {
    try {
      window.Telegram?.WebApp?.expand();
    } catch {}
  }, []);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="text-center flex flex-col items-center gap-6">
        <Leaf size={48} className="text-[var(--primary)]" />

        <h1 className="font-[Cormorant_Garamond] text-5xl font-bold text-[var(--text)] flex items-center gap-3">
          Привет <Leaf size={32} className="text-[var(--primary)] inline-block" />
        </h1>

        <p className="text-[var(--text)] opacity-70 text-base leading-relaxed max-w-xs">
          Соберу для тебя мягкий план питания и тренировок под твою цель, возраст
          и самочувствие.
        </p>

        <button
          onClick={() => navigate(isReturningUser ? '/nutrition' : '/questionnaire')}
          className="bg-[#B5886A] text-white rounded-2xl px-8 py-4 text-lg font-semibold shadow-md hover:opacity-90 transition-opacity mt-4"
        >
          {isReturningUser ? 'Продолжить' : 'Начать'}
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="text-[var(--primary)] text-sm underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity"
        >
          Как это работает
        </button>

        {isReturningUser && (
          <button
            onClick={handleReset}
            className="text-gray-400 text-xs mt-4"
          >
            Начать заново
          </button>
        )}
      </div>

      <AnimatePresence>
        {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
