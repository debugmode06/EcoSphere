import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getChallenges } from '../../../api/gamificationApi';
import { useAuth } from '../../../context/AuthContext';
import { Plus, Trophy, Calendar, Zap, Filter } from 'lucide-react';

const DIFF_CLASS = {
  Easy: 'badge-green',
  Medium: 'badge-yellow',
  Hard: 'badge-red'
};

const STATUS_CLASS = {
  DRAFT: 'bg-slate-100 text-slate-655 border border-slate-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-250/60',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border border-amber-250/60',
  COMPLETED: 'bg-sky-50 text-sky-700 border border-sky-250/60',
  ARCHIVED: 'bg-rose-50 text-rose-700 border border-rose-250/60'
};

export default function ChallengeList() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(role === 'EMPLOYEE' ? 'ACTIVE' : '');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  useEffect(() => {
    loadChallenges();
  }, [statusFilter, difficultyFilter]);

  const loadChallenges = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      const res = await getChallenges(params);
      setChallenges(res.data);
    } catch (err) {
      setError('Failed to fetch challenges.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-header">Sustainability Challenges</h2>
          <p className="page-subheader">Complete tasks, earn XP, and lead the leaderboard</p>
        </div>
        {role === 'ADMIN' && (
          <Link to="/gamification/challenges/create" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Challenge
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-center bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
          <Filter className="w-4 h-4" /> Filters:
        </div>

        {isAdminOrManager && (
          <div>
            <select
              className="input py-1.5 text-xs bg-white border border-slate-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        )}

        <div>
          <select
            className="input py-1.5 text-xs bg-white border border-slate-200"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-400 font-bold">
          Showing {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-center py-8">{error}</p>
      ) : challenges.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-slate-400">No challenges found</p>
          <p className="text-sm mt-1">Check back later or adjust your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c) => (
            <div
              key={c._id}
              onClick={() => navigate(`/gamification/challenges/${c._id}`)}
              className="card p-5 space-y-4 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-100/50 cursor-pointer transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-200/60">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="flex gap-2">
                    <span className={`${DIFF_CLASS[c.difficulty] || 'badge-yellow'} text-xs font-bold`}>
                      {c.difficulty}
                    </span>
                    {isAdminOrManager && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_CLASS[c.status] || 'bg-slate-100'}`}>
                        {c.status}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-600 line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {c.category?.name || 'Uncategorised'}
                  </p>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {c.deadline ? new Date(c.deadline).toLocaleDateString() : 'No deadline'}
                </div>
                <div className="flex items-center gap-1 text-sm text-brand-700 font-extrabold bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/50">
                  <Zap className="w-4 h-4 fill-brand-550 stroke-none" />
                  {c.xp} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
