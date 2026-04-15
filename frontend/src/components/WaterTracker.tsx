import { useState, useEffect } from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';

function getDateKey() {
  return `water-${new Date().toISOString().slice(0, 10)}`;
}

function loadGlasses(): number {
  try {
    const val = localStorage.getItem(getDateKey());
    return val ? Math.min(Math.max(parseInt(val, 10) || 0, 0), 20) : 0;
  } catch { return 0; }
}

export default function WaterTracker() {
  const target = 8;
  const [glasses, setGlasses] = useState(loadGlasses);

  useEffect(() => {
    localStorage.setItem(getDateKey(), String(glasses));
  }, [glasses]);

  const add = () => setGlasses((g) => Math.min(g + 1, 20));
  const remove = () => setGlasses((g) => Math.max(g - 1, 0));
  const toggle = (i: number) => {
    if (i < glasses) setGlasses(i);
    else setGlasses(i + 1);
  };

  const progress = Math.min(glasses / target, 1);
  const radius = 50;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Droplets size={20} className="text-[var(--primary)]" />
        <span className="font-bold text-[var(--text)]">Вода</span>
      </div>

      <div className="flex items-center gap-6">
        {/* SVG ring */}
        <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="var(--secondary, #f0f0f0)"
              strokeWidth={stroke}
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[var(--text)]">{glasses}/{target}</span>
            <span className="text-[10px] text-gray-400">стаканов воды</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {/* Circles row */}
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: target }, (_, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="w-5 h-5 rounded-full border-2 transition-colors"
                style={{
                  borderColor: 'var(--primary)',
                  backgroundColor: i < glasses ? 'var(--primary)' : 'transparent',
                }}
              />
            ))}
          </div>

          {/* +/- buttons */}
          <div className="flex gap-2">
            <button
              onClick={remove}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-400 active:bg-gray-50"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={add}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--primary)] text-[var(--primary)] active:bg-[var(--primary)]/5"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
