import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getParticipations, approveParticipation, rejectParticipation } from '../../../api/gamificationApi';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle, XCircle, ExternalLink, ShieldAlert, Zap, Loader2 } from 'lucide-react';

export default function ParticipationReview() {
  const { user, role } = useAuth();
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect route client-side: Admin/Manager only
  if (role && role !== 'ADMIN' && role !== 'MANAGER') {
    return <Navigate to="/gamification/challenges" replace />;
  }

  useEffect(() => {
    loadPendingParticipations();
  }, []);

  const loadPendingParticipations = async () => {
    setLoading(true);
    setError('');
    try {
      // Query participations that are PENDING
      const res = await getParticipations({ approval: 'PENDING' });
      setParticipations(res.data || []);
    } catch (err) {
      setError('Failed to fetch pending challenge submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this submission?`)) return;
    setActionLoading(true);
    try {
      if (status === 'APPROVED') {
        await approveParticipation(id);
      } else {
        await rejectParticipation(id);
      }
      await loadPendingParticipations();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-header">Challenge Participations</h2>
        <p className="page-subheader">
          Review and approve verification proof submitted by employees for their sustainability actions.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <div className="card p-6 bg-white border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span>Pending Submissions</span>
          <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-extrabold border border-brand-200/40">
            {participations.length} total
          </span>
        </h3>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading submissions...</span>
          </div>
        ) : participations.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
            <p className="text-sm font-bold text-slate-600">All caught up!</p>
            <p className="text-xs">No pending challenge participations need review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                  <th className="py-2.5 text-left">Employee</th>
                  <th className="py-2.5 text-left">Department</th>
                  <th className="py-2.5 text-left">Challenge</th>
                  <th className="py-2.5 text-left font-bold">Reward</th>
                  <th className="py-2.5 text-left">Proof</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participations.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3.5 font-semibold text-slate-700">
                      {p.employee?.name || 'Unknown'}
                      <p className="text-xs text-slate-400 font-medium">{p.employee?.email}</p>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">
                      {p.employee?.department?.name || '—'}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-750">
                      {p.challenge ? (
                        <Link
                          to={`/gamification/challenges/${p.challenge._id || p.challenge}`}
                          className="hover:text-brand-600 underline"
                        >
                          {p.challenge.title || 'Unknown Challenge'}
                        </Link>
                      ) : (
                        <span className="text-slate-400">Unknown Challenge</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-0.5 text-brand-600 font-bold bg-brand-50/50 px-2 py-0.5 rounded border border-brand-200/30 text-xs">
                        <Zap className="w-3 h-3 fill-brand-600 stroke-none" />
                        {p.challenge?.xp || 100} XP
                      </span>
                    </td>
                    <td className="py-3.5">
                      {p.proofUrl ? (
                        <a
                          href={p.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:text-brand-500 inline-flex items-center gap-1 underline text-xs font-bold"
                        >
                          View Proof <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleReview(p._id, 'APPROVED')}
                          disabled={actionLoading}
                          className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 font-bold shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReview(p._id, 'REJECTED')}
                          disabled={actionLoading}
                          className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1 font-bold shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
