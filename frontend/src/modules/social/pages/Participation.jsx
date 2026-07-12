import { useState } from 'react';
import { useMyParticipations } from '../hooks/useParticipations';
import UploadProof from '../components/UploadProof';
import { Upload, FileText } from 'lucide-react';

const STATUS_STYLE = {
  pending: 'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
};

export default function Participation() {
  const { participations, loading, error, uploadProof } = useMyParticipations();
  const [uploading, setUploading] = useState(null);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="page-header">My Participations</h1>
        <p className="page-subheader">Track your CSR activity submissions and approval status.</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading your participations...</div>
      ) : participations.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          You haven't joined any CSR activities yet. Visit <strong>CSR Activities</strong> to get started.
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Location</th>
                <th>Joined Date</th>
                <th>Proof</th>
                <th>Status</th>
                <th>Remarks</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participations.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="font-medium text-slate-100">{p.csrActivityId?.title || '—'}</div>
                    {p.csrActivityId?.evidenceRequired && (
                      <div className="text-xs text-yellow-400 mt-0.5">⚠️ Proof required</div>
                    )}
                  </td>
                  <td className="text-slate-300 text-sm">{p.csrActivityId?.location || '—'}</td>
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
                    <span className={STATUS_STYLE[p.status] || 'badge-blue'}>{p.status}</span>
                  </td>
                  <td className="text-slate-400 text-xs max-w-xs truncate">
                    {p.remarks || '—'}
                  </td>
                  <td className="text-right">
                    {p.status === 'pending' && (
                      <button
                        onClick={() => setUploading(p)}
                        className="text-brand-400 hover:text-brand-300 transition-colors p-1.5 inline-flex"
                        title="Upload Proof"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {uploading && (
        <UploadProof
          participation={uploading}
          onUpload={uploadProof}
          onClose={() => setUploading(null)}
        />
      )}
    </div>
  );
}
