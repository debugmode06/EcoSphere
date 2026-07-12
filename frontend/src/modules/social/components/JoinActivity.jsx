import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function JoinActivity({ activity, onJoin, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      await onJoin(activity._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to join activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay">
      <div className="card w-full max-w-md p-6 space-y-4 bg-surface">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Join Activity</h2>
            <p className="text-slate-400 text-sm mt-1">{activity.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Category</span>
            <span className="text-slate-200">{activity.categoryId?.name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Location</span>
            <span className="text-slate-200">{activity.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Dates</span>
            <span className="text-slate-200">
              {new Date(activity.startDate).toLocaleDateString()} — {new Date(activity.endDate).toLocaleDateString()}
            </span>
          </div>
          {activity.evidenceRequired && (
            <div className="mt-2 flex items-center gap-2 text-yellow-300 text-xs bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-2">
              ⚠️ Proof document will be required for approval
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary flex items-center gap-2" onClick={handleJoin} disabled={loading}>
            <UserPlus className="w-4 h-4" />
            {loading ? 'Joining...' : 'Confirm Join'}
          </button>
        </div>
      </div>
    </div>
  );
}
