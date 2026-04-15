import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { api } from '../api/client';
import type { QuestionnaireData } from '../types';

const phrases = [
  'Смотрю на твои ответы…',
  'Подбираю подходящие упражнения…',
  'Составляю меню на сегодня…',
  'Почти готово! ✨',
];

export default function GeneratingScreen() {
  const navigate = useNavigate();
  const { questionnaire, nutritionMode, setPlan } = useAppStore();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [error, setError] = useState(false);
  const calledRef = useRef(false);

  const generate = () => {
    setError(false);
    calledRef.current = true;

    const startTime = Date.now();

    api
      .generatePlan({
        questionnaire: questionnaire as QuestionnaireData,
        preferences: { nutritionMode },
      })
      .then((plan) => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 3000 - elapsed);
        setTimeout(() => {
          setPlan(plan);
          navigate('/nutrition', { replace: true });
        }, remaining);
      })
      .catch(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 3000 - elapsed);
        setTimeout(() => setError(true), remaining);
      });
  };

  useEffect(() => {
    if (!calledRef.current) generate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-[#FAF7F4] min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[#3D2B1F] text-lg mb-6">
          Что-то пошло не так, попробуем ещё раз?
        </p>
        <button
          onClick={generate}
          className="bg-[#B5886A] text-white px-8 py-3 rounded-2xl text-base font-medium"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F4] min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        className="text-6xl mb-8"
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🌿
      </motion.div>

      <div className="h-8 relative w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-[#3D2B1F] text-base text-center absolute"
          >
            {phrases[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
