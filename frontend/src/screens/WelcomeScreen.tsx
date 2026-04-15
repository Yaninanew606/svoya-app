import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ClipboardList, Heart } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(0);

  const slides = [
    { icon: MessageCircle, text: 'Ответь на несколько вопросов — я пойму твой ритм жизни, цикл и предпочтения в еде' },
    { icon: ClipboardList, text: 'Получи план тренировок и питания, адаптированный под фазу цикла и интервальное голодание' },
    { icon: Heart, text: 'Каждый день я подстраиваю нагрузку и рецепты под твоё самочувствие' },
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
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text)] opacity-40 hover:opacity-80 text-xl">
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
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === slide ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'}`} />
          ))}
        </div>

        <div className="flex justify-center gap-3">
          {slide < slides.length - 1 ? (
            <button onClick={() => setSlide(slide + 1)} className="bg-[var(--primary)] text-white rounded-2xl px-6 py-3 text-sm font-semibold">
              Далее
            </button>
          ) : (
            <button onClick={onClose} className="bg-[var(--primary)] text-white rounded-2xl px-6 py-3 text-sm font-semibold">
              Понятно
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
    localStorage.removeItem('wellness-app-store');
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('wellness') || key.startsWith('food-diary') || key.startsWith('water-') || key.startsWith('pelvic-floor') || key.startsWith('fasting') || key.startsWith('tg_')) {
        localStorage.removeItem(key);
      }
    }
    window.location.href = '/';
  };

  useEffect(() => {
    try { window.Telegram?.WebApp?.expand(); } catch {}
  }, []);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(180deg, #1A1A1A 0%, #2A2420 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center flex flex-col items-center gap-5 max-w-sm">

        {/* Animated logo */}
        <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
          <style>{`
            @keyframes ring-cw { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
            @keyframes ring-ccw { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
            @keyframes glow-pulse { 0%,100% { opacity: 0.3 } 50% { opacity: 0.5 } }
          `}</style>

          {/* Pulsing glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: 150, height: 150,
              background: 'radial-gradient(circle, rgba(212,168,130,0.4) 0%, rgba(181,136,106,0.15) 45%, transparent 70%)',
              animation: 'glow-pulse 4s ease-in-out infinite',
            }}
          />

          {/* Outer ring — golden, rotating */}
          <div className="absolute" style={{ width: 135, height: 135, animation: 'ring-cw 20s linear infinite' }}>
            <div className="w-full h-full rounded-full" style={{ border: '2px solid rgba(232,213,196,0.5)' }} />
          </div>

          {/* Inner ring — brighter, counter-rotating */}
          <div className="absolute" style={{ width: 105, height: 105, animation: 'ring-ccw 28s linear infinite' }}>
            <div className="w-full h-full rounded-full" style={{ border: '2.5px solid #C4996F' }} />
          </div>

          {/* Leaf */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="relative z-10">
            <path
              d="M18 40 C18 40 8 26 20 14 C30 4 38 16 38 16 C38 16 30 34 20 37 C17 38 18 40 18 40 Z"
              stroke="#C4996F"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 36 Q26 26 27 16"
              stroke="#C4996F"
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* App name */}
        <h1 className="font-[Cormorant_Garamond] text-4xl font-bold text-white tracking-wide">
          Своя
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
          Питание и тренировки, которые понимают твой возраст
        </p>

        {/* CTA button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(isReturningUser ? '/nutrition' : '/questionnaire')}
          className="rounded-2xl px-10 py-4 text-lg font-semibold shadow-lg mt-4"
          style={{
            background: 'linear-gradient(135deg, #B5886A, #D4A882)',
            color: 'white',
          }}
        >
          {isReturningUser ? 'Продолжить' : 'Начать'}
        </motion.button>

        {/* How it works */}
        <button
          onClick={() => setShowModal(true)}
          className="text-gray-500 text-sm underline underline-offset-4 hover:text-gray-300 transition-colors"
        >
          Как это работает
        </button>

        {/* Reset button */}
        {isReturningUser && (
          <button onClick={handleReset} className="text-gray-600 text-xs mt-2">
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
