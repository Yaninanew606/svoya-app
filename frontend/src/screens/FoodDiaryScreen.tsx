import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Trash2, Clock, X } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import TabBar from '../components/TabBar';

/* ─── Types ─── */
interface FoodEntry {
  id: string;
  time: string;
  description: string;
  photo?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/* ─── Helpers ─── */
function todayKey() {
  return `food-diary-${new Date().toISOString().slice(0, 10)}`;
}

function loadEntries(): FoodEntry[] {
  try {
    const raw = localStorage.getItem(todayKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: FoodEntry[]) {
  localStorage.setItem(todayKey(), JSON.stringify(entries));
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(): string {
  const d = new Date();
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function estimateCalories(text: string) {
  const t = text.toLowerCase();
  let cal = 250, p = 10, f = 8, c = 30;

  if (t.includes('гречк') || t.includes('каш')) { cal = 300; p = 12; f = 5; c = 55; }
  if (t.includes('курицу') || t.includes('куриц') || t.includes('грудк')) { cal = 350; p = 35; f = 8; c = 20; }
  if (t.includes('салат')) { cal = 150; p = 5; f = 8; c = 12; }
  if (t.includes('яйц') || t.includes('омлет')) { cal = 200; p = 14; f = 12; c = 2; }
  if (t.includes('творог')) { cal = 180; p = 18; f = 5; c = 8; }
  if (t.includes('суп')) { cal = 200; p = 10; f = 6; c = 25; }
  if (t.includes('рыб') || t.includes('лосось')) { cal = 300; p = 28; f = 15; c = 5; }
  if (t.includes('рис')) { cal = 280; p = 6; f = 2; c = 58; }
  if (t.includes('хлеб')) { cal = 120; p = 4; f = 2; c = 22; }
  if (t.includes('йогурт') || t.includes('кефир')) { cal = 120; p = 8; f = 4; c = 10; }
  if (t.includes('фрукт') || t.includes('яблок') || t.includes('банан')) { cal = 100; p = 1; f = 0; c = 25; }
  if (t.includes('орех')) { cal = 200; p = 6; f = 18; c = 5; }
  if (t.includes('шоколад') || t.includes('конфет')) { cal = 250; p = 3; f = 14; c = 28; }
  if (t.includes('макарон') || t.includes('паст')) { cal = 350; p = 12; f = 5; c = 65; }

  if (t.includes('мало') || t.includes('чуть') || t.includes('кусочек')) {
    cal = Math.round(cal * 0.5); p = Math.round(p * 0.5); f = Math.round(f * 0.5); c = Math.round(c * 0.5);
  }
  if (t.includes('много') || t.includes('большу') || t.includes('тарелк')) {
    cal = Math.round(cal * 1.5); p = Math.round(p * 1.5); f = Math.round(f * 1.5); c = Math.round(c * 1.5);
  }

  return { calories: cal, protein: p, fat: f, carbs: c };
}

function macroColor(fact: number, plan: number): string {
  if (plan === 0) return 'text-gray-500';
  const ratio = fact / plan;
  if (ratio <= 1.0) return 'text-green-600';
  if (ratio <= 1.15) return 'text-orange-500';
  return 'text-red-500';
}

function getEatingWindow(questionnaire: Record<string, any>): { start: number; end: number } | null {
  const prefs: string[] = questionnaire.foodPreferences || [];
  if (!prefs.includes('intermittent_fasting')) return null;
  const schedule = questionnaire.dailySchedule as string | undefined;
  if (schedule === 'early') return { start: 8, end: 16 };
  if (schedule === 'late') return { start: 14, end: 22 };
  return { start: 12, end: 20 };
}

function generateTip(totals: { calories: number; protein: number; fat: number; carbs: number }, plan: { calories: number; protein: number; fat: number; carbs: number }): string {
  if (totals.protein < plan.protein * 0.6) return 'Не хватает белка -- добавь творог или яйца на ужин';
  if (totals.fat > plan.fat * 1.2) return 'Многовато жиров сегодня -- выбери что-то полегче на следующий прием';
  if (totals.carbs < plan.carbs * 0.5) return 'Мало углеводов -- добавь крупу или фрукты';
  if (totals.calories < plan.calories * 0.5) return 'Ты пока съела меньше половины нормы -- не забудь поесть';
  if (totals.calories > plan.calories) return 'Дневная норма достигнута -- дальше только легкий перекус';
  return 'Хороший баланс на сегодня, так держать';
}

/* ─── Fasting Timeline ─── */
function FastingTimeline({ start, end }: { start: number; end: number }) {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const pctStart = (start / 24) * 100;
  const pctWidth = ((end - start) / 24) * 100;
  const pctNow = (currentHour / 24) * 100;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-sm font-semibold text-[var(--text)] mb-3">Окно питания</p>
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 bottom-0 bg-green-400/60 rounded-full"
          style={{ left: `${pctStart}%`, width: `${pctWidth}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[var(--primary)]"
          style={{ left: `${pctNow}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-0.5">
        <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Прием пищи: {start}:00 -- {end}:00
      </p>
    </div>
  );
}

/* ─── Entry Card ─── */
function EntryCard({ entry, onDelete, index }: { entry: FoodEntry; onDelete: () => void; index: number }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3"
      onContextMenu={(e) => { e.preventDefault(); setShowDelete(true); }}
    >
      {/* Time */}
      <div className="flex flex-col items-center pt-0.5 min-w-[40px]">
        <Clock size={14} className="text-gray-300 mb-0.5" />
        <span className="text-xs text-gray-400">{entry.time}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text)] leading-snug">{entry.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full font-medium">
            {entry.calories} ккал
          </span>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Б{entry.protein}
          </span>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Ж{entry.fat}
          </span>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            У{entry.carbs}
          </span>
        </div>
      </div>

      {/* Photo thumbnail */}
      {entry.photo && (
        <img src={entry.photo} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      )}

      {/* Delete */}
      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={onDelete}
            className="absolute right-3 top-3 bg-red-500 text-white p-1.5 rounded-full"
          >
            <Trash2 size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Add Entry Modal ─── */
function AddEntrySheet({ onClose, onSave }: { onClose: () => void; onSave: (e: FoodEntry) => void }) {
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [estimation, setEstimation] = useState<ReturnType<typeof estimateCalories> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleEstimate = () => {
    if (!text.trim()) return;
    setEstimation(estimateCalories(text));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!estimation) return;
    onSave({
      id: crypto.randomUUID(),
      time: nowTime(),
      description: text.trim(),
      photo,
      ...estimation,
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-6 pt-4 pb-8 max-h-[85vh] overflow-y-auto"
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--text)]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Новый прием пищи
          </h3>
          <button onClick={onClose} className="text-gray-400"><X size={20} /></button>
        </div>

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setEstimation(null); }}
          placeholder="Гречка с овощами, 200г"
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-[var(--text)] placeholder:text-gray-300 resize-none h-20 focus:outline-none focus:border-[var(--primary)]"
        />

        {/* Photo */}
        <div className="flex items-center gap-3 mt-3">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-2"
          >
            <Camera size={16} /> Фото
          </button>
          {photo && <img src={photo} alt="" className="w-12 h-12 rounded-lg object-cover" />}
        </div>

        {/* Estimate */}
        <button
          onClick={handleEstimate}
          disabled={!text.trim()}
          className="w-full mt-4 py-2.5 rounded-xl border border-[var(--primary)] text-[var(--primary)] font-medium text-sm disabled:opacity-40 transition-opacity"
        >
          Оценить
        </button>

        {estimation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-gray-50 rounded-xl p-3 text-sm text-[var(--text)]"
          >
            ~{estimation.calories} ккал, Б: {estimation.protein}г, Ж: {estimation.fat}г, У: {estimation.carbs}г
          </motion.div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!estimation}
          className="w-full mt-4 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm disabled:opacity-40 transition-opacity"
        >
          Сохранить
        </button>
      </motion.div>
    </>
  );
}

/* ─── Main Screen ─── */
export default function FoodDiaryScreen() {
  const plan = useAppStore((s) => s.plan);
  const questionnaire = useAppStore((s) => s.questionnaire);
  const [entries, setEntries] = useState<FoodEntry[]>(loadEntries);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { saveEntries(entries); }, [entries]);

  const planMacros = plan?.nutrition
    ? { calories: plan.nutrition.totalCalories, protein: plan.nutrition.macros.protein, fat: plan.nutrition.macros.fat, carbs: plan.nutrition.macros.carbs }
    : { calories: 2000, protein: 80, fat: 65, carbs: 250 };

  const totals = entries.reduce(
    (acc, e) => ({ calories: acc.calories + e.calories, protein: acc.protein + e.protein, fat: acc.fat + e.fat, carbs: acc.carbs + e.carbs }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );

  const fastingWindow = getEatingWindow(questionnaire);

  const addEntry = (entry: FoodEntry) => setEntries((prev) => [...prev, entry]);
  const deleteEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const progressPct = Math.min((totals.calories / planMacros.calories) * 100, 100);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-2">
        <h1
          className="text-2xl font-bold text-[var(--text)]"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Дневник питания
        </h1>
        <p className="text-sm text-gray-400 mt-1">{formatDate()}</p>
      </div>

      <div className="px-6 flex flex-col gap-4 mt-2">
        {/* Plan vs Fact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs">
                <th className="text-left font-normal pb-2"></th>
                <th className="text-right font-normal pb-2">План</th>
                <th className="text-right font-normal pb-2">Факт</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text)]">
              {([
                ['Калории', planMacros.calories, totals.calories, 'ккал'],
                ['Белок', planMacros.protein, totals.protein, 'г'],
                ['Жиры', planMacros.fat, totals.fat, 'г'],
                ['Углеводы', planMacros.carbs, totals.carbs, 'г'],
              ] as [string, number, number, string][]).map(([label, planVal, factVal, unit]) => (
                <tr key={label} className="border-t border-gray-50">
                  <td className="py-1.5 text-gray-500">{label}</td>
                  <td className="py-1.5 text-right font-medium">{planVal}{unit}</td>
                  <td className={`py-1.5 text-right font-bold ${macroColor(factVal, planVal)}`}>
                    {factVal}{unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Fasting window */}
        {fastingWindow && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <FastingTimeline start={fastingWindow.start} end={fastingWindow.end} />
          </motion.div>
        )}

        {/* Entries */}
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {entries.map((entry, i) => (
              <EntryCard key={entry.id} entry={entry} index={i} onDelete={() => deleteEntry(entry.id)} />
            ))}
          </AnimatePresence>

          {entries.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-300 text-sm py-12"
            >
              Добавь первый прием пищи
            </motion.p>
          )}
        </div>

        {/* Day summary */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-[var(--text)] mb-2">
              Итого за день: {totals.calories} ккал из {planMacros.calories} по плану
            </p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-[var(--primary)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <p className="text-xs text-gray-400">{generateTip(totals, planMacros)}</p>
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center z-30"
      >
        <Plus size={26} />
      </motion.button>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && <AddEntrySheet onClose={() => setShowAdd(false)} onSave={addEntry} />}
      </AnimatePresence>

      <TabBar />
    </div>
  );
}
