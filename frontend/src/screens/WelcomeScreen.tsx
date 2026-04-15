import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ClipboardList, Heart } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

/* Brand logo — warm rings with leaf, CSS-animated rotation */
function BrandLogo({ size = 150 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.9,
          height: size * 0.9,
          background: 'radial-gradient(circle, rgba(181,136,106,0.2) 0%, rgba(181,136,106,0) 70%)',
        }}
      />

      {/* Outer ring — rotating clockwise */}
      <div
        className="absolute rounded-full border-2 border-[#B5886A]/40 animate-[logo-spin_20s_linear_infinite]"
        style={{ width: size * 0.82, height: size * 0.82 }}
      />

      {/* Inner ring — rotating counter-clockwise */}
      <div
        className="absolute rounded-full border-[2.5px] border-[#B5886A] animate-[logo-spin_30s_linear_infinite_reverse]"
        style={{ width: size * 0.64, height: size * 0.64 }}
      />

      {/* Leaf SVG — static center */}
      <svg
        width={size * 0.35}
        height={size * 0.35}
        viewBox="0 0 50 50"
        fill="none"
        className="relative z-10"
      >
        <path
          d="M20 42 C20 42 10 28 22 16 C32 6 40 18 40 18 C40 18 32 36 22 38 C19 39 20 42 20 42 Z"
          stroke="#B5886A"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 38 Q28 28 29 18"
          stroke="#B5886A"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
          strokeLinecap="round"
        />
      </svg>

      <style>{`
        @keyframes logo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}

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
      <div className="text-center flex flex-col items-center gap-5">
        <BrandLogo size={120} />

        <h1 className="font-[Cormorant_Garamond] text-4xl font-bold text-[var(--text)]">
          Своя
        </h1>

        <p className="text-[var(--text)] opacity-60 text-sm leading-relaxed max-w-xs">
          Питание и тренировки, которые понимают твой возраст
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
