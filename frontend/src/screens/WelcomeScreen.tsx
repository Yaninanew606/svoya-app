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
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-[var(--background)] rounded-3xl p-8 max-w-sm w-full shadow-xl relative" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
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
            : <button onClick={onClose} className="bg-[var(--primary)] text-white rounded-2xl px-6 py-3 text-sm font-semibold">Понятно</button>}
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
      className="min-h-screen flex flex-col items-center justify-between px-10 py-16"
      style={{ backgroundColor: '#1A1A1A' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Top section: logo + name + slogan */}
      <div className="flex flex-col items-center gap-0 mt-4">

        {/* Animated Logo */}
        <motion.div
          className="relative mb-8"
          style={{ width: 140, height: 140 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{
              width: 160, height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(210,170,120,0.3) 0%, rgba(210,170,120,0.08) 50%, transparent 70%)',
              animation: 'welcome-glow 3.5s ease-in-out infinite',
            }} />
          </div>

          {/* SVG rings + leaf */}
          <svg viewBox="0 0 140 140" fill="none" className="w-full h-full relative z-10" style={{ animation: 'welcome-ring-cw 20s linear infinite' }}>
            {/* Outer ring */}
            <circle cx="70" cy="70" r="62" stroke="rgba(210,170,120,0.35)" strokeWidth="1.5" />
          </svg>

          <svg viewBox="0 0 140 140" fill="none" className="absolute inset-0 w-full h-full z-10" style={{ animation: 'welcome-ring-ccw 28s linear infinite' }}>
            {/* Inner ring */}
            <circle cx="70" cy="70" r="48" stroke="rgba(210,170,120,0.6)" strokeWidth="2" />
          </svg>

          {/* Leaf — static, positioned bottom-right inside inner ring */}
          <svg viewBox="0 0 140 140" fill="none" className="absolute inset-0 w-full h-full z-20">
            <path
              d="M60 100 C60 100 46 78 62 60 C76 44 88 60 88 60 C88 60 78 88 64 94 C60 95 60 100 60 100 Z"
              stroke="rgba(210,170,120,0.7)"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M64 94 Q72 78 74 62"
              stroke="rgba(210,170,120,0.3)"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Name */}
        <motion.h1
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: 'rgba(230,215,195,0.9)', fontSize: 42, letterSpacing: 3 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Своя
        </motion.h1>

        {/* Slogan */}
        <motion.p
          className="text-center mt-5"
          style={{ color: 'rgba(230,215,195,0.4)', fontSize: 14, lineHeight: 1.6 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Питание и тренировки,<br />которые понимают<br />твоё здоровье
        </motion.p>
      </div>

      {/* Bottom section: buttons */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(isReturningUser ? '/nutrition' : '/questionnaire')}
          className="w-full rounded-full py-4 text-base font-medium"
          style={{ backgroundColor: 'rgba(210,180,140,0.85)', color: '#1A1A1A' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {isReturningUser ? 'Продолжить' : 'Начать'}
        </motion.button>

        <motion.button
          onClick={() => setShowModal(true)}
          style={{ color: 'rgba(230,215,195,0.35)', fontSize: 13 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Как это работает
        </motion.button>

        {isReturningUser && (
          <button onClick={handleReset} style={{ color: 'rgba(255,255,255,0.1)', fontSize: 10 }}>
            Начать заново
          </button>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes welcome-glow { 0%,100% { opacity: 0.6; transform: scale(1) } 50% { opacity: 1; transform: scale(1.05) } }
        @keyframes welcome-ring-cw { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes welcome-ring-ccw { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
      `}</style>

      <AnimatePresence>
        {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
