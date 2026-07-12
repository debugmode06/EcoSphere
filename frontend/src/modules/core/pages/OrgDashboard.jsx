import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axiosClient from '../../../api/axiosClient';
import { Leaf, Users, ShieldAlert, Award, TrendingUp, Activity, BarChart2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function OrgDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosClient.get('/core/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load dashboard</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Organization Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of EcoSphere ESG metrics</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall ESG Score</span>
            <span className="text-2xl font-black text-brand-600 leading-none">{data.scores.total}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex gap-3">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block">Env</span>
              <span className="font-bold text-emerald-600">{data.scores.E}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block">Soc</span>
              <span className="font-bold text-blue-600">{data.scores.S}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block">Gov</span>
              <span className="font-bold text-purple-600">{data.scores.G}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-white border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="badge-green text-xs">Total</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Emissions</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.metrics.totalEmissions.toLocaleString()} <span className="text-sm text-slate-400 font-normal">kgCO2e</span></h3>
        </div>

        <div className="card p-5 bg-white border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="badge-blue text-xs">Active</span>
          </div>
          <p className="text-sm font-medium text-slate-500">CSR Participations</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.metrics.totalParticipations}</h3>
        </div>

        <div className="card p-5 bg-white border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="badge-yellow text-xs">Action Required</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Open Compliance Issues</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.metrics.openIssues}</h3>
        </div>

        <div className="card p-5 bg-white border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <span className="badge-purple text-xs">Gamification</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Active Goals & CSR</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.metrics.activeGoals + data.metrics.activeCSR}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 bg-white border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-500" />
              ESG Overview
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Environmental', score: data.scores.E, fullMark: 100 },
                { subject: 'Social', score: data.scores.S, fullMark: 100 },
                { subject: 'Governance', score: data.scores.G, fullMark: 100 }
              ]}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="ESG Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-0 bg-white border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              Top Performers
            </h3>
            <p className="text-xs text-slate-500 mt-1">Leaderboard based on XP earned</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {data.leaderboard.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No active employees yet.</div>
            ) : (
              <div className="space-y-1">
                {data.leaderboard.map((emp, index) => (
                  <div key={emp._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{emp.department?.name || emp.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md">
                      <Award className="w-3 h-3" />
                      <span className="text-xs font-bold">{emp.xp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
