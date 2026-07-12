import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from '../layout/AppShell';

// Auth
import LoginPage from '../modules/auth/pages/LoginPage';

// Core
import OrgDashboard from '../modules/core/pages/OrgDashboard';
import Reports from '../modules/core/pages/Reports';
import Settings from '../modules/core/pages/Settings';

// Environmental
import EmissionsPage from '../modules/environmental/pages/EmissionsPage';
import GoalsPage from '../modules/environmental/pages/GoalsPage';

// Social
import ActivitiesPage from '../modules/social/pages/ActivitiesPage';
import ParticipationPage from '../modules/social/pages/ParticipationPage';

// Governance
import PoliciesPage from '../modules/governance/pages/PoliciesPage';
import AuditsPage from '../modules/governance/pages/AuditsPage';
import CompliancePage from '../modules/governance/pages/CompliancePage';

// Gamification
import ChallengesPage from '../modules/gamification/pages/ChallengesPage';
import BadgesPage from '../modules/gamification/pages/BadgesPage';
import RewardsPage from '../modules/gamification/pages/RewardsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

export default function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

        <Route path="/dashboard" element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>} />
        <Route path="/core/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/core/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="/environmental/emissions" element={<ProtectedRoute><EmissionsPage /></ProtectedRoute>} />
        <Route path="/environmental/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />

        <Route path="/social/activities" element={<ProtectedRoute><ActivitiesPage /></ProtectedRoute>} />
        <Route path="/social/participations" element={<ProtectedRoute><ParticipationPage /></ProtectedRoute>} />

        <Route path="/governance/policies" element={<ProtectedRoute><PoliciesPage /></ProtectedRoute>} />
        <Route path="/governance/audits" element={<ProtectedRoute><AuditsPage /></ProtectedRoute>} />
        <Route path="/governance/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />

        <Route path="/gamification/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
        <Route path="/gamification/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
        <Route path="/gamification/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
