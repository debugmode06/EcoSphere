import { useState } from 'react';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

function RemarksModal({ title, onConfirm, onClose, actionLabel, actionClass }) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(remarks);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay">
      <div className="card w-full max-w-sm p-6 space-y-4 bg-surface">
        <h3 className="font-bold text-slate-100">{title}</h3>
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-3 py-2 rounded-xl">
            {error}
          </div>
        )}
        <div>
          <label className="label">Remarks (optional)</label>
          <textarea
            className="input h-20 resize-none"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add a comment..."
            disabled={loading}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={actionClass} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processing...' : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  pending: 'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
};

export default function ApprovalTable({ participations, onApprove, onReject }) {
  const [modal, setModal] = useState(null); // { type: 'approve'|'reject', id }

  if (participations.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-400">
        No pending participations to review.
      </div>
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Activity</th>
              <th>Joined</th>
              <th>Proof</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participations.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="font-medium text-slate-100">{p.employeeId?.name || '—'}</div>
                  <div className="text-xs text-slate-400">{p.employeeId?.email}</div>
                </td>
                <td className="text-slate-200">{p.csrActivityId?.title || '—'}</td>
                <td className="text-slate-400 text-xs">{new Date(p.joinedDate).toLocaleDateString()}</td>
                <td>
                  {p.proofDocument ? (
                    <a href={p.proofDocument} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                      <FileText className="w-3.5 h-3.5" /> View
                    </a>
                  ) : (
                    <span className="text-slate-500 text-xs italic">None</span>
                  )}
                </td>
                <td>
                  <span className={STATUS_BADGE[p.status] || 'badge-blue'}>{p.status}</span>
                </td>
                <td className="text-right">
                  {p.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ type: 'approve', id: p._id })}
                        className="text-brand-400 hover:text-brand-300 transition-colors p-1.5"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setModal({ type: 'reject', id: p._id })}
                        className="text-red-400 hover:text-red-300 transition-colors p-1.5"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === 'approve' && (
        <RemarksModal
          title="Approve Participation"
          actionLabel="Approve"
          actionClass="btn-primary"
          onConfirm={(remarks) => onApprove(modal.id, remarks)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'reject' && (
        <RemarksModal
          title="Reject Participation"
          actionLabel="Reject"
          actionClass="btn-danger"
          onConfirm={(remarks) => onReject(modal.id, remarks)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
