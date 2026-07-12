import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Plus, RefreshCw, CheckCircle2,
  Clock, AlertCircle, Search, Flame, ShieldAlert, XCircle, FileText
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { useAuth } from '../../../context/AuthContext';
import {
  getComplianceIssues,
  createComplianceIssue,
  resolveIssue,
  reviewIssue,
} from '../../../api/governanceApi';

// ─── Severity config ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  Critical: { cls: 'badge-red', icon: <Flame className="w-3 h-3" /> },
  High: { cls: 'badge-red', icon: <AlertTriangle className="w-3 h-3" /> },
  Medium: { cls: 'badge-yellow', icon: <AlertCircle className="w-3 h-3" /> },
  Low: { cls: 'badge-blue', icon: <ShieldAlert className="w-3 h-3" /> },
};

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Medium;
  return (
    <span className={`inline-flex items-center gap-1 ${cfg.cls}`}>
      {cfg.icon}
      {severity}
    </span>
  );
}

// ─── Overdue indicator ────────────────────────────────────────────────────────
function OverdueIndicator({ issue }) {
  if (!issue.isOverdue) return null;
  const days = issue.daysOverdue || (() => {
    const today = new Date(); today.setHours(0,0,0,0);
    return Math.max(0, Math.ceil((today - new Date(issue.dueDate)) / 86400000));
  })();

  return (
    <span className="inline-flex items-center gap-1 badge-red pulse-glow ml-1">
      <Clock className="w-3 h-3" />
      {days}d overdue
    </span>
  );
}

