import { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, RefreshCw, FileSearch,
  Calendar, Building2, AlertCircle, CheckCircle2,
  Clock, XCircle, ChevronDown, FileText
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useAuth } from '../../../context/AuthContext';
import { getAudits, createAudit, updateAudit } from '../../../api/governanceApi';
import { getDepartments } from '../../../api/coreApi';

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
  const [form, setForm] = useState({ title: '', date: '', findings: '', status: 'Scheduled', department: '' });
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      getDepartments()
        .then(res => {
          const depts = Array.isArray(res.data) ? res.data : (res.data.departments || []);
          setDepartments(depts);
        })
        .catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.date) { setError('Date is required'); return; }
    if (!form.department) { setError('Department is required'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await createAudit(form);
      onCreated(res.data.audit);
      setForm({ title: '', date: '', findings: '', status: 'Scheduled', department: '' });
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
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
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
          <label className="label" htmlFor="aud-dept">Department *</label>
          <select
            id="aud-dept"
            className="input"
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            required
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>
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
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
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

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({ open, onClose, audits, userRole, userDeptName }) {
  const handlePrint = () => {
    window.print();
  };

  if (!open) return null;

  const completed = audits.filter(a => a.status === 'Completed').length;
  const inProgress = audits.filter(a => a.status === 'In Progress').length;
  const scheduled = audits.filter(a => a.status === 'Scheduled').length;
  const cancelled = audits.filter(a => a.status === 'Cancelled').length;

  return (
    <Modal open={open} onClose={onClose} title="Compliance Audit Report">
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-800">EcoSphere Governance Module</h2>
          <p className="text-sm text-slate-500">
            Report Type: <span className="font-semibold text-slate-700">{userRole === 'ADMIN' ? 'Global Audit Report' : `Department Audit Report (${userDeptName || 'My Department'})`}</span>
          </p>
          <p className="text-xs text-slate-400">Generated on: {new Date().toLocaleString('en-IN')}</p>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 uppercase">Total</p>
            <p className="text-xl font-bold text-slate-800">{audits.length}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 uppercase">Completed</p>
            <p className="text-xl font-bold text-green-600">{completed}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 uppercase">Active</p>
            <p className="text-xl font-bold text-blue-600">{inProgress + scheduled}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 uppercase">Cancelled</p>
            <p className="text-xl font-bold text-red-600">{cancelled}</p>
          </div>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Audit List Details</h3>
          {audits.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No audits to display in this scope.</p>
          ) : (
            audits.map((a, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-800">{a.title}</h4>
                    <p className="text-xs text-slate-500">
                      Dept: {a.department?.name || 'All'} | Date: {new Date(a.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {a.status}
                  </span>
                </div>
                {a.findings && (
                  <div className="text-xs text-slate-600 border-t border-slate-200 pt-2">
                    <strong>Findings:</strong> {a.findings}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={handlePrint} className="btn-primary flex-1">
            Print / Save PDF
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Audit Row ────────────────────────────────────────────────────────────────
function AuditRow({ audit, canEdit, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="cursor-pointer hover:bg-slate-50/50" onClick={() => setExpanded((v) => !v)}>
        <td>
          <div className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${expanded ? '' : '-rotate-90'}`}
            />
            <span className="font-semibold text-slate-800 text-sm">{audit.title}</span>
          </div>
        </td>
        <td>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {audit.department?.name || <span className="text-slate-500 italic">All Depts</span>}
          </div>
        </td>
        <td>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
            <div className="ml-6 bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm text-slate-600 leading-relaxed shadow-sm">
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
  const { role, user } = useAuth();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const canEdit = role === 'ADMIN';
  const canGenerateReport = role === 'ADMIN' || role === 'MANAGER';

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
          <p className="text-slate-500 text-sm mt-1">You do not have permission to view compliance audits.</p>
        </div>
      </div>
    );
  }

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
            <FileSearch className="w-6 h-6 text-blue-500" />
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
          
          {canGenerateReport && (
            <button
              id="generate-report-btn"
              onClick={() => setShowReport(true)}
              className="btn-secondary flex items-center gap-2 text-sm text-brand-600 border-slate-200 hover:bg-slate-100 font-medium"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
          )}

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
          { label: 'Total Audits', val: counts.All, color: 'text-slate-800' },
          { label: 'Scheduled', val: counts.Scheduled, color: 'text-yellow-600' },
          { label: 'In Progress', val: counts['In Progress'], color: 'text-blue-600' },
          { label: 'Completed', val: counts.Completed, color: 'text-brand-600' },
        ].map((k) => (
          <div key={k.label} className="card px-4 py-3 text-center bg-white border border-slate-200">
            <p className={`text-2xl font-bold ${k.color}`}>{k.val}</p>
            <p className="text-slate-500 text-xs mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200 flex-wrap shadow-sm">
          {['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'].map((f) => (
            <button
              key={f}
              id={`audit-filter-${f.toLowerCase().replace(' ', '-')}`}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                statusFilter === f
                  ? 'bg-white text-blue-600 border border-slate-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f} <span className="opacity-60 font-normal">({counts[f] ?? 0})</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
        <div className="card p-4 border-red-200 bg-red-50 text-red-700 text-sm mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper border border-slate-200 bg-white shadow-sm">
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
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <FileSearch className="w-10 h-10 text-slate-400 mx-auto mb-2" />
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
      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        audits={filtered}
        userRole={role}
        userDeptName={user?.department?.name || 'Department'}
      />
    </div>
  );
}
