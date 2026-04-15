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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[var(--background)] rounded-3xl p-8 max-w-sm w-full shadow-xl relative"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 text-lg">x</button>
        <h3 className="font-[Cormorant_Garamond] text-2xl font-bold text-[var(--text)] mb-6 text-center">Как это работает</h3>
        <div className="relative overflow-hidden min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div key={slide} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} className="flex flex-col items-center text-center gap-3">
              {(() => { const Icon = slides[slide].icon; return <Icon size={36} className="text-[var(--primary)]" />; })()}
              <p className="text-[var(--text)] text-base leading-relaxed">{slides[slide].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-2 mt-6 mb-4">
          {slides.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full ${i === slide ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'}`} />))}
        </div>
        <div className="flex justify-center">
          {slide < slides.length - 1
            ? <button onClick={() => setSlide(slide + 1)} className="bg-[var(--primary)] text-white rounded-2xl px-6 py-3 text-sm font-semibold">Далее</button>
            : <button onClick={onClose} className="bg-[var(--primary)] text-white rounded-2xl px-6 py-3 text-sm font-semibold">Понятно</button>
          }
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
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ backgroundColor: '#1E1E1E' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <style>{`
        @keyframes ring1 { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes ring2 { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
        @keyframes glow { 0%,100% { opacity: 0.25 } 50% { opacity: 0.45 } }
      `}</style>

      <div className="flex flex-col items-center gap-6">

        {/* Animated logo */}
        <motion.div
          className="relative flex items-center justify-center"
          style={{ width: 150, height: 150 }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: 140, height: 140,
              background: 'radial-gradient(circle, rgba(196,153,111,0.35) 0%, rgba(196,153,111,0.1) 50%, transparent 70%)',
              animation: 'glow 4s ease-in-out infinite',
            }}
          />

          {/* Outer ring */}
          <div className="absolute" style={{ width: 130, height: 130, animation: 'ring1 18s linear infinite' }}>
            <div className="w-full h-full rounded-full" style={{ border: '2px solid rgba(212,168,130,0.45)' }} />
          </div>

          {/* Inner ring */}
          <div className="absolute" style={{ width: 100, height: 100, animation: 'ring2 25s linear infinite' }}>
            <div className="w-full h-full rounded-full" style={{ border: '2.5px solid rgba(196,153,111,0.8)' }} />
          </div>

          {/* Leaf — positioned inside inner ring, lower-right like on banner */}
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" className="absolute" style={{ bottom: 28, right: 32 }}>
            <path
              d="M14 42 C14 42 5 28 16 16 C25 6 33 17 33 17 C33 17 26 35 17 38 C14 39 14 42 14 42 Z"
              stroke="rgba(196,153,111,0.9)"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 37 Q22 27 23 17"
              stroke="rgba(196,153,111,0.4)"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* App name */}
        <motion.h1
          className="text-white text-4xl tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Своя
        </motion.h1>

        {/* Slogan */}
        <motion.p
          className="text-center text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Питание и тренировки,<br />которые понимают твоё здоровье
        </motion.p>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(isReturningUser ? '/nutrition' : '/questionnaire')}
          className="w-full max-w-[260px] rounded-2xl py-4 text-base font-semibold mt-4"
          style={{ background: 'linear-gradient(135deg, #B5886A, #D4A882)', color: 'white' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {isReturningUser ? 'Продолжить' : 'Начать'}
        </motion.button>

        {/* How it works */}
        <motion.button
          onClick={() => setShowModal(true)}
          className="text-sm underline underline-offset-4"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Как это работает
        </motion.button>

        {/* Reset */}
        {isReturningUser && (
          <button onClick={handleReset} className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>
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
