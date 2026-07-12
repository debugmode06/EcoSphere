import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Org Dashboard',
  '/environmental/emissions': 'Carbon Emissions',
  '/environmental/goals': 'Environmental Goals',
  '/social/activities': 'CSR Activities',
  '/social/participations': 'Participations',
  '/governance/policies': 'ESG Policies',
  '/governance/audits': 'Audits',
  '/governance/compliance': 'Compliance Issues',
  '/gamification/challenges': 'Challenges',
  '/gamification/challenges/create': 'Create Challenge',
  '/gamification/my-challenges': 'My Challenges',
  '/gamification/badges': 'Badges',
  '/gamification/rewards': 'Reward Store',
  '/gamification/rewards/history': 'Redemption History',
  '/gamification/leaderboard': 'Leaderboard Rankings',
  '/core/reports': 'Reports',
  '/core/settings': 'Settings',
};

export default function AppShell({ children }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'EcoSphere';

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
