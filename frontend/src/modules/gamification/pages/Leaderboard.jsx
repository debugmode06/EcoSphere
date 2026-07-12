import { useState, useEffect } from 'react';
import { getLeaderboardOrg, getLeaderboardDept, getLeaderboardMonthly, getLeaderboardYearly } from '../../../api/gamificationApi';
import { useAuth } from '../../../context/AuthContext';
import { Trophy, Users, Calendar, Zap, Star } from 'lucide-react';

const TABS = [
  { id: 'org', label: 'Organization', icon: Trophy },
  { id: 'dept', label: 'My Department', icon: Users },
  { id: 'monthly', label: 'Monthly', icon: Calendar },
  { id: 'yearly', label: 'Yearly', icon: Star }
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('org');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (activeTab === 'org') {
        res = await getLeaderboardOrg();
      } else if (activeTab === 'dept') {
        const deptId = user?.department?._id || user?.department;
        if (!deptId) {
          setList([]);
          setLoading(false);
          return;
        }
        res = await getLeaderboardDept(deptId);
      } else if (activeTab === 'monthly') {
        res = await getLeaderboardMonthly();
      } else if (activeTab === 'yearly') {
        res = await getLeaderboardYearly();
      }
      setList(res?.data || []);
    } catch (err) {
      setError('Failed to fetch leaderboard rankings.');
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index) => {
    if (index === 0) return 'text-yellow-750 bg-yellow-50 border-yellow-250';
    if (index === 1) return 'text-slate-600 bg-slate-50 border-slate-200';
    if (index === 2) return 'text-orange-700 bg-orange-50 border-orange-250';
    return 'text-slate-550 bg-slate-50 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-header">EcoSphere Leaderboard</h2>
        <p className="page-subheader">Top sustainability champions ranking by XP and achievements</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all duration-150 ${
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table/List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-center">{error}</p>
      ) : list.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-slate-50 border border-slate-200">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-bold text-slate-700">No rankings data available</p>
          <p className="text-sm mt-1 text-slate-500">Start completing challenges to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="card bg-white border border-slate-200 p-4 space-y-3 shadow-md">
          {list.map((row, index) => {
            // Aggregation format differs slightly from direct Employee lists
            const name = row.employeeDetails ? row.employeeDetails.name : row.name;
            const email = row.employeeDetails ? row.employeeDetails.email : row.email;
            const deptName = row.deptDetails ? row.deptDetails.name : (row.department?.name || 'Operations');
            const xp = row.xpEarned !== undefined ? row.xpEarned : row.xp;
            const isSelf = email === user?.email;

            return (
              <div
                key={row._id || index}
                className={`p-4 rounded-xl flex items-center justify-between border transition-all duration-200 ${
                  isSelf
                    ? 'border-brand-300 bg-brand-50/40 shadow-sm shadow-brand-100/50'
                    : 'border-slate-150 bg-white hover:border-slate-350'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank circle badge */}
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl border font-bold text-sm ${getRankStyle(index)}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                      {name}
                      {isSelf && (
                        <span className="text-[9px] font-black tracking-widest text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/50">
                          YOU
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">{deptName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {row.challengeCount !== undefined && (
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-slate-655 font-bold">{row.challengeCount} Challenges</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Completed</p>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 font-bold text-xs text-brand-700 bg-brand-50 border border-brand-200/50 px-3 py-1.5 rounded-lg flex-shrink-0">
                    <Zap className="w-4 h-4 fill-brand-600 stroke-none" />
                    {xp} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
