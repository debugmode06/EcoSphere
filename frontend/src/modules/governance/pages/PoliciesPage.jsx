import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Plus, CheckCircle2, Clock, Archive,
  FileText, RefreshCw, Eye, ChevronRight, AlertCircle,
  FileDown, BarChart2, Bell, AlertTriangle, Edit2, Copy
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useAuth } from '../../../context/AuthContext';
import {
  getPolicies,
  createPolicy,
  updatePolicyStatus,
  acknowledgePolicy,
  getPolicyAcknowledgements,
  getPolicyStats,
  sendPolicyReminder,
  updatePolicy,
  createPolicyVersion,
  exportGovernanceData
} from '../../../api/governanceApi';
import GovernanceAlerts from '../components/GovernanceAlerts';

// ─── Helper: Map policy status → badge variant ────────────────────────────────
const statusVariant = (s) => {
  if (s === 'Published') return 'green';
  if (s === 'Draft') return 'yellow';
  if (s === 'Archived') return 'blue';
  return 'blue';
};

const priorityVariant = (p) => {
  if (p === 'High') return 'red';
  if (p === 'Medium') return 'yellow';
  if (p === 'Low') return 'green';
  return 'blue';
};

// ─── Acknowledge Modal ────────────────────────────────────────────────────────
function AcknowledgeModal({ open, onClose, onAcknowledge, policyTitle }) {
  const [feedback, setFeedback] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onAcknowledge({ feedback });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Acknowledge Policy`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          You are acknowledging: <span className="font-semibold text-slate-800">{policyTitle}</span>
        </p>
        <div>
          <label className="label" htmlFor="ack-feedback">Feedback (Optional)</label>
          <textarea
            id="ack-feedback"
            className="input resize-none"
            rows={3}
            placeholder="Any questions or feedback regarding this policy?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="submit" className="btn-primary flex-1">Acknowledge</button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Admin Dashboard Modal ────────────────────────────────────────────────────
function AdminDashboardModal({ open, onClose, policyId }) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, departments, pending, feedback

  useEffect(() => {
    if (open && policyId) {
      setLoading(true);
      setMessage('');
      getPolicyStats(policyId)
        .then(res => setStatsData(res.data))
        .catch(() => setMessage('Failed to load stats.'))
        .finally(() => setLoading(false));
    }
  }, [open, policyId]);

  const handleRemind = async () => {
    setReminding(true);
    try {
      const res = await sendPolicyReminder(policyId);
      setMessage(res.data.message);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to send reminders.');
    } finally {
      setReminding(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Policy Dashboard">
      {loading ? (
        <div className="flex justify-center p-6"><RefreshCw className="w-6 h-6 animate-spin text-brand-500" /></div>
      ) : statsData ? (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 pb-2 mb-4 overflow-x-auto">
            {['overview', 'departments', 'pending', 'feedback'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-slate-100 text-brand-600 border-b-2 border-brand-500 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase">Total Assigned</p>
                  <p className="text-xl font-bold text-slate-800">{statsData.stats.managers.total + statsData.stats.employees.total}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase">Acknowledged</p>
                  <p className="text-xl font-bold text-green-600">{statsData.stats.managers.acknowledged + statsData.stats.employees.acknowledged}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase">Pending</p>
                  <p className="text-xl font-bold text-amber-600">{statsData.stats.pending}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase">Feedback Count</p>
                  <p className="text-xl font-bold text-brand-600">{statsData.stats.feedbackCount}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="space-y-3 animate-in fade-in duration-200 max-h-60 overflow-y-auto pr-2">
              {statsData.departmentProgress.map((dept, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-800">{dept.name} ({dept.code})</span>
                    <span className="text-xs text-slate-500">{dept.acknowledged} / {dept.total}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${dept.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {statsData.stats.pending > 0 ? (
                <>
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-semibold">{statsData.stats.pending} Users Pending</span>
                    </div>
                    <button 
                      onClick={handleRemind} 
                      disabled={reminding}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] transition-colors"
                    >
                      <Bell className="w-3 h-3" />
                      {reminding ? 'Sending...' : 'Remind All'}
                    </button>
                  </div>
                  <ul className="max-h-48 overflow-y-auto space-y-1">
                    {statsData.stats.pendingUsers?.map((u, i) => (
                      <li key={i} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-700 font-medium">{u.name}</span>
                        <span className="text-slate-500">{u.department}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-green-600 text-sm text-center py-4">Everyone has acknowledged!</p>
              )}
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-3 animate-in fade-in duration-200 max-h-60 overflow-y-auto pr-2">
              {statsData.stats.feedbacks.length > 0 ? (
                statsData.stats.feedbacks.map((f, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-brand-600">{f.employeeName}</span>
                      <span className="text-[10px] text-slate-500">{new Date(f.acknowledgedDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 italic">"{f.feedback}"</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">No feedback provided yet.</p>
              )}
            </div>
          )}

          {message && <p className="text-sm text-center text-slate-600 mt-2">{message}</p>}
        </div>
      ) : (
        <p className="text-red-600 text-sm">{message}</p>
      )}
    </Modal>
  );
}

// ─── Policy Card Component ────────────────────────────────────────────────────
function PolicyCard({ policy, onAcknowledge, onStatusChange, onEdit, onNewVersion, currentUserId, userRole }) {
  const [ackLoading, setAckLoading] = useState(false);
  const [showAckModal, setShowAckModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const handleAckSubmit = async (data) => {
    setAckLoading(true);
    try {
      await onAcknowledge(policy._id, data);
    } finally {
      setAckLoading(false);
    }
  };

  return (
    <>
      <div className="card p-5 flex flex-col gap-4 hover:border-brand-500/40 transition-all duration-200 group relative bg-white border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="stat-icon bg-brand-50 flex-shrink-0 flex items-center justify-center p-2 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-brand-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-800 font-bold text-sm leading-tight truncate">{policy.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 text-xs">v{policy.version}</span>
                {policy.esgCategory && (
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                    {policy.esgCategory}
                  </span>
                )}
                {policy.priority && (
                  <StatusBadge label={policy.priority} variant={priorityVariant(policy.priority)} />
                )}
              </div>
            </div>
          </div>
          <StatusBadge label={policy.status} variant={statusVariant(policy.status)} />
        </div>

        {/* Description */}
        {policy.description && (
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{policy.description}</p>
        )}

        {/* Dates & Links */}
        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          {policy.effectiveDate && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Effective: {new Date(policy.effectiveDate).toLocaleDateString('en-IN')}
            </div>
          )}
          {policy.pdfUrl && (
            <a href={policy.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 transition-colors w-fit font-medium">
              <FileDown className="w-3.5 h-3.5" /> View Policy Document
            </a>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2 flex-wrap mt-auto pt-3 border-t border-slate-100">
          {/* Acknowledge button (MANAGER, EMPLOYEE) */}
          {policy.status === 'Published' && userRole !== 'ADMIN' && (
            <button
              onClick={() => setShowAckModal(true)}
              disabled={ackLoading}
              className="flex items-center gap-1.5 text-xs btn-primary py-1.5 px-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {ackLoading ? 'Processing...' : 'Acknowledge'}
            </button>
          )}

          {/* Admin Dashboard (ADMIN/MANAGER) */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && policy.status === 'Published' && (
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center gap-1.5 text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 py-1.5 px-3 rounded-lg transition-colors font-medium"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Dashboard
            </button>
          )}

          {/* Status change / Edit actions (ADMIN only) */}
          {userRole === 'ADMIN' && (
            <>
              {policy.status === 'Draft' && (
                <>
                  <button
                    onClick={() => onEdit(policy)}
                    className="flex items-center gap-1 text-[11px] btn-secondary py-1 px-2"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => onStatusChange(policy._id, 'Published')}
                    className="flex items-center gap-1 text-[11px] badge-green py-1 px-2 cursor-pointer hover:opacity-90"
                  >
                    <ChevronRight className="w-3 h-3" /> Publish
                  </button>
                </>
              )}
              {policy.status === 'Published' && (
                <>
                  <button
                    onClick={() => onNewVersion(policy._id)}
                    className="flex items-center gap-1 text-[11px] btn-secondary py-1 px-2"
                  >
                    <Copy className="w-3 h-3" /> New Version
                  </button>
                  <button
                    onClick={() => onStatusChange(policy._id, 'Archived')}
                    className="flex items-center gap-1 text-[11px] badge-yellow py-1 px-2 cursor-pointer hover:opacity-90"
                  >
                    <Archive className="w-3 h-3" /> Archive
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <AcknowledgeModal
        open={showAckModal}
        onClose={() => setShowAckModal(false)}
        onAcknowledge={handleAckSubmit}
        policyTitle={policy.title}
      />
      
      <AdminDashboardModal
        open={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        policyId={policy._id}
      />
    </>
  );
}

// ─── Create/Edit Policy Modal ──────────────────────────────────────────────────
function PolicyFormModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState({ 
    title: '', description: '', version: '1.0',
    esgCategory: 'Governance', priority: 'Medium', effectiveDate: '', expiryDate: '', pdfUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          title: initialData.title || '',
          description: initialData.description || '',
          version: initialData.version || '1.0',
          esgCategory: initialData.esgCategory || 'Governance',
          priority: initialData.priority || 'Medium',
          effectiveDate: initialData.effectiveDate ? initialData.effectiveDate.split('T')[0] : '',
          expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
          pdfUrl: initialData.pdfUrl || ''
        });
      } else {
        setForm({ 
          title: '', description: '', version: '1.0',
          esgCategory: 'Governance', priority: 'Medium', effectiveDate: '', expiryDate: '', pdfUrl: ''
        });
      }
      setError('');
    }
  }, [open, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.effectiveDate) { setError('Effective Date is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form, initialData?._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? 'Edit Policy' : 'Create New Policy'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="pol-title">Title *</label>
          <input
            id="pol-title" className="input"
            placeholder="e.g. Environmental Sustainability Policy"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">ESG Category</label>
            <select 
              className="input" 
              value={form.esgCategory} 
              onChange={e => setForm(f => ({ ...f, esgCategory: e.target.value }))}
            >
              <option value="Environment">Environment</option>
              <option value="Social">Social</option>
              <option value="Governance">Governance</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select 
              className="input" 
              value={form.priority} 
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Effective Date *</label>
            <input
              type="date" className="input"
              value={form.effectiveDate}
              onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Expiry Date</label>
            <input
              type="date" className="input"
              value={form.expiryDate}
              onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="label">PDF Document URL</label>
          <input
            type="url" className="input"
            placeholder="https://example.com/policy.pdf"
            value={form.pdfUrl}
            onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value }))}
          />
        </div>

        <div>
          <label className="label" htmlFor="pol-desc">Description</label>
          <textarea
            id="pol-desc" className="input resize-none" rows={3}
            placeholder="Describe the policy scope..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Policy')}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PoliciesPage() {
  const { user, role } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPolicies();
      setPolicies(res.data.policies || []);
    } catch {
      setError('Failed to load policies. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAcknowledge = async (policyId, data) => {
    try {
      await acknowledgePolicy(policyId, data);
      showToast('✅ Policy acknowledged successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 409 || msg.toLowerCase().includes('duplicate')) {
        showToast('ℹ️ You have already acknowledged this policy.');
      } else {
        showToast('❌ Failed to acknowledge policy. Please try again.');
      }
    }
  };

  const handleStatusChange = async (policyId, newStatus) => {
    try {
      const res = await updatePolicyStatus(policyId, newStatus);
      setPolicies((prev) =>
        prev.map((p) => (p._id === policyId ? res.data.policy : p))
      );
      if (newStatus === 'Published') showToast(`📢 Policy Published! Notifications sent.`);
      else showToast(`✅ Policy status updated to ${newStatus}`);
    } catch (err) {
      showToast(err.response?.data?.message || '❌ Failed to update status');
    }
  };

  const handleSavePolicy = async (data, id) => {
    if (id) {
      const res = await updatePolicy(id, data);
      setPolicies((prev) => prev.map((p) => (p._id === id ? res.data.policy : p)));
      showToast('✅ Policy updated successfully!');
    } else {
      const res = await createPolicy(data);
      setPolicies((prev) => [res.data.policy, ...prev]);
      showToast('✅ Policy created successfully!');
    }
  };

  const handleNewVersion = async (id) => {
    try {
      const res = await createPolicyVersion(id);
      setPolicies((prev) => [res.data.policy, ...prev]);
      showToast('✅ New version created as Draft');
      // Switch filter to Draft so they can see it
      setFilter('Draft');
    } catch (err) {
      showToast(err.response?.data?.message || '❌ Failed to create new version');
    }
  };

  const openEdit = (policy) => {
    setEditData(policy);
    setShowForm(true);
  };
  const openCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleExport = async () => {
    try {
      const res = await exportGovernanceData('policies');
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'policies_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export policies', err);
    }
  };

  const filteredPolicies = filter === 'All'
    ? policies
    : policies.filter((p) => p.status === filter);

  const counts = {
    All: policies.length,
    Draft: policies.filter((p) => p.status === 'Draft').length,
    Published: policies.filter((p) => p.status === 'Published').length,
    Archived: policies.filter((p) => p.status === 'Archived').length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-slate-600 text-slate-200 px-4 py-3 rounded-xl shadow-2xl text-sm animate-in slide-in-from-top-2 duration-200">
          {toast}
        </div>
      )}

      <GovernanceAlerts />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-500" />
            ESG Policies
          </h1>
          <p className="page-subheader">
            Manage organizational governance policies, create new versions, and track progress
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="btn-secondary flex items-center gap-2 text-sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          {role === 'ADMIN' && (
            <button
              onClick={openCreate}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Policy
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs — hidden for Employee (only Published is visible) */}
      {(() => {
        if (role === 'EMPLOYEE') return null;

        let availableTabs = [];
        if (role === 'ADMIN') availableTabs = ['All', 'Published', 'Draft', 'Archived'];
        if (role === 'MANAGER') availableTabs = ['All', 'Published', 'Archived'];

        // Only render tabs if there's more than just "All" and "Published" that make sense,
        // or just render them anyway since it's good UX
        return (
          <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit border border-slate-200 shadow-sm">
            {availableTabs.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  filter === f
                    ? 'bg-white text-brand-600 border border-slate-200 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f === 'Archived' && role === 'MANAGER' ? 'Previous Versions' : f}
                <span className="ml-1.5 text-xs opacity-60">({counts[f] || 0})</span>
              </button>
            ))}
          </div>
        );
      })()}

      {/* Error */}
      {error && (
        <div className="card p-4 border-red-700/50 text-red-300 text-sm mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Skeleton / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse space-y-3 bg-white border border-slate-200">
              <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-slate-200/60 rounded w-full animate-pulse" />
              <div className="h-3 bg-slate-200/60 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-slate-200">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No policies found</p>
          <p className="text-slate-500 text-sm mt-1">
            {filter !== 'All' ? `No ${filter} policies.` : 'Create your first policy to get started.'}
          </p>
          {role === 'ADMIN' && filter === 'All' && (
            <button onClick={openCreate} className="btn-primary mt-4 text-sm">
              <Plus className="w-4 h-4 inline mr-1" /> Create Policy
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPolicies.map((p) => (
            <PolicyCard
              key={p._id}
              policy={p}
              onAcknowledge={handleAcknowledge}
              onStatusChange={handleStatusChange}
              onEdit={openEdit}
              onNewVersion={handleNewVersion}
              currentUserId={user?._id}
              userRole={role}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <PolicyFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSavePolicy}
        initialData={editData}
      />
    </div>
  );
}
