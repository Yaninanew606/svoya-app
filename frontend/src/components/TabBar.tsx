import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays, Dumbbell, User } from 'lucide-react';

const tabs = [
  { path: '/nutrition', label: 'Сегодня', icon: CalendarDays },
  { path: '/workout', label: 'Тренировка', icon: Dumbbell },
  { path: '/analytics', label: 'Профиль', icon: User },
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
            className="flex-1 flex flex-col items-center gap-0.5 py-3 min-w-[48px]"
          >
            <Icon
              size={24}
              className={active ? 'text-[var(--primary)]' : 'text-gray-400'}
            />
            <span
              className={`text-[10px] ${active ? 'text-[var(--primary)] font-semibold' : 'text-gray-400'}`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
