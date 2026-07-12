import { useState } from 'react';
import { X, Upload } from 'lucide-react';

export default function UploadProof({ participation, onUpload, onClose }) {
  const [proofDocument, setProofDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofDocument.trim()) return setError('Please enter a valid URL');
    setLoading(true);
    setError(null);
    try {
      await onUpload(participation._id, proofDocument.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay">
      <div className="card w-full max-w-md p-6 space-y-4 bg-surface">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upload Proof</h2>
            <p className="text-slate-500 text-sm mt-1">{participation.csrActivityId?.title || 'Activity'}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500">
          Enter the URL of your proof document (e.g., Google Drive, Dropbox, or cloud storage link).
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Document URL</label>
            <input
              type="url"
              className="input"
              value={proofDocument}
              onChange={(e) => setProofDocument(e.target.value)}
              placeholder="https://drive.google.com/file/..."
              required
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
              <Upload className="w-4 h-4" />
              {loading ? 'Uploading...' : 'Submit Proof'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
