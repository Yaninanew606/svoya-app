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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[var(--background)] rounded-3xl p-8 max-w-sm w-full shadow-xl relative"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text)] opacity-40 text-xl">x</button>
        <h3 className="font-[Cormorant_Garamond] text-2xl font-bold text-[var(--text)] mb-6 text-center">Как это работает</h3>
        <div className="relative overflow-hidden min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div key={slide} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center text-center gap-3">
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
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/welcome-bg.jpg';
    img.onload = () => setBgLoaded(true);
  }, []);

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
      className="min-h-screen relative flex flex-col"
      style={{ backgroundColor: '#262524' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: bgLoaded ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Banner background — covers top, seamless with bottom */}
      <div
        className="flex-1 bg-cover bg-top bg-no-repeat relative"
        style={{
          backgroundImage: bgLoaded ? 'url(/welcome-bg.jpg)' : 'none',
          minHeight: '58vh',
        }}
      >
        {/* Spinning glow overlay on top of logo */}
        <style>{`
          @keyframes welcome-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        `}</style>
        <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-8%' }}>
          <div
            className="rounded-full"
            style={{
              width: '42vw',
              height: '42vw',
              maxWidth: 180,
              maxHeight: 180,
              border: '1.5px solid rgba(212,168,130,0.25)',
              animation: 'welcome-spin 15s linear infinite',
            }}
          />
        </div>
      </div>

      {/* Bottom section */}
      <div
        className="flex flex-col items-center gap-4 px-8 pb-10 pt-4"
        style={{ backgroundColor: '#262524' }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(isReturningUser ? '/nutrition' : '/questionnaire')}
          className="w-full max-w-xs rounded-2xl px-8 py-4 text-lg font-semibold shadow-lg"
          style={{ background: 'linear-gradient(135deg, #B5886A, #D4A882)', color: 'white' }}
        >
          {isReturningUser ? 'Продолжить' : 'Начать'}
        </motion.button>

        <button
          onClick={() => setShowModal(true)}
          className="text-gray-500 text-sm underline underline-offset-4"
        >
          Как это работает
        </button>

        {isReturningUser && (
          <button onClick={handleReset} className="text-gray-600 text-xs">
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
