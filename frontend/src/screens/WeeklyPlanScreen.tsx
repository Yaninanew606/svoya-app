import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Download, ArrowRight, Clock, X } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { DaySchedule } from '../types';
import TabBar from '../components/TabBar';


const TYPE_LABELS: Record<string, string> = {
  strength: 'Силовая',
  cardio: 'Кардио',
  flexibility: 'Растяжка',
  rest: 'Отдых',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  strength: 'bg-orange-100 text-orange-700',
  cardio: 'bg-rose-100 text-rose-700',
  flexibility: 'bg-teal-100 text-teal-700',
  rest: 'bg-gray-100 text-gray-500',
};

const SCHEDULE_TIMES: Record<string, string> = {
  early: '06:30',
  standard: '08:00',
  late: '10:00',
  irregular: '09:00',
};

function getExerciseCount(day: DaySchedule): number {
  if (!day.workout) return 0;
  const { warmup, main, cooldown } = day.workout.phases;
  return warmup.length + main.length + cooldown.length;
}

function getExerciseNames(day: DaySchedule): string {
  if (!day.workout) return '';
  const { warmup, main, cooldown } = day.workout.phases;
  return [...warmup, ...main, ...cooldown].map((e) => e.name).join(', ');
}

function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatICSDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}00`;
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    if (match === '\n') return '\\n';
    return `\\${match}`;
  });
}

function generateICSFile(
  schedule: DaySchedule[],
  selectedDays: boolean[],
  dailySchedule: string
): string {
  const monday = getMondayOfCurrentWeek();
  const timeStr = SCHEDULE_TIMES[dailySchedule] || '08:00';
  const [hours, minutes] = timeStr.split(':').map(Number);

  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Svoya App//RU\r\n';

  schedule.forEach((day, i) => {
    if (!selectedDays[i] || !day.workout) return;

    const eventDate = new Date(monday);
    eventDate.setDate(monday.getDate() + i);
    eventDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setMinutes(endDate.getMinutes() + (day.workout.duration || 30));

    const summary = `${TYPE_LABELS[day.type]} тренировка`;
    const description = getExerciseNames(day);

    ics += 'BEGIN:VEVENT\r\n';
    ics += `DTSTART:${formatICSDate(eventDate)}\r\n`;
    ics += `DTEND:${formatICSDate(endDate)}\r\n`;
    ics += `SUMMARY:${escapeICS(summary)}\r\n`;
    ics += `DESCRIPTION:${escapeICS(description)}\r\n`;
    ics += 'LOCATION:Дом\r\n';
    ics += 'END:VEVENT\r\n';
  });

  ics += 'END:VCALENDAR\r\n';
  return ics;
}

function downloadICS(content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workout-plan.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function CalendarModal({
  schedule,
  dailySchedule,
  onClose,
}: {
  schedule: DaySchedule[];
  dailySchedule: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<boolean[]>(
    schedule.map((d) => d.type !== 'rest')
  );

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const handleDownload = () => {
    const ics = generateICSFile(schedule, selected, dailySchedule);
    downloadICS(ics);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        exit={{ y: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-t-3xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--text)]">Добавить в календарь</h3>
          <button onClick={onClose} className="p-1 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {schedule.map((day, i) => (
            <label
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected[i]}
                onChange={() => toggle(i)}
                disabled={day.type === 'rest'}
                className="w-5 h-5 rounded accent-[var(--primary)]"
              />
              <span className="text-sm text-[var(--text)] flex-1">{day.day}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_BADGE_COLORS[day.type]}`}>
                {TYPE_LABELS[day.type]}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={handleDownload}
          className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Скачать .ics файл
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">
          Откройте файл в Google Calendar, Apple Calendar или Outlook
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function WeeklyPlanScreen() {
  const navigate = useNavigate();
  const plan = useAppStore((s) => s.plan);
  const questionnaire = useAppStore((s) => s.questionnaire);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const schedule = plan?.weeklyWorkout?.schedule || [];
  const nutrition = plan?.nutrition;
  const dailySchedule = questionnaire.dailySchedule || 'standard';

  const todayDayName = useMemo(() => {
    const jsDay = new Date().getDay(); // 0=Sun
    const mapped = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return mapped[jsDay];
  }, []);

  if (!plan) {
    navigate('/', { replace: true });
    return null;
  }

  const foodPreferences = questionnaire.foodPreferences || [];
  const hasIntermittentFasting = foodPreferences.includes('intermittent-fasting') || foodPreferences.includes('интервальное голодание');

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-2">
        <h1
          className="text-3xl font-bold text-[var(--text)]"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Твоя неделя
        </h1>
        <p className="text-sm text-gray-400 mt-1">План тренировок и питания</p>
      </div>

      {/* Weekly grid */}
      <div className="px-6 mt-4 flex flex-col gap-3">
        {schedule.map((day, i) => {
          const isToday = day.day === todayDayName;
          const exerciseCount = getExerciseCount(day);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className={`bg-white rounded-2xl shadow-sm p-4 ${
                isToday ? 'ring-2 ring-[var(--primary)]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-[var(--text)]">{day.day}</h3>
                  {isToday && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-medium">
                      Сегодня
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_BADGE_COLORS[day.type]}`}
                >
                  {TYPE_LABELS[day.type]}
                </span>
              </div>

              {day.workout ? (
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {day.workout.duration} мин
                  </span>
                  {day.workout.focus && <span>{day.workout.focus}</span>}
                  <span>{exerciseCount} упражнений</span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2">Восстановление</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Nutrition summary */}
      {nutrition && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="mx-6 mt-6 bg-white rounded-2xl shadow-sm p-4"
        >
          <h3 className="text-sm font-semibold text-[var(--text)] mb-2">Питание</h3>
          <p className="text-sm text-gray-500">
            {nutrition.totalCalories} ккал в день
          </p>
          {foodPreferences.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Учтены предпочтения: {foodPreferences.join(', ')}
            </p>
          )}
          {hasIntermittentFasting && (
            <p className="text-xs text-teal-600 mt-1">
              Интервальное голодание: 16/8
            </p>
          )}
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="px-6 mt-8 flex flex-col gap-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => setShowCalendarModal(true)}
          className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-base flex items-center justify-center gap-2"
        >
          <Calendar size={18} />
          Добавить в Google Calendar
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          onClick={() => navigate('/nutrition')}
          className="w-full py-3.5 rounded-2xl border border-[var(--primary)] text-[var(--primary)] font-semibold text-base flex items-center justify-center gap-2"
        >
          Начать сегодня
          <ArrowRight size={18} />
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={() => navigate('/questionnaire')}
          className="w-full py-3 text-sm text-gray-400"
        >
          Изменить план
        </motion.button>
      </div>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendarModal && schedule.length > 0 && (
          <CalendarModal
            schedule={schedule}
            dailySchedule={dailySchedule}
            onClose={() => setShowCalendarModal(false)}
          />
        )}
      </AnimatePresence>

      <TabBar />
    </div>
  );
}
