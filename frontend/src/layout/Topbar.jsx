import { useAuth } from '../context/AuthContext';
import { LogOut, User, Zap, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeClass = {
    ADMIN: 'badge-red',
    MANAGER: 'badge-blue',
    EMPLOYEE: 'badge-green',
  }[user?.role] || 'badge-green';

  return (
    <header className="h-14 bg-surface-card border-b border-slate-200/80 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-bold text-slate-800">{title}</h1>

      <div className="flex items-center gap-4">
        {/* XP & Points */}
        {user && (
          <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-brand-650 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200/40">
              <Zap className="w-3.5 h-3.5 fill-brand-600 stroke-none" />
              {user.xp ?? 0} XP
            </span>
            <span className="flex items-center gap-1 text-yellow-750 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200/40">
              <Coins className="w-3.5 h-3.5 fill-yellow-600 stroke-none" />
              {user.points ?? 0} pts
            </span>
          </div>
        )}

        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-700 leading-tight">{user?.name || 'User'}</p>
            <span className={`${roleBadgeClass} text-[10px]`}>{user?.role}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
