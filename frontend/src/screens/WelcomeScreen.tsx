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
  const [loaded, setLoaded] = useState(false);

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
    const img = new Image();
    img.src = '/welcome.png';
    img.onload = () => setLoaded(true);
  }, []);

  return (
    <motion.div
      className="min-h-screen w-full bg-contain bg-top bg-no-repeat relative"
      style={{
        backgroundImage: loaded ? 'url(/welcome.png)' : 'none',
        backgroundColor: '#1A1A1A',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Invisible area over the design's "Начать" button position */}
      <button
        onClick={() => navigate(isReturningUser ? '/nutrition' : '/questionnaire')}
        className="absolute left-0 right-0 mx-auto"
        style={{
          bottom: '14%',
          width: '55%',
          height: 50,
          background: 'transparent',
        }}
      />

      {/* Invisible area over "Как это работает" position */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute left-0 right-0 mx-auto"
        style={{
          bottom: '8%',
          width: '50%',
          height: 30,
          background: 'transparent',
        }}
      />

      {/* Reset button — very bottom, barely visible */}
      {isReturningUser && (
        <button
          onClick={handleReset}
          className="absolute left-0 right-0 mx-auto text-center"
          style={{ bottom: '3%', color: 'rgba(255,255,255,0.1)', fontSize: 10 }}
        >
          Начать заново
        </button>
      )}

      <AnimatePresence>
        {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
