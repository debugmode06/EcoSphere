import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Zap, X } from 'lucide-react';
import {
  getEmissionFactors, createEmissionFactor,
  updateEmissionFactor, deleteEmissionFactor
} from '../../../api/environmentalApi';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Toast from '../../../components/ui/Toast';
import { PageSpinner } from '../../../components/ui/Spinner';
import Pagination from '../../../components/ui/Pagination';

const EMPTY_FORM = {
  factor_id: '', activity_name: '', category: '', unit: '',
  emission_factor: '', factor_unit: '', source: '', year: new Date().getFullYear()
};

const ITEMS_PER_PAGE = 8;

export default function EmissionFactorsPage() {
  const [factors, setFactors]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState('activity_name');
  const [sortDir, setSortDir]     = useState('asc');
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast]         = useState(null);
  const [errors, setErrors]       = useState({});

  const showToast = (message, type = 'success') => setToast({ message, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmissionFactors();
      setFactors(res.data.data ?? []);
    } catch {
      showToast('Failed to load emission factors', 'error');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter + Sort + Paginate
  useEffect(() => {
    let data = [...factors];
    if (search) data = data.filter(f =>
      f.activity_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.category?.toLowerCase().includes(search.toLowerCase()) ||
      f.factor_id?.toLowerCase().includes(search.toLowerCase())
    );
    data.sort((a, b) => {
      const av = a[sortBy] ?? '';
      const bv = b[sortBy] ?? '';
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    setFiltered(data);
    setPage(1);
  }, [factors, search, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
  const openEdit   = (f)  => { setEditing(f); setForm({ ...f, year: f.year || '' }); setErrors({}); setModal(true); };
  const closeModal = ()   => { setModal(false); setEditing(null); setForm(EMPTY_FORM); };

  const validate = () => {
    const e = {};
    if (!form.factor_id.trim())    e.factor_id       = 'Factor ID is required';
    if (!form.activity_name.trim()) e.activity_name  = 'Activity name is required';
    if (!form.category.trim())      e.category       = 'Category is required';
    if (!form.unit.trim())          e.unit           = 'Unit is required';
    if (!form.emission_factor)      e.emission_factor = 'Emission factor is required';
    if (isNaN(Number(form.emission_factor)) || Number(form.emission_factor) < 0)
      e.emission_factor = 'Must be a positive number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, emission_factor: Number(form.emission_factor), year: Number(form.year) };
      if (editing) {
        await updateEmissionFactor(form.factor_id, payload);
        showToast('Emission factor updated ✓');
      } else {
        await createEmissionFactor(payload);
        showToast('Emission factor created ✓');
      }
      closeModal();
      load();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Save failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteEmissionFactor(confirmDel.factor_id);
      showToast('Emission factor deactivated');
      setConfirmDel(null);
      load();
    } catch { showToast('Delete failed', 'error'); }
  };

  const SortIcon = ({ col }) => (
    <span className="ml-1 opacity-50">{sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
  );

  const Field = ({ label, name, type = 'text', step, required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-rose-400 ml-0.5">*</span>}</label>
      <input
        type={type} step={step}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className={`input ${errors[name] ? 'border-rose-400 focus:ring-rose-400' : ''}`}
      />
      {errors[name] && <p className="text-xs text-rose-500 mt-1">{errors[name]}</p>}
    </div>
  );

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2"><Zap className="w-6 h-6 text-amber-500" /> Emission Factors</h1>
          <p className="page-subheader">{factors.length} active factors — manage reference emission data</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Factor
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, category, ID…"
          className="input pl-9 pr-8"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th><button onClick={() => toggleSort('factor_id')} className="flex items-center">ID<SortIcon col="factor_id" /></button></th>
              <th><button onClick={() => toggleSort('activity_name')} className="flex items-center">Activity<SortIcon col="activity_name" /></button></th>
              <th><button onClick={() => toggleSort('category')} className="flex items-center">Category<SortIcon col="category" /></button></th>
              <th>Unit</th>
              <th><button onClick={() => toggleSort('emission_factor')} className="flex items-center">Factor<SortIcon col="emission_factor" /></button></th>
              <th>Source</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">
                {search ? 'No results match your search.' : 'No emission factors yet. Click "Add Factor" to create one.'}
              </td></tr>
            ) : paginated.map(f => (
              <tr key={f._id}>
                <td className="font-mono text-xs text-slate-500">{f.factor_id}</td>
                <td className="font-medium">{f.activity_name}</td>
                <td><span className="badge-blue">{f.category}</span></td>
                <td className="text-slate-500 text-xs">{f.unit}</td>
                <td className="font-semibold text-emerald-700">{f.emission_factor}</td>
                <td className="text-slate-400 text-xs">{f.source || '—'}</td>
                <td className="text-slate-400 text-xs">{f.year || '—'}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDel(f)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
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

      {/* Create / Edit Modal */}
      <Modal open={modal} onClose={closeModal} title={editing ? 'Edit Emission Factor' : 'New Emission Factor'}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Factor ID"       name="factor_id"       required />
          <Field label="Activity Name"   name="activity_name"   required />
          <Field label="Category"        name="category"        required />
          <Field label="Unit"            name="unit"            required />
          <Field label="Emission Factor" name="emission_factor" type="number" step="0.0001" required />
          <Field label="Factor Unit"     name="factor_unit" />
          <Field label="Source"          name="source" />
          <Field label="Year"            name="year"  type="number" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Update Factor' : 'Create Factor'}
          </button>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDel}
        title="Deactivate Emission Factor"
        message={`Are you sure you want to deactivate "${confirmDel?.activity_name}"? This won't delete it permanently.`}
        confirmLabel="Deactivate"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}
