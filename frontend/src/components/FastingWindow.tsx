import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Settings2, X } from 'lucide-react';

interface Props {
  dailySchedule?: string;
}

interface WindowConfig {
  start: number; // hour 0-23
  end: number;
  meals: { label: string; time: string }[];
}

const PRESETS: Record<string, WindowConfig> = {
  early: {
    start: 8, end: 16,
    meals: [
      { label: 'Первый приём', time: '08:00' },
      { label: 'Обед', time: '12:00' },
      { label: 'Последний приём', time: '15:30' },
    ],
  },
  standard: {
    start: 12, end: 20,
    meals: [
      { label: 'Первый приём', time: '12:00' },
      { label: 'Обед', time: '15:00' },
      { label: 'Последний приём', time: '19:30' },
    ],
  },
  late: {
    start: 14, end: 22,
    meals: [
      { label: 'Первый приём', time: '14:00' },
      { label: 'Обед', time: '17:00' },
      { label: 'Последний приём', time: '21:30' },
    ],
  },
};

function getStoredConfig(schedule: string): WindowConfig {
  try {
    const stored = localStorage.getItem('fasting-window');
    if (stored) return JSON.parse(stored);
  } catch {}
  return PRESETS[schedule] || PRESETS.standard;
}

export default function FastingWindow({ dailySchedule }: Props) {
  const [config, setConfig] = useState<WindowConfig>(() => getStoredConfig(dailySchedule || 'standard'));
  const [showSettings, setShowSettings] = useState(false);
  const [editStart, setEditStart] = useState(config.start);
  const [editEnd, setEditEnd] = useState(config.end);

  useEffect(() => {
    localStorage.setItem('fasting-window', JSON.stringify(config));
  }, [config]);

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const isEatingWindow = currentHour >= config.start && currentHour < config.end;
  const windowHours = config.end - config.start;
  const fastHours = 24 - windowHours;

  const saveSettings = () => {
    const start = editStart;
    const end = editEnd;
    const duration = end - start;
    const mealGap = duration / 3;
    const meals = [
      { label: 'Первый приём', time: `${String(start).padStart(2, '0')}:00` },
      { label: 'Обед', time: `${String(Math.round(start + mealGap)).padStart(2, '0')}:00` },
      { label: 'Последний приём', time: `${String(Math.round(end - 0.5)).padStart(2, '0')}:30` },
    ];
    setConfig({ start, end, meals });
    setShowSettings(false);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer size={18} className="text-[var(--primary)]" />
          <span className="font-bold text-[var(--text)] text-sm">Интервальное голодание</span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400">
          <Settings2 size={16} />
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${isEatingWindow ? 'bg-green-400' : 'bg-gray-300'}`} />
        <span className="text-xs text-gray-500">
          {isEatingWindow
            ? `Окно приёма пищи до ${config.end}:00`
            : `Голодание · следующий приём в ${config.start}:00`
          }
        </span>
      </div>

      {/* Timeline */}
      <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden mb-3">
        {/* Eating window */}
        <div
          className="absolute h-full bg-[var(--accent)]/30 rounded-full"
          style={{
            left: `${(config.start / 24) * 100}%`,
            width: `${(windowHours / 24) * 100}%`,
          }}
        />
        {/* Meal dots */}
        {config.meals.map((meal, i) => {
          const hour = parseInt(meal.time.split(':')[0]) + parseInt(meal.time.split(':')[1]) / 60;
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[var(--primary)] border-2 border-white"
              style={{ left: `${(hour / 24) * 100}%` }}
              title={`${meal.label} ${meal.time}`}
            />
          );
        })}
        {/* Current time marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-[var(--text)]"
          style={{ left: `${(currentHour / 24) * 100}%` }}
        />
        {/* Hour labels */}
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">0</span>
        <span className="absolute left-1/4 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">6</span>
        <span className="absolute left-1/2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">12</span>
        <span className="absolute left-3/4 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">18</span>
      </div>

      {/* Meal times */}
      <div className="flex justify-between text-xs text-gray-500">
        {config.meals.map((meal, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-[var(--primary)] font-medium">{meal.time}</span>
            <span className="text-[10px] text-gray-400">{meal.label}</span>
          </div>
        ))}
      </div>

      {/* Window info */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
        <span>Едим: {windowHours}ч</span>
        <span>Голодание: {fastHours}ч</span>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[var(--text)]">Настройка окна</span>
                <button onClick={() => setShowSettings(false)}>
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Начало</label>
                  <select
                    value={editStart}
                    onChange={e => setEditStart(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 5).map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Конец</label>
                  <select
                    value={editEnd}
                    onChange={e => setEditEnd(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 7).map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick presets */}
              <div className="flex gap-2 mb-3">
                {[
                  { label: '16:8 рано', start: 8, end: 16 },
                  { label: '16:8', start: 12, end: 20 },
                  { label: '18:6', start: 12, end: 18 },
                  { label: '14:10', start: 10, end: 20 },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => { setEditStart(p.start); setEditEnd(p.end); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      editStart === p.start && editEnd === p.end
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <button
                onClick={saveSettings}
                className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium"
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
