import { useState, useEffect } from 'react';
import {
  ShieldCheck, FileText, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, Activity, BarChart2, Calendar
} from 'lucide-react';
import { getGovernanceDashboard, getGovernanceScore, getDeptLeaderboard } from '../../../api/governanceApi';
import GovernanceAlerts from '../components/GovernanceAlerts';

export default function GovernanceDashboard() {
  const [stats, setStats] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getGovernanceDashboard(),
      getGovernanceScore(),
      getDeptLeaderboard()
    ]).then(([statsRes, scoreRes, leaderRes]) => {
      setStats(statsRes.data.stats);
      setScoreData(scoreRes.data);
      setLeaderboard(leaderRes.data.leaderboard || []);
    }).catch(err => {
      console.error('Failed to load dashboard data', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const scoreColor = 
    scoreData?.score >= 90 ? 'text-emerald-500' :
    scoreData?.score >= 75 ? 'text-blue-500' :
    scoreData?.score >= 60 ? 'text-amber-500' : 'text-rose-500';

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - ((scoreData?.score || 0) / 100) * circumference;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Governance Dashboard</h1>
        <p className="page-subheader">Enterprise overview of policies, audits, and compliance.</p>
      </div>

      <GovernanceAlerts />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Org Governance Score</h2>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke="currentColor" strokeWidth="8"
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${scoreColor}`}
                style={{ strokeDasharray: circumference, strokeDashoffset }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4xl font-black tracking-tight ${scoreColor}`}>
                {scoreData?.score || 0}
              </span>
              <span className="text-sm font-semibold text-slate-500 mt-1">{scoreData?.grade || 'N/A'}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 w-full text-xs font-medium text-slate-500">
            <div><span className="block text-slate-800 text-sm font-bold">{scoreData?.breakdown?.policyScore}%</span>Policies</div>
            <div><span className="block text-slate-800 text-sm font-bold">{scoreData?.breakdown?.auditScore}%</span>Audits</div>
            <div><span className="block text-slate-800 text-sm font-bold">{scoreData?.breakdown?.complianceScore}%</span>Compliance</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="stat-card flex-col gap-2">
            <div className="stat-icon bg-brand-50 text-brand-600"><FileText className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Policies</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.totalPolicies || 0}</h3>
            </div>
          </div>
          <div className="stat-card flex-col gap-2">
            <div className="stat-icon bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Published Policies</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.publishedPolicies || 0}</h3>
            </div>
          </div>
          <div className="stat-card flex-col gap-2">
            <div className="stat-icon bg-blue-50 text-blue-600"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed Audits</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.completedAudits || 0} / {stats?.totalAudits || 0}</h3>
            </div>
          </div>
          <div className="stat-card flex-col gap-2">
            <div className="stat-icon bg-purple-50 text-purple-600"><Activity className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Audit Completion</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.auditCompletionRate || 0}%</h3>
            </div>
          </div>
          <div className="stat-card flex-col gap-2">
            <div className="stat-icon bg-amber-50 text-amber-600"><AlertTriangle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Open Issues</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats?.openIssues || 0}</h3>
            </div>
          </div>
          <div className="stat-card flex-col gap-2">
            <div className="stat-icon bg-rose-50 text-rose-600"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Overdue Issues</p>
              <h3 className="text-2xl font-bold text-rose-600">{stats?.overdueIssues || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-500" />
            Department Leaderboard
          </h2>
          <div className="space-y-4">
            {leaderboard.map((dept, idx) => (
              <div key={dept._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{dept.name}</p>
                    <p className="text-xs text-slate-500">{dept.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 text-lg">{dept.score}</span>
                  <span className="text-xs text-slate-500 ml-1">pts</span>
                  <p className="text-xs font-medium text-slate-500">{dept.grade}</p>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="text-center text-slate-500 py-4">No department data available.</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">Data Privacy Audit Completed</p>
                <p className="text-xs text-slate-500 mt-0.5">IT Department — Score updated</p>
                <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">New Policy Published</p>
                <p className="text-xs text-slate-500 mt-0.5">Anti-Corruption & Bribery v2.0</p>
                <p className="text-xs text-slate-400 mt-1">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-rose-800 text-sm">Compliance Issue Overdue</p>
                <p className="text-xs text-rose-600 mt-0.5">Missing vendor security assessment</p>
                <p className="text-xs text-rose-400 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
