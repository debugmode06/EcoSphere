import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, RefreshCw, FileSearch,
  Calendar, Building2, AlertCircle, CheckCircle2,
  Clock, XCircle, ChevronDown
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useAuth } from '../../../context/AuthContext';
import { getAudits, createAudit, updateAudit } from '../../../api/governanceApi';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const auditStatusVariant = (s) => {
  if (s === 'Completed') return 'green';
  if (s === 'In Progress') return 'blue';
  if (s === 'Scheduled') return 'yellow';
  if (s === 'Cancelled') return 'red';
  return 'yellow';
};

const auditStatusIcon = (s) => {
  if (s === 'Completed') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (s === 'In Progress') return <Clock className="w-3.5 h-3.5" />;
  if (s === 'Cancelled') return <XCircle className="w-3.5 h-3.5" />;
  return <Calendar className="w-3.5 h-3.5" />;
};

const AUDIT_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

// ─── Create Audit Modal ───────────────────────────────────────────────────────
function CreateAuditModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', date: '', findings: '', status: 'Scheduled' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.date) { setError('Date is required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await createAudit(form);
      onCreated(res.data.audit);
      setForm({ title: '', date: '', findings: '', status: 'Scheduled' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create audit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule New Audit">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="aud-title">Audit Title *</label>
          <input
            id="aud-title"
            className="input"
            placeholder="e.g. Q1 Environmental Compliance Audit"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="aud-date">Audit Date *</label>
          <input
            id="aud-date"
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="aud-status">Initial Status</label>
          <select
            id="aud-status"
            className="input"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {AUDIT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="aud-findings">Findings (optional)</label>
          <textarea
            id="aud-findings"
            className="input resize-none"
            rows={3}
            placeholder="Initial findings or scope notes..."
            value={form.findings}
            onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))}
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Creating...' : 'Schedule Audit'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Update Audit Modal ───────────────────────────────────────────────────────
function UpdateAuditModal({ open, onClose, audit, onUpdated }) {
  const [form, setForm] = useState({ status: '', findings: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (audit) {
      setForm({ status: audit.status || 'Scheduled', findings: audit.findings || '' });
    }
  }, [audit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await updateAudit(audit._id, form);
      onUpdated(res.data.audit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update audit');
    } finally {
      setSaving(false);
    }
  };

  if (!audit) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Update: ${audit.title}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="upd-status">Status</label>
          <select
            id="upd-status"
            className="input"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {AUDIT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="upd-findings">Findings / Notes</label>
          <textarea
            id="upd-findings"
            className="input resize-none"
            rows={5}
            placeholder="Document audit findings, observations, and recommendations..."
            value={form.findings}
            onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))}
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Update Audit'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Audit Row ────────────────────────────────────────────────────────────────
function AuditRow({ audit, canEdit, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <td>
          <div className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${expanded ? '' : '-rotate-90'}`}
            />
            <span className="font-medium text-slate-200 text-sm">{audit.title}</span>
          </div>
        </td>
        <td>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Building2 className="w-3.5 h-3.5" />
            {audit.department?.name || <span className="text-slate-600 italic">All Depts</span>}
          </div>
        </td>
        <td>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(audit.date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>
        </td>
        <td>
          <span className={`inline-flex items-center gap-1.5 ${auditStatusVariant(audit.status) === 'green' ? 'badge-green' : auditStatusVariant(audit.status) === 'blue' ? 'badge-blue' : auditStatusVariant(audit.status) === 'red' ? 'badge-red' : 'badge-yellow'}`}>
            {auditStatusIcon(audit.status)}
            {audit.status}
          </span>
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <button
              id={`edit-audit-${audit._id}`}
              onClick={() => onEdit(audit)}
              className="btn-secondary text-xs py-1 px-3"
            >
              Update
            </button>
          )}
        </td>
      </tr>
      {/* Expanded findings row */}
      {expanded && audit.findings && (
        <tr>
          <td colSpan={5} className="px-4 pb-3 pt-0">
            <div className="ml-6 bg-slate-800/60 rounded-xl p-3 border border-slate-700/40 text-sm text-slate-400 leading-relaxed">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Findings</p>
              {audit.findings}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuditsPage() {
  const { role } = useAuth();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const canEdit = role === 'ADMIN' || role === 'MANAGER';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAudits();
      setAudits(res.data.audits || []);
    } catch {
      setError('Failed to load audits. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = audits
    .filter((a) => statusFilter === 'All' || a.status === statusFilter)
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    All: audits.length,
    Scheduled: audits.filter((a) => a.status === 'Scheduled').length,
    'In Progress': audits.filter((a) => a.status === 'In Progress').length,
    Completed: audits.filter((a) => a.status === 'Completed').length,
    Cancelled: audits.filter((a) => a.status === 'Cancelled').length,
  };

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
            <FileSearch className="w-6 h-6 text-blue-400" />
            Compliance Audits
          </h1>
          <p className="page-subheader">
            Schedule, manage, and track audit lifecycle across departments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="refresh-audits"
            onClick={load}
            className="btn-secondary flex items-center gap-2 text-sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {canEdit && (
            <button
              id="create-audit-btn"
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Schedule Audit
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Audits', val: counts.All, color: 'text-slate-300' },
          { label: 'Scheduled', val: counts.Scheduled, color: 'text-yellow-400' },
          { label: 'In Progress', val: counts['In Progress'], color: 'text-blue-400' },
          { label: 'Completed', val: counts.Completed, color: 'text-brand-400' },
        ].map((k) => (
          <div key={k.label} className="card px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${k.color}`}>{k.val}</p>
            <p className="text-slate-500 text-xs mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 flex-wrap">
          {['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'].map((f) => (
            <button
              key={f}
              id={`audit-filter-${f.toLowerCase().replace(' ', '-')}`}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                statusFilter === f
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f} <span className="opacity-60">({counts[f] ?? 0})</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="audit-search"
            className="input pl-9 text-sm"
            placeholder="Search audits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 border-red-700/50 text-red-300 text-sm mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Audit Title</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j}>
                      <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <FileSearch className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500">No audits found</p>
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <AuditRow
                  key={a._id}
                  audit={a}
                  canEdit={canEdit}
                  onEdit={setEditingAudit}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CreateAuditModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(a) => {
          setAudits((prev) => [a, ...prev]);
          showToast('✅ Audit scheduled successfully!');
        }}
      />
      <UpdateAuditModal
        open={!!editingAudit}
        audit={editingAudit}
        onClose={() => setEditingAudit(null)}
        onUpdated={(updated) => {
          setAudits((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
          setEditingAudit(null);
          showToast('✅ Audit updated successfully!');
        }}
      />
    </div>
  );
}
