import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Leaf, Users, ShieldCheck, Trophy,
  BarChart2, Settings, ChevronDown, Globe, ClipboardList,
  Tag, Activity, ClipboardCheck, GraduationCap
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function buildNavGroups(role) {
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isAdminOrManager = isAdmin || isManager;

  return [
    {
      label: 'Overview',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ],
    },
    {
      label: 'Environmental',
      items: [
        { to: '/environmental/emissions', icon: Leaf, label: 'Emissions' },
        { to: '/environmental/goals', icon: BarChart2, label: 'Goals' },
      ],
    },
    {
      label: 'Social',
      items: [
        ...(isAdmin ? [{ to: '/social/categories', icon: Tag, label: 'Categories' }] : []),
        { to: '/social/activities', icon: Activity, label: 'CSR Activities' },
        { to: '/social/participations', icon: ClipboardList, label: 'My Participations' },
        ...(isAdminOrManager ? [{ to: '/social/approvals', icon: ClipboardCheck, label: 'Approvals' }] : []),
        { to: '/social/training', icon: GraduationCap, label: 'Trainings' },
        { to: '/social/diversity', icon: Users, label: 'Diversity' },
        ...(isAdminOrManager ? [{ to: '/social/reports', icon: BarChart2, label: 'Social Reports' }] : []),
      ],
    },
    {
      label: 'Governance',
      items: [
        { to: '/governance/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/governance/policies', icon: ShieldCheck, label: 'Policies' },
        { to: '/governance/audits', icon: ShieldCheck, label: 'Audits' },
        { to: '/governance/compliance', icon: ShieldCheck, label: 'Compliance' },
      ],
    },
    {
      label: 'Gamification',
      items: [
        { to: '/gamification/challenges', icon: Trophy, label: 'Challenges' },
        { to: '/gamification/badges', icon: Trophy, label: 'Badges' },
        { to: '/gamification/rewards', icon: Trophy, label: 'Rewards' },
      ],
    },
    {
      label: 'Reports',
      items: [
        { to: '/core/reports', icon: BarChart2, label: 'Reports' },
        ...(isAdmin ? [{ to: '/core/settings', icon: Settings, label: 'Settings' }] : []),
      ],
    },
  ];
}

function NavGroup({ group }) {
  const [open, setOpen] = useState(true);
  if (group.items.length === 0) return null;
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
      >
        {group.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="space-y-0.5">
          {group.items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200/60'
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { role, user, logout } = useAuth();
  const navGroups = buildNavGroups(role);

  return (
    <aside className="w-60 min-h-screen bg-surface-card border-r border-slate-200/80 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5 border-b border-slate-200/80">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold gradient-text">EcoSphere</span>
          <p className="text-[10px] text-slate-400 leading-none">ESG Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navGroups.map((g) => (
          <NavGroup key={g.label} group={g} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-200/80 text-xs text-slate-400 text-center">
        EcoSphere v1.0
      </div>

      {/* User Info + Logout */}
      <div className="px-3 py-3 border-t border-slate-700/50 space-y-2">
        {user && (
          <div className="px-2 py-1.5 text-xs">
            <div className="text-slate-600 font-medium truncate">{user.name}</div>
            <div className="text-slate-400 truncate">{user.role}</div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
