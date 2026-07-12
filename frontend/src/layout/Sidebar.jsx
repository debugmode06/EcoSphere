import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Leaf, Users, ShieldCheck, Trophy,
  BarChart2, Settings, ChevronDown, Globe
} from 'lucide-react';
import { useState } from 'react';

const navGroups = [
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
      { to: '/social/activities', icon: Users, label: 'CSR Activities' },
      { to: '/social/participations', icon: Users, label: 'Participations' },
    ],
  },
  {
    label: 'Governance',
    items: [
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
      { to: '/core/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

function NavGroup({ group }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-400 transition-colors"
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
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
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
  return (
    <aside className="w-60 min-h-screen bg-surface-card border-r border-slate-700/50 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5 border-b border-slate-700/50">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-700 rounded-lg flex items-center justify-center">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold gradient-text">EcoSphere</span>
          <p className="text-[10px] text-slate-500 leading-none">ESG Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navGroups.map((g) => (
          <NavGroup key={g.label} group={g} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-700/50 text-xs text-slate-600 text-center">
        EcoSphere v1.0
      </div>
    </aside>
  );
}
