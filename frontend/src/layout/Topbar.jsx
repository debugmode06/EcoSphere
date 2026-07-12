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
    <header className="h-14 bg-surface-card border-b border-slate-700/50 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-slate-200">{title}</h1>

      <div className="flex items-center gap-4">
        {/* XP & Points */}
        {user && (
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-brand-400">
              <Zap className="w-3.5 h-3.5" />
              {user.xp ?? 0} XP
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <Coins className="w-3.5 h-3.5" />
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
            <p className="text-xs font-medium text-slate-200 leading-tight">{user?.name || 'User'}</p>
            <span className={`${roleBadgeClass} text-[10px]`}>{user?.role}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
