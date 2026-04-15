import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Minus, Lightbulb, Download } from 'lucide-react';
import TabBar from '../components/TabBar';

interface CheckinDay {
  day: string;
  mood: number;
  sleep: 'yes' | 'no' | 'almost';
  nutrition: 'yes' | 'partial' | 'no';
  workout: 'yes' | 'partial' | 'no';
}

const mockHistory: CheckinDay[] = [
  { day: 'Пн', mood: 3, sleep: 'yes', nutrition: 'yes', workout: 'yes' },
  { day: 'Вт', mood: 4, sleep: 'yes', nutrition: 'partial', workout: 'yes' },
  { day: 'Ср', mood: 2, sleep: 'no', nutrition: 'partial', workout: 'no' },
  { day: 'Чт', mood: 3, sleep: 'almost', nutrition: 'yes', workout: 'yes' },
  { day: 'Пт', mood: 4, sleep: 'yes', nutrition: 'yes', workout: 'partial' },
  { day: 'Сб', mood: 3, sleep: 'almost', nutrition: 'partial', workout: 'no' },
  { day: 'Вс', mood: 4, sleep: 'yes', nutrition: 'yes', workout: 'yes' },
];

const moodColor = (mood: number) => {
  switch (mood) {
    case 1: return '#EF4444';
    case 2: return '#F97316';
    case 3: return '#3B82F6';
    case 4: return '#22C55E';
    default: return '#94A3B8';
  }
};

function countCompliant(data: CheckinDay[], field: 'sleep' | 'nutrition' | 'workout') {
  return data.filter((d) => d[field] === 'yes').length;
}

function CircularProgress({ value, max, color, label, count }: { value: number; max: number; color: string; label: string; count: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;

  return (
    <div className="flex-1 flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" className="text-sm font-semibold" fill="#1E293B">{count}</text>
      </svg>
      <span className="text-xs text-gray-500 text-center">{label}</span>
    </div>
  );
}

function generateRecommendations(data: CheckinDay[]) {
  const recs: string[] = [];
  const sleepGood = countCompliant(data, 'sleep');
  const workoutGood = countCompliant(data, 'workout');
  const nutritionGood = countCompliant(data, 'nutrition');
  const partialNutrition = data.filter((d) => d.nutrition === 'partial').length;
  const missedWorkouts = data.filter((d) => d.workout === 'no').length;

  if (sleepGood < 5) {
    recs.push('Попробуй ложиться на 30 минут раньше -- это влияет на энергию и настроение');
  }
  if (missedWorkouts >= 2) {
    recs.push('Три дня без тренировки -- начни с легкой растяжки на 10 минут');
  }
  if (partialNutrition >= 2) {
    recs.push('Подготовь перекусы заранее -- орехи, фрукты. Это поможет не срываться');
  }
  if (sleepGood >= 5 && workoutGood >= 5 && nutritionGood >= 5) {
    recs.push('Отличная неделя! Можно попробовать увеличить время тренировки на 5 минут');
  }

  if (recs.length === 0) {
    recs.push('Продолжай в том же духе -- стабильность важнее идеальных результатов');
  }

  return recs;
}

const trends = [
  { label: 'Настроение', direction: 'up' as const, text: 'улучшается' },
  { label: 'Питание', direction: 'stable' as const, text: 'стабильно' },
  { label: 'Сон', direction: 'down' as const, text: 'ухудшается' },
];

const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'stable' }) => {
  if (direction === 'up') return <TrendingUp size={18} className="text-green-500" />;
  if (direction === 'down') return <TrendingDown size={18} className="text-red-500" />;
  return <Minus size={18} className="text-gray-400" />;
};

export default function AnalyticsScreen() {
  const avgMood = (mockHistory.reduce((s, d) => s + d.mood, 0) / mockHistory.length).toFixed(1);
  const sleepCount = countCompliant(mockHistory, 'sleep');
  const nutritionCount = countCompliant(mockHistory, 'nutrition');
  const workoutCount = countCompliant(mockHistory, 'workout');
  const recommendations = generateRecommendations(mockHistory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[var(--background)] pb-24"
    >
      <div className="px-5 pt-12 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-[Cormorant_Garamond] text-3xl font-bold text-[var(--text)]">Аналитика</h1>
          <p className="text-sm text-gray-500 mt-1">Последние 7 дней</p>
        </div>

        {/* Mood Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-end justify-between gap-2 h-32 mb-3">
            {mockHistory.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.mood / 4) * 100}%` }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
                  className="w-full max-w-[32px] rounded-lg"
                  style={{ backgroundColor: moodColor(d.mood) }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-2">
            {mockHistory.map((d, i) => (
              <span key={i} className="flex-1 text-center text-xs text-gray-400">{d.day}</span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center">
            Среднее настроение: <span className="font-semibold text-[var(--text)]">{avgMood}/4</span>
          </p>
        </motion.div>

        {/* Compliance Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <CircularProgress value={nutritionCount} max={7} color="var(--accent)" label="Питание" count={`${nutritionCount}/7`} />
          <CircularProgress value={workoutCount} max={7} color="var(--primary)" label="Тренировки" count={`${workoutCount}/7`} />
          <CircularProgress value={sleepCount} max={7} color="#3B82F6" label="Сон" count={`${sleepCount}/7`} />
        </motion.div>

        {/* Trends */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h2 className="font-semibold text-[var(--text)] mb-3">Тренд</h2>
          <div className="space-y-2">
            {trends.map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <TrendIcon direction={t.direction} />
                <span className="text-sm text-gray-600">
                  {t.label}: <span className="font-medium text-[var(--text)]">{t.text}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={20} className="text-[var(--accent)]" />
            <h2 className="font-semibold text-[var(--text)]">Рекомендации</h2>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="pl-4 border-l-3 border-[var(--accent)] text-sm text-gray-600 leading-relaxed"
              >
                {rec}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={() => { const el = document.getElementById('ai-toast'); if (el) { el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 3000); } }}
            className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <BarChart3 size={18} />
            Получить подробный анализ
          </button>
          <div id="ai-toast" className="hidden text-center text-sm text-gray-500 py-2">
            Полный AI-анализ скоро будет доступен
          </div>
          <button
            onClick={() => {
              const lines = [
                'Отчет за неделю',
                '---',
                `Среднее настроение: ${avgMood}/4`,
                `Питание: ${nutritionCount}/7 дней`,
                `Тренировки: ${workoutCount}/7 дней`,
                `Сон: ${sleepCount}/7 дней`,
                '',
                'Рекомендации:',
                ...recommendations.map((r) => `- ${r}`),
              ];
              const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'weekly-report.txt';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Скачать отчет
          </button>
        </motion.div>
      </div>

      <TabBar />
    </motion.div>
  );
}
