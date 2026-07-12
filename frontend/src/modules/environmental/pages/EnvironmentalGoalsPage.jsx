import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Target, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import {
  getGoals, createGoal, updateGoal, deleteGoal, getGoalProgress
} from '../../../api/environmentalApi';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Toast from '../../../components/ui/Toast';
import { PageSpinner } from '../../../components/ui/Spinner';
import Pagination from '../../../components/ui/Pagination';

const EMPTY_FORM = {
  goal_id: '',
  goal_name: '',
  goal_type: 'REDUCTION',
  department_id: '',
  target_reduction: '',
  baseline_emission_kg_co2e: '',
  target_emission_kg_co2e: '',
  start_date: '',
  end_date: '',
  status: 'ACTIVE',
  description: ''
};

export default function EnvironmentalGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, progressRes] = await Promise.all([
        getGoals({
          page,
          limit: 6,
          search
        }),
        getGoalProgress()
      ]);
      setGoals(goalsRes.data.data ?? []);
      setTotalPages(goalsRes.data.pagination?.totalPages ?? 1);
      setProgress(progressRes.data ?? null);
    } catch {
      showToast('Failed to load goals data', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModal(true);
  };

  const openEdit = (g) => {
    setEditing(g);
    setForm({
      goal_id: g.goal_id ?? '',
      goal_name: g.goal_name ?? '',
      goal_type: g.goal_type ?? 'REDUCTION',
      department_id: g.department_id ?? '',
      target_reduction: g.target_reduction ?? '',
      baseline_emission_kg_co2e: g.baseline_emission_kg_co2e ?? '',
      target_emission_kg_co2e: g.target_emission_kg_co2e ?? '',
      start_date: g.start_date ? new Date(g.start_date).toISOString().split('T')[0] : '',
      end_date: g.end_date ? new Date(g.end_date).toISOString().split('T')[0] : '',
      status: g.status ?? 'ACTIVE',
      description: g.description ?? ''
    });
    setErrors({});
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const validate = () => {
    const e = {};
    if (!form.goal_id.trim()) e.goal_id = 'Goal ID is required';
    if (!form.goal_name.trim()) e.goal_name = 'Goal name is required';
    if (!form.department_id.trim()) e.department_id = 'Department ID is required';
    if (!form.baseline_emission_kg_co2e) e.baseline_emission_kg_co2e = 'Baseline emission is required';
    if (!form.target_emission_kg_co2e) e.target_emission_kg_co2e = 'Target emission is required';
    if (!form.start_date) e.start_date = 'Start date is required';
    if (!form.end_date) e.end_date = 'End date is required';
    
    // Check if numbers are positive
    if (form.baseline_emission_kg_co2e && Number(form.baseline_emission_kg_co2e) < 0) {
      e.baseline_emission_kg_co2e = 'Cannot be negative';
    }
    if (form.target_emission_kg_co2e && Number(form.target_emission_kg_co2e) < 0) {
      e.target_emission_kg_co2e = 'Cannot be negative';
    }
    if (form.target_reduction && Number(form.target_reduction) < 0) {
      e.target_reduction = 'Cannot be negative';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        baseline_emission_kg_co2e: Number(form.baseline_emission_kg_co2e),
        target_emission_kg_co2e: Number(form.target_emission_kg_co2e),
        target_reduction: form.target_reduction ? Number(form.target_reduction) : 0
      };
      if (editing) {
        await updateGoal(editing._id, payload);
        showToast('Environmental goal updated ✓');
      } else {
        await createGoal(payload);
        showToast('Environmental goal created ✓');
      }
      closeModal();
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal(confirmDel._id);
      showToast('Environmental goal status updated');
      setConfirmDel(null);
      loadData();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  if (loading && goals.length === 0) return <PageSpinner />;

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Target className="w-6 h-6 text-violet-500" /> Environmental Goals
          </h1>
          <p className="page-subheader">Set, track, and monitor ESG reduction targets</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {/* Goals Progress Grid */}
      {progress?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Goals</div>
              <div className="text-xl font-bold text-slate-700">{progress.summary.totalGoals ?? 0}</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Achieved Goals</div>
              <div className="text-xl font-bold text-slate-700">{progress.summary.achievedGoals ?? 0}</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Goals</div>
              <div className="text-xl font-bold text-slate-700">{progress.summary.activeGoals ?? 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Progress Bars List */}
      {progress?.goalsProgress && progress.goalsProgress.length > 0 && (
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-700">🎯 Active Goal Achievements</h2>
          <div className="space-y-4">
            {progress.goalsProgress.map((g, idx) => {
              const achievementPercent = Math.min(100, Math.max(0, g.achievementRate ?? 0));
              return (
                <div key={idx} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700">{g.goalName}</h3>
                      <p className="text-xs text-slate-400">Department: {g.department} | Type: {g.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-violet-700">{achievementPercent.toFixed(1)}% Achieved</span>
                      <p className="text-[10px] text-slate-400">Target reduction: {g.targetReduction ?? 0}%</p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${achievementPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Baseline: {g.baseline?.toLocaleString()} kg CO₂</span>
                    <span>Target: {g.target?.toLocaleString()} kg CO₂</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by goal name, department…"
          className="input pl-9"
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Goal ID</th>
              <th>Goal Name</th>
              <th>Type</th>
              <th>Department</th>
              <th>Baseline (kg)</th>
              <th>Target (kg)</th>
              <th>Target Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-400">
                  {search ? 'No goals match your search.' : 'No goals created yet.'}
                </td>
              </tr>
            ) : goals.map(g => (
              <tr key={g._id}>
                <td className="font-mono text-xs text-slate-500">{g.goal_id}</td>
                <td>
                  <div className="font-medium text-slate-700">{g.goal_name}</div>
                  <div className="text-slate-400 text-xs truncate max-w-xs">{g.description || 'No description'}</div>
                </td>
                <td><span className="badge-blue text-xs">{g.goal_type}</span></td>
                <td className="font-medium">{g.department_id}</td>
                <td>{g.baseline_emission_kg_co2e?.toLocaleString()}</td>
                <td className="font-semibold text-violet-750">{g.target_emission_kg_co2e?.toLocaleString()}</td>
                <td className="text-slate-500 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(g.end_date).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={
                    g.status === 'ACHIEVED' ? 'badge-green' :
                    g.status === 'NOT_ACHIEVED' ? 'badge-red' :
                    'badge-yellow'
                  }>
                    {g.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDel(g)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Goal Modal */}
      <Modal open={modal} onClose={closeModal} title={editing ? 'Edit Goal' : 'Create Goal'}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Goal ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={form.goal_id}
                onChange={e => setForm(f => ({ ...f, goal_id: e.target.value }))}
                className={`input ${errors.goal_id ? 'border-rose-400' : ''}`}
                disabled={!!editing}
                placeholder="e.g. GOAL-01"
              />
              {errors.goal_id && <p className="text-xs text-rose-500 mt-1">{errors.goal_id}</p>}
            </div>

            <div>
              <label className="label">Goal Type</label>
              <select
                value={form.goal_type}
                onChange={e => setForm(f => ({ ...f, goal_type: e.target.value }))}
                className="input"
              >
                <option value="REDUCTION">REDUCTION</option>
                <option value="EFFICIENCY">EFFICIENCY</option>
                <option value="RENEWABLE">RENEWABLE</option>
                <option value="WASTE">WASTE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Goal Name <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={form.goal_name}
              onChange={e => setForm(f => ({ ...f, goal_name: e.target.value }))}
              className={`input ${errors.goal_name ? 'border-rose-400' : ''}`}
              placeholder="e.g. Reduce Manufacturing Emissions by 20%"
            />
            {errors.goal_name && <p className="text-xs text-rose-500 mt-1">{errors.goal_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Department ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={form.department_id}
                onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                className={`input ${errors.department_id ? 'border-rose-400' : ''}`}
                placeholder="e.g. Manufacturing"
              />
              {errors.department_id && <p className="text-xs text-rose-500 mt-1">{errors.department_id}</p>}
            </div>

            <div>
              <label className="label">Target Reduction (%)</label>
              <input
                type="number"
                value={form.target_reduction}
                onChange={e => setForm(f => ({ ...f, target_reduction: e.target.value }))}
                className={`input ${errors.target_reduction ? 'border-rose-400' : ''}`}
                placeholder="e.g. 20"
              />
              {errors.target_reduction && <p className="text-xs text-rose-500 mt-1">{errors.target_reduction}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Baseline Emission (kg) <span className="text-rose-400">*</span></label>
              <input
                type="number"
                value={form.baseline_emission_kg_co2e}
                onChange={e => setForm(f => ({ ...f, baseline_emission_kg_co2e: e.target.value }))}
                className={`input ${errors.baseline_emission_kg_co2e ? 'border-rose-400' : ''}`}
                placeholder="e.g. 10000"
              />
              {errors.baseline_emission_kg_co2e && <p className="text-xs text-rose-500 mt-1">{errors.baseline_emission_kg_co2e}</p>}
            </div>

            <div>
              <label className="label">Target Emission (kg) <span className="text-rose-400">*</span></label>
              <input
                type="number"
                value={form.target_emission_kg_co2e}
                onChange={e => setForm(f => ({ ...f, target_emission_kg_co2e: e.target.value }))}
                className={`input ${errors.target_emission_kg_co2e ? 'border-rose-400' : ''}`}
                placeholder="e.g. 8000"
              />
              {errors.target_emission_kg_co2e && <p className="text-xs text-rose-500 mt-1">{errors.target_emission_kg_co2e}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className={`input ${errors.start_date ? 'border-rose-400' : ''}`}
              />
              {errors.start_date && <p className="text-xs text-rose-500 mt-1">{errors.start_date}</p>}
            </div>

            <div>
              <label className="label">End Date <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className={`input ${errors.end_date ? 'border-rose-400' : ''}`}
              />
              {errors.end_date && <p className="text-xs text-rose-500 mt-1">{errors.end_date}</p>}
            </div>
          </div>

          {editing && (
            <div>
              <label className="label">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="input"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ACHIEVED">ACHIEVED</option>
                <option value="NOT_ACHIEVED">NOT_ACHIEVED</option>
              </select>
            </div>
          )}

          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input h-16 resize-none"
              placeholder="Provide a description of this goal target…"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </Modal>

      {/* Confirm Soft Delete */}
      <ConfirmDialog
        open={!!confirmDel}
        title="Mark Goal as Not Achieved"
        message="Are you sure you want to mark this goal as NOT_ACHIEVED? This will update its status."
        confirmLabel="Confirm"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}
