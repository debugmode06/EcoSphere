import { useState, useEffect } from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';
import { getGovernanceDashboard } from '../../../api/governanceApi';
import { Link } from 'react-router-dom';

export default function GovernanceAlerts() {
  const [stats, setStats] = useState(null);
  const [dismissedOverdue, setDismissedOverdue] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getGovernanceDashboard();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch governance alerts', err);
    }
  };

  if (!stats) return null;

  const hasOverdue = stats.overdueIssues > 0 && !dismissedOverdue;

  return (
    <div className="flex flex-col gap-2 mb-6">
      {hasOverdue && (
        <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-xl p-4 flex items-start shadow-sm animate-in slide-in-from-top-4 fade-in">
          <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-bold text-rose-800">Compliance Action Required</h3>
            <p className="text-sm text-rose-700 mt-1">
              You have <span className="font-bold">{stats.overdueIssues}</span> overdue compliance {stats.overdueIssues === 1 ? 'issue' : 'issues'}.
              Immediate resolution is required to prevent negative impacts on your governance score.
            </p>
            <div className="mt-2">
              <Link to="/governance/compliance" className="text-xs font-semibold text-rose-600 hover:text-rose-500 hover:underline">
                View Issues &rarr;
              </Link>
            </div>
          </div>
          <button
            onClick={() => setDismissedOverdue(true)}
            className="text-rose-400 hover:text-rose-600 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
