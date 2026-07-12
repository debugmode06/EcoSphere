import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getChallengeById,
  joinChallenge,
  submitProof,
  getParticipations,
  approveParticipation,
  rejectParticipation,
  getMyParticipations
} from '../../../api/gamificationApi';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Zap, Trophy, ShieldAlert, CheckCircle, XCircle, ExternalLink, Calendar, Plus } from 'lucide-react';

const DIFF_CLASS = {
  Easy: 'badge-green',
  Medium: 'badge-yellow',
  Hard: 'badge-red'
};

export default function ChallengeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [participation, setParticipation] = useState(null); // Current user's participation
  const [allParticipations, setAllParticipations] = useState([]); // All participations (for admins/managers)
  const [proofUrl, setProofUrl] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const challengeRes = await getChallengeById(id);
      setChallenge(challengeRes.data);

      if (role === 'EMPLOYEE') {
        const myParts = await getMyParticipations();
        const mine = myParts.data.find(p => String(p.challenge?._id || p.challenge) === String(id));
        setParticipation(mine || null);
      } else {
        const partRes = await getParticipations({ challengeId: id });
        if (partRes.data && partRes.data.length > 0) {
          const mine = partRes.data.find(p => p.employee?._id === user?._id || p.employee === user?._id);
          setParticipation(mine || null);
          setAllParticipations(partRes.data);
        } else {
          setParticipation(null);
          setAllParticipations([]);
        }
      }
    } catch (err) {
      setError('Failed to fetch details.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await joinChallenge(id);
      await loadDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join challenge');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (challenge.evidenceRequired && !proofUrl) {
      alert('Proof URL is required');
      return;
    }
    setSubmittingProof(true);
    try {
      await submitProof(id, { proofUrl });
      setProofUrl('');
      await loadDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleReview = async (participationId, status) => {
    if (!window.confirm(`Are you sure you want to mark this submission as ${status}?`)) return;
    setActionLoading(true);
    try {
      if (status === 'APPROVED') {
        await approveParticipation(participationId);
      } else {
        await rejectParticipation(participationId);
      }
      await loadDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Review submission failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const isAdminOrManager = role === 'ADMIN' || role === 'MANAGER';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-slate-400 font-semibold">{error || 'Challenge not found'}</p>
        <Link to="/gamification/challenges" className="btn-secondary inline-block">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/gamification/challenges" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="page-header">{challenge.title}</h2>
            <p className="page-subheader">{challenge.category?.name || 'Uncategorised'}</p>
          </div>
        </div>
        {role === 'ADMIN' && (
          <Link to={`/gamification/challenges/${challenge._id}/edit`} className="btn-secondary text-sm font-semibold">
            Edit Details
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className={role === 'EMPLOYEE' ? 'lg:col-span-2 space-y-6' : 'lg:col-span-3 space-y-6'}>
          <div className="card p-6 space-y-4 bg-white">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <span className={`${DIFF_CLASS[challenge.difficulty] || 'badge-yellow'} font-semibold text-xs`}>
                {challenge.difficulty} Difficulty
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Calendar className="w-4 h-4" />
                Due: {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : 'No deadline'}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Mission Description</h3>
              <p className="text-slate-750 leading-relaxed whitespace-pre-line">
                {challenge.description || 'No description provided.'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold text-slate-600">Completion Reward</span>
              </div>
              <span className="text-brand-700 font-extrabold text-lg flex items-center gap-1 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/50">
                <Zap className="w-5 h-5 fill-brand-600 stroke-none" />
                {challenge.xp} XP / pts
              </span>
            </div>

            {challenge.evidenceRequired && (
              <p className="text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200 p-3 rounded-lg">
                ⚠️ Verification Required: You must submit a valid URL of your photo or receipt as proof to complete this challenge.
              </p>
            )}
          </div>

          {/* Admin/Manager Submissions List */}
          {isAdminOrManager && (
            <div className="card p-6 space-y-4 bg-white">
              <h3 className="text-base font-bold text-slate-700">Employee Participations</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                      <th className="py-2 text-left">Employee</th>
                      <th className="py-2 text-left">Department</th>
                      <th className="py-2 text-left">Proof</th>
                      <th className="py-2 text-left">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allParticipations.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-450">
                          No participations yet
                        </td>
                      </tr>
                    ) : (
                      allParticipations.map((p) => (
                        <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3 font-semibold text-slate-700">
                            {p.employee?.name || 'Unknown'}
                            <p className="text-xs text-slate-400 font-medium">{p.employee?.email}</p>
                          </td>
                          <td className="py-3 text-slate-600 font-medium">
                            {p.employee?.department?.name || '—'}
                          </td>
                          <td className="py-3">
                            {p.proofUrl ? (
                              <a
                                href={p.proofUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 hover:text-brand-500 inline-flex items-center gap-1 underline text-xs font-semibold"
                              >
                                View Proof <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              p.approval === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                              p.approval === 'REJECTED' ? 'bg-rose-50 text-rose-750 border border-rose-200/50' :
                              'bg-amber-50 text-amber-700 border border-amber-200/50'
                            }`}>
                              {p.approval}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {p.approval === 'PENDING' && (role === 'ADMIN' || (role === 'MANAGER' && String(p.employee?.department?._id || p.employee?.department) === String(user?.department?._id || user?.department))) && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleReview(p._id, 'APPROVED')}
                                  disabled={actionLoading}
                                  className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleReview(p._id, 'REJECTED')}
                                  disabled={actionLoading}
                                  className="btn-danger py-1 px-2.5 text-xs flex items-center gap-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interaction Shell */}
        {role === 'EMPLOYEE' && (
          <div className="space-y-6">
            <div className="card p-6 bg-white border border-slate-200 shadow-md">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Your Progress</h3>

              {!participation ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Join this challenge to track progress, submit proof, and earn completion points!
                  </p>
                  {challenge.status === 'ACTIVE' ? (
                    <button
                      onClick={handleJoin}
                      disabled={actionLoading}
                      className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {actionLoading ? 'Joining...' : 'Join Challenge'}
                    </button>
                  ) : (
                    <button disabled className="btn-secondary w-full py-3 text-sm font-semibold cursor-not-allowed opacity-60">
                      Challenge Closed
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-450">Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      participation.approval === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      participation.approval === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {participation.approval}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-450">
                      <span>Progress</span>
                      <span>{participation.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${participation.progress}%` }}
                      />
                    </div>
                  </div>

                  {participation.approval === 'PENDING' && (
                    <form onSubmit={handleProofSubmit} className="space-y-3 pt-3 border-t border-slate-100" id="proof-form">
                      <div>
                        <label className="label text-xs" htmlFor="proofUrl">Evidence URL</label>
                        <input
                          id="proofUrl"
                          type="url"
                          className="input text-xs py-2 bg-slate-50 border-slate-200"
                          placeholder="https://imgur.com/yourphoto.png"
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                          required={challenge.evidenceRequired}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingProof}
                        className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {submittingProof ? 'Submitting...' : 'Submit Verification Proof'}
                      </button>
                    </form>
                  )}

                  {participation.approval === 'APPROVED' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-1">
                      <CheckCircle className="w-8 h-8 text-brand-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">Challenge Completed!</p>
                      <p className="text-xs text-brand-600 font-extrabold">+{participation.xpAwarded} XP Earned</p>
                    </div>
                  )}

                  {participation.approval === 'REJECTED' && (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-center space-y-1">
                      <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-750">Submission Rejected</p>
                      <p className="text-xs text-slate-550">Please review guidelines and try joining again or submit a new proof.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
