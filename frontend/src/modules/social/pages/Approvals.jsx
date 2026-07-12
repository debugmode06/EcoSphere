import { usePendingParticipations } from '../hooks/useParticipations';
import ApprovalTable from '../components/ApprovalTable';
import { ClipboardCheck } from 'lucide-react';

export default function Approvals() {
  const { participations, loading, error, approve, reject } = usePendingParticipations();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="page-header mb-0">Participation Approvals</h1>
          <p className="page-subheader mb-0">Review and approve or reject employee CSR participation submissions.</p>
        </div>
        <div className="ml-auto">
          {participations.length > 0 && (
            <span className="badge-yellow text-sm px-3 py-1">
              {participations.length} pending
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading approvals...</div>
      ) : (
        <ApprovalTable
          participations={participations}
          onApprove={approve}
          onReject={reject}
        />
      )}
    </div>
  );
}
