import { useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Dumbbell, ClipboardCheck, BarChart3 } from 'lucide-react';

const tabs = [
  { path: '/nutrition', label: 'Питание', icon: UtensilsCrossed },
  { path: '/workout', label: 'Тренировка', icon: Dumbbell },
  { path: '/checkin', label: 'Чек-ин', icon: ClipboardCheck },
  { path: '/analytics', label: 'Аналитика', icon: BarChart3 },
] as const;

export default function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-white rounded-t-2xl shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors"
          >
            <Icon
              size={22}
              className={active ? 'text-[var(--primary)]' : 'text-gray-400'}
            />
            <span
              className={`text-xs ${active ? 'text-[var(--primary)] font-semibold' : 'text-gray-400'}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
