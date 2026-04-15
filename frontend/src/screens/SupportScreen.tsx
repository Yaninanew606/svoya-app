import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Flame, Sparkles, Calendar, Pencil } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { api } from '../api/client';
import TabBar from '../components/TabBar';

export default function SupportScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { streak, plan } = useAppStore();

  const incoming = (location.state as { supportMessage?: string } | null)?.supportMessage;
  const [supportMessage, setSupportMessage] = useState(incoming || '');
  const [loading, setLoading] = useState(!incoming);
  const [messageKey, setMessageKey] = useState(0);
  const [showTomorrow, setShowTomorrow] = useState(false);

  useEffect(() => {
    if (!incoming) {
      setLoading(true);
      api
        .getMotivation('after-checkin')
        .then((r) => setSupportMessage(r.message))
        .catch(() => setSupportMessage('Ты на правильном пути. Каждый день -- это шаг вперёд.'))
        .finally(() => setLoading(false));
    }
  }, [incoming]);

  const handleMotivate = async () => {
    setLoading(true);
    try {
      const r = await api.getMotivation('random');
      setSupportMessage(r.message);
      setMessageKey((k) => k + 1);
    } catch {
      setSupportMessage('Верь в себя -- ты уже делаешь больше, чем вчера.');
      setMessageKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const tomorrowSummary = plan
    ? `Тренировка: ${plan.workout.focus}, ${plan.workout.duration} мин. Питание: ${plan.nutrition.totalCalories} ккал.`
    : 'План ещё не сформирован.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#FAF7F4] pb-24"
    >
      <div className="max-w-md mx-auto px-5 pt-10 flex flex-col items-center gap-6">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <Leaf size={48} className="text-[var(--primary)]" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-[#3D2B1F] text-center"
        >
          Ты молодец
        </motion.h1>

        {/* Support message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={messageKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-lg leading-relaxed text-[#3D2B1F] text-center px-2"
          >
            {loading ? (
              <span className="inline-block w-6 h-6 border-2 border-[#B5886A] border-t-transparent rounded-full animate-spin" />
            ) : (
              supportMessage
            )}
          </motion.p>
        </AnimatePresence>

        {/* Streak badge */}
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#E8D5C4] text-[#3D2B1F] font-semibold px-5 py-2 rounded-full shadow-sm flex items-center gap-2"
          >
            <Flame size={18} className="text-orange-500" />
            {streak} дней подряд
          </motion.div>
        )}

        {/* Tomorrow card */}
        <AnimatePresence>
          {showTomorrow && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full bg-white rounded-2xl shadow-sm p-5 overflow-hidden"
            >
              <h3 className="font-semibold text-[#3D2B1F] mb-2">Что запланировано на завтра</h3>
              <p className="text-[#3D2B1F] text-sm leading-relaxed">{tomorrowSummary}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            onClick={handleMotivate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#B5886A] text-white font-semibold shadow-md hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            Мотивируй меня
          </button>

          <button
            onClick={() => setShowTomorrow((v) => !v)}
            className="w-full py-3 rounded-xl bg-white text-[#3D2B1F] font-semibold shadow-sm border border-[#E8D5C4] hover:bg-[#E8D5C4]/30 transition flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            Что завтра?
          </button>

          <button
            onClick={() => navigate('/questionnaire')}
            className="w-full py-3 rounded-xl bg-white text-[#3D2B1F] font-semibold shadow-sm border border-[#E8D5C4] hover:bg-[#E8D5C4]/30 transition flex items-center justify-center gap-2"
          >
            <Pencil size={18} />
            Изменить план
          </button>

          <button
            onClick={() => navigate('/nutrition')}
            className="w-full py-3 rounded-xl bg-[#7A9E7E] text-white font-semibold shadow-md hover:opacity-90 transition"
          >
            На главную
          </button>
        </div>
      </div>

      <TabBar />
    </motion.div>
  );
}
