import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ClipboardList, Heart } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

/* Brand logo — matching banner exactly: thick warm rings, glow, leaf */
function BrandLogo() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative flex items-center justify-center"
      style={{ width: 160, height: 160 }}
    >
      <style>{`
        @keyframes logo-cw { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes logo-ccw { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
        .ring-outer { animation: logo-cw 25s linear infinite; }
        .ring-inner { animation: logo-ccw 35s linear infinite; }
      `}</style>

      {/* Glow — warm ambient light */}
      <div
        className="absolute rounded-full"
        style={{
          width: 150,
          height: 150,
          background: 'radial-gradient(circle, rgba(181,136,106,0.35) 0%, rgba(232,213,196,0.15) 40%, transparent 70%)',
        }}
      />

      {/* Outer ring — thick, warm gradient, rotating */}
      <div
        className="absolute rounded-full ring-outer"
        style={{
          width: 130,
          height: 130,
          border: '3px solid transparent',
          borderImage: 'linear-gradient(135deg, #E8D5C4, #B5886A, #E8D5C4) 1',
          borderRadius: '50%',
          borderColor: '#C4996F',
          opacity: 0.6,
        }}
      />

      {/* Inner ring — thicker, brighter, counter-rotating */}
      <div
        className="absolute rounded-full ring-inner"
        style={{
          width: 100,
          height: 100,
          border: '3px solid #B5886A',
        }}
      />

      {/* Leaf — positioned lower-right inside ring, like on banner */}
      <svg
        width="45"
        height="45"
        viewBox="0 0 45 45"
        fill="none"
        className="absolute"
        style={{ bottom: 35, right: 35 }}
      >
        <path
          d="M15 38 C15 38 6 24 18 13 C28 4 36 15 36 15 C36 15 28 32 18 35 C15 36 15 38 15 38 Z"
          stroke="#B5886A"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 34 Q24 24 25 14"
          stroke="#B5886A"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          strokeLinecap="round"
        />
      </svg>
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
