import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyParticipations } from '../../../api/gamificationApi';
import { Trophy, Calendar, Zap, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';

const STATUS_ICONS = {
  PENDING: { icon: Clock, color: 'text-amber-400 bg-amber-950/40 border-amber-900/50' },
  APPROVED: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50' },
  REJECTED: { icon: XCircle, color: 'text-rose-400 bg-rose-950/40 border-rose-900/50' }
};

export default function MyChallenges() {
  const navigate = useNavigate();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyChallenges();
  }, []);

  const loadMyChallenges = async () => {
    setLoading(true);
    try {
      const res = await getMyParticipations();
      setParticipations(res.data);
    } catch (err) {
      setError('Failed to fetch your challenges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-header">My Challenges</h2>
        <p className="page-subheader">Track your joined challenges and verification history</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-center">{error}</p>
      ) : participations.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-slate-50 border border-slate-200">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-bold text-slate-700">You haven't joined any challenges yet</p>
          <p className="text-sm mt-1 text-slate-500">Head over to the active challenges catalog and start earning XP!</p>
          <button
            onClick={() => navigate('/gamification/challenges')}
            className="btn-primary mt-4 text-xs font-bold"
          >
            Explore Challenges
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {participations.map((p) => {
            const statusConfig = STATUS_ICONS[p.approval] || STATUS_ICONS.PENDING;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={p._id}
                onClick={() => navigate(`/gamification/challenges/${p.challenge?._id || p.challenge}`)}
                className="card p-4 hover:border-slate-350 hover:shadow-md cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl mt-1 border border-slate-200">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 line-clamp-1">{p.challenge?.title || 'Unknown Challenge'}</h3>
                    <p className="text-xs text-slate-500 font-bold">{p.challenge?.category?.name || 'Category'}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined: {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-brand-700 bg-brand-50 border border-brand-200/50 px-2 py-0.5 rounded-lg">
                    <Zap className="w-3.5 h-3.5 fill-brand-600 stroke-none" />
                    {p.challenge?.xp || 100} XP
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {p.approval}
                  </span>

                  <ChevronRight className="w-5 h-5 text-slate-400 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