// ─── Log Issue Modal ──────────────────────────────────────────────────────────
function CreateIssueModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    description: '',
    severity: 'Medium',
    owner: '',
    dueDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.owner.trim()) { setError('Owner is required (Business Rule)'); return; }
    if (!form.dueDate) { setError('Due date is required (Business Rule)'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await createComplianceIssue(form);
      onCreated(res.data.issue);
      setForm({ description: '', severity: 'Medium', owner: '', dueDate: '' });
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to log issue';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Log Compliance Issue">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="iss-desc">Description *</label>
          <textarea
            id="iss-desc"
            className="input resize-none"
            rows={4}
            placeholder="Describe the compliance issue in detail..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="iss-severity">Severity *</label>
          <select
            id="iss-severity"
            className="input"
            value={form.severity}
            onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
          >
            {['Low', 'Medium', 'High', 'Critical'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="iss-owner">
            Owner *
            <span className="ml-1 text-xs text-slate-500 font-normal">(Business Rule: required)</span>
          </label>
          <input
            id="iss-owner"
            className="input"
            placeholder="e.g. Manager One, Compliance Officer"
            value={form.owner}
            onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="iss-due">
            Due Date *
            <span className="ml-1 text-xs text-slate-500 font-normal">(Business Rule: required)</span>
          </label>
          <input
            id="iss-due"
            type="date"
            className="input"
            value={form.dueDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            required
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Logging...' : 'Log Issue'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Resolve Modal ────────────────────────────────────────────────────────────
function ResolveModal({ open, onClose, issue, onResolved }) {
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await resolveIssue(issue._id, {
        resolutionNotes: notes,
        resolutionProofUrl: proofUrl
      });
      onResolved(res.data.issue);
      setNotes('');
      setProofUrl('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve issue');
    } finally {
      setSaving(false);
    }
  };

  if (!issue) return null;

  return (
    <Modal open={open} onClose={onClose} title="Resolve Compliance Issue">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Issue</p>
          <p className="text-slate-800 text-sm">{issue.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <SeverityBadge severity={issue.severity} />
            <span className="text-slate-500 text-xs">Owner: {issue.owner}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="res-notes">Resolution Notes</label>
            <textarea
              id="res-notes"
              className="input resize-none"
              rows={3}
              placeholder="Describe how the issue was resolved..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="res-proof">Resolution Proof URL (e.g. proof document link)</label>
            <input
              id="res-proof"
              type="url"
              className="input"
              placeholder="https://example.com/resolution-proof.pdf"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {saving ? 'Submitting...' : 'Submit Resolution'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ open, onClose, issue, onReviewed }) {
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleReview = async (status) => {
    setSaving(true);
    setError('');
    try {
      const res = await reviewIssue(issue._id, { status, feedback });
      onReviewed(res.data.issue);
      setFeedback('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  if (!issue) return null;

  return (
    <Modal open={open} onClose={onClose} title="Review Compliance Resolution">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm space-y-2 shadow-sm">
          <p><strong className="text-slate-700">Issue:</strong> {issue.description}</p>
          <p><strong className="text-slate-700">Resolution Notes:</strong> {issue.resolutionNotes || 'None'}</p>
          {issue.resolutionProofUrl && (
            <p>
              <strong className="text-slate-700">Proof URL:</strong>{' '}
              <a href={issue.resolutionProofUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline font-medium">
                {issue.resolutionProofUrl}
              </a>
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="rev-feedback">Reviewer Feedback / Comments</label>
          <textarea
            id="rev-feedback"
            className="input resize-none"
            rows={3}
            placeholder="Add any feedback or reasons for rejection/approval..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleReview('RESOLVED')}
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve & Resolve
          </button>
          <button
            onClick={() => handleReview('OPEN')}
            disabled={saving}
            className="bg-red-600 hover:bg-red-500 text-white rounded-xl flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <XCircle className="w-4 h-4" /> Reject & Re-open
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Issue Row ────────────────────────────────────────────────────────────────
function IssueRow({ issue, userRole, onResolve, onReview }) {
  const canResolve = userRole === 'MANAGER' && issue.status === 'OPEN';
  const canReview = userRole === 'ADMIN' && issue.status === 'PENDING_REVIEW';

  return (
    <tr className="hover:bg-slate-50/50">
      <td className="max-w-xs">
        <div className="space-y-1">
          <p className="text-slate-800 text-sm leading-snug">{issue.description}</p>
          {issue.audit && (
            <p className="text-slate-500 text-xs font-medium">
              Audit: {issue.audit?.title || 'N/A'}
            </p>
          )}
        </div>
      </td>
      <td>
        <SeverityBadge severity={issue.severity} />
      </td>
      <td>
        <span className="text-slate-700 text-sm font-medium">{issue.owner}</span>
      </td>
      <td>
        <div className="space-y-1">
          <p className="text-slate-600 text-sm font-medium">
            {new Date(issue.dueDate).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
          <OverdueIndicator issue={issue} />
        </div>
      </td>
      <td>
        {issue.status === 'RESOLVED' && (
          <span className="badge-green inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </span>
        )}
        {issue.status === 'PENDING_REVIEW' && (
          <span className="badge-blue inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        )}
        {issue.status === 'OPEN' && (
          <span className="badge-yellow inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Open
          </span>
        )}
      </td>
      <td>
        {canResolve && (
          <button
            id={`resolve-${issue._id}`}
            onClick={() => onResolve(issue)}
            className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
            Resolve
          </button>
        )}
        {canReview && (
          <button
            id={`review-${issue._id}`}
            onClick={() => onReview(issue)}
            className="btn-primary text-xs py-1 px-3 flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            Review
          </button>
        )}
        {issue.status === 'RESOLVED' && issue.resolutionNotes && (
          <span className="text-xs text-slate-500 italic">{issue.resolutionNotes.slice(0, 40)}…</span>
        )}
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompliancePage() {
  const { role } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [reviewingIssue, setReviewingIssue] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const canCreate = role === 'ADMIN';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getComplianceIssues();
      setIssues(res.data.issues || []);
    } catch {
      setError('Failed to load compliance issues.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role !== 'EMPLOYEE') {
      load();
    }
  }, [load, role]);

  if (role === 'EMPLOYEE') {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <div className="card p-12 bg-white border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold">Access Denied</p>
          <p className="text-slate-500 text-sm mt-1">You do not have permission to view compliance issues.</p>
        </div>
      </div>
    );
  }

  // Filter logic
  const filtered = issues.filter((iss) => {
    const matchStatus = statusFilter === 'ALL' || iss.status === statusFilter;
    const matchSeverity = severityFilter === 'All' || iss.severity === severityFilter;
    const matchSearch = iss.description.toLowerCase().includes(search.toLowerCase())
      || iss.owner.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSeverity && matchSearch;
  });

  // KPIs
  const openCount = issues.filter((i) => i.status === 'OPEN').length;
  const pendingCount = issues.filter((i) => i.status === 'PENDING_REVIEW').length;
  const overdueCount = issues.filter((i) => i.isOverdue).length;
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;
  const criticalCount = issues.filter((i) => i.severity === 'Critical' && i.status === 'OPEN').length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-slate-600 text-slate-200 px-4 py-3 rounded-xl shadow-2xl text-sm animate-in slide-in-from-top-2 duration-200">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            Compliance Issues
          </h1>
          <p className="page-subheader">
            Track, manage, and resolve governance compliance violations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="refresh-compliance"
            onClick={load}
            className="btn-secondary flex items-center gap-2 text-sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {canCreate && (
            <button
              id="log-issue-btn"
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Log Issue
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="card px-4 py-3 text-center bg-white border border-slate-200">
          <p className="text-2xl font-bold text-yellow-600">{openCount}</p>
          <p className="text-slate-500 text-xs mt-0.5">Open Issues</p>
        </div>
        <div className="card px-4 py-3 text-center bg-white border border-slate-200">
          <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
          <p className="text-slate-500 text-xs mt-0.5">Pending Review</p>
        </div>
        <div className="card px-4 py-3 text-center bg-white border border-slate-200">
          <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600 pulse-glow' : 'text-slate-500'}`}>
            {overdueCount}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">Overdue</p>
        </div>
        <div className="card px-4 py-3 text-center bg-white border border-slate-200">
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-slate-500 text-xs mt-0.5">Critical Open</p>
        </div>
        <div className="card px-4 py-3 text-center bg-white border border-slate-200">
          <p className="text-2xl font-bold text-brand-600">{resolvedCount}</p>
          <p className="text-slate-500 text-xs mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {overdueCount > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>
            <strong>{overdueCount} issue{overdueCount > 1 ? 's are' : ' is'} overdue.</strong>{' '}
            Immediate attention required. Filter by "Open" to view.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Status tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200 shadow-sm flex-wrap">
          {[['ALL', 'All'], ['OPEN', 'Open'], ['PENDING_REVIEW', 'Pending Review'], ['RESOLVED', 'Resolved']].map(([val, label]) => (
            <button
              key={val}
              id={`compliance-status-${val.toLowerCase()}`}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                statusFilter === val
                  ? 'bg-white text-yellow-600 border border-slate-200 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Severity filter */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200 shadow-sm flex-wrap">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => (
            <button
              key={s}
              id={`sev-${s.toLowerCase()}`}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                severityFilter === s
                  ? 'bg-white text-slate-800 border border-slate-200 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="compliance-search"
            className="input pl-9 text-sm"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 border-red-200 bg-red-50 text-red-700 text-sm mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper border border-slate-200 bg-white shadow-sm">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Severity</th>
              <th>Owner</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j}>
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">No compliance issues found</p>
                </td>
              </tr>
            ) : (
              filtered.map((iss) => (
                <IssueRow
                  key={iss._id}
                  issue={iss}
                  userRole={role}
                  onResolve={setResolvingIssue}
                  onReview={setReviewingIssue}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CreateIssueModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(issue) => {
          setIssues((prev) => [issue, ...prev]);
          showToast('✅ Compliance issue logged successfully!');
        }}
      />
      <ResolveModal
        open={!!resolvingIssue}
        issue={resolvingIssue}
        onClose={() => setResolvingIssue(null)}
        onResolved={(updated) => {
          setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
          setResolvingIssue(null);
          showToast('✅ Resolution submitted for review!');
        }}
      />
      <ReviewModal
        open={!!reviewingIssue}
        issue={reviewingIssue}
        onClose={() => setReviewingIssue(null)}
        onReviewed={(updated) => {
          setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
          setReviewingIssue(null);
          showToast('✅ Review submitted successfully!');
        }}
      />
    </div>
  );
}
