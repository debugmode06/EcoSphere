import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, ClipboardList, X } from 'lucide-react';
import {
  getTransactions, createTransaction,
  updateTransaction, deleteTransaction,
  getEmissionFactors
} from '../../../api/environmentalApi';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Toast from '../../../components/ui/Toast';
import { PageSpinner } from '../../../components/ui/Spinner';
import Pagination from '../../../components/ui/Pagination';

const EMPTY_FORM = {
  emissionFactor: '',
  quantity: '',
  department: '',
  description: '',
  transactionDate: new Date().toISOString().split('T')[0]
};

export default function CarbonTransactionsPage() {
  const [txs, setTxs] = useState([]);
  const [factors, setFactors] = useState([]);
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
  const [calculatedEmission, setCalculatedEmission] = useState(0);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const loadFactors = async () => {
    try {
      const res = await getEmissionFactors();
      setFactors(res.data.data ?? []);
    } catch {
      showToast('Failed to load emission factors', 'error');
    }
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions({
        page,
        limit: 8,
        keyword: search
      });
      setTxs(res.data.data ?? []);
      setTotalPages(res.data.pagination?.totalPages ?? 1);
    } catch {
      showToast('Failed to load carbon transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadFactors();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Handle estimated emission calculation when factor or quantity changes
  useEffect(() => {
    const factorId = form.emissionFactor;
    const qty = Number(form.quantity);
    if (factorId && qty > 0) {
      const selected = factors.find(f => f._id === factorId);
      if (selected) {
        setCalculatedEmission(qty * selected.emission_factor);
        return;
      }
    }
    setCalculatedEmission(0);
  }, [form.emissionFactor, form.quantity, factors]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModal(true);
  };

  const openEdit = (tx) => {
    setEditing(tx);
    setForm({
      emissionFactor: tx.emissionFactor?._id ?? tx.emissionFactor ?? '',
      quantity: tx.quantity ?? '',
      department: tx.department ?? '',
      description: tx.description ?? '',
      transactionDate: tx.transactionDate ? new Date(tx.transactionDate).toISOString().split('T')[0] : ''
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
    if (!form.emissionFactor) e.emissionFactor = 'Emission Factor is required';
    if (!form.quantity) e.quantity = 'Quantity is required';
    if (isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      e.quantity = 'Quantity must be a positive number';
    }
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.transactionDate) e.transactionDate = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity)
      };
      if (editing) {
        await updateTransaction(editing._id, payload);
        showToast('Carbon transaction updated successfully ✓');
      } else {
        await createTransaction(payload);
        showToast('Carbon transaction created successfully ✓');
      }
      closeModal();
      loadTransactions();
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction(confirmDel._id);
      showToast('Carbon transaction deactivated');
      setConfirmDel(null);
      loadTransactions();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  if (loading && txs.length === 0) return <PageSpinner />;

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-500" /> Carbon Transactions
          </h1>
          <p className="page-subheader">Log and monitor organizational carbon emitting transactions</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Transaction
        </button>
      </div>

      {/* Search & Filter */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by department, keyword…"
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
              <th>Date</th>
              <th>Department</th>
              <th>Activity / Emission Factor</th>
              <th>Quantity</th>
              <th>Estimated CO₂ (kg)</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {txs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  {search ? 'No results match your search.' : 'No transactions logged yet.'}
                </td>
              </tr>
            ) : txs.map(tx => (
              <tr key={tx._id}>
                <td className="text-slate-500 text-xs">{new Date(tx.transactionDate || tx.createdAt).toLocaleDateString()}</td>
                <td className="font-medium text-slate-700">{tx.department}</td>
                <td>
                  <div className="text-slate-700 font-medium">{tx.emissionFactor?.activity_name ?? '—'}</div>
                  <div className="text-slate-450 text-[11px] font-mono">{tx.emissionFactor?.factor_id ?? 'Unknown'}</div>
                </td>
                <td>{tx.quantity?.toLocaleString()} <span className="text-xs text-slate-400">{tx.emissionFactor?.unit}</span></td>
                <td className="font-bold text-emerald-700">{tx.carbonEmission?.toLocaleString()} kg</td>
                <td className="text-slate-500 text-xs max-w-xs truncate">{tx.description || '—'}</td>
                <td>
                  <span className={tx.status === 'active' ? 'badge-green' : 'badge-red'}>
                    {tx.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDel(tx)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
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

      {/* Log Transaction Modal */}
      <Modal open={modal} onClose={closeModal} title={editing ? 'Edit Carbon Transaction' : 'Log Carbon Transaction'}>
        <div className="space-y-4">
          <div>
            <label className="label">Emission Factor / Activity <span className="text-rose-400">*</span></label>
            <select
              value={form.emissionFactor}
              onChange={e => setForm(f => ({ ...f, emissionFactor: e.target.value }))}
              className={`input ${errors.emissionFactor ? 'border-rose-400' : ''}`}
            >
              <option value="">Select Emission Factor / Activity</option>
              {factors.map(f => (
                <option key={f._id} value={f._id}>
                  {f.activity_name} ({f.factor_id} - {f.emission_factor} kgCO2e/{f.unit})
                </option>
              ))}
            </select>
            {errors.emissionFactor && <p className="text-xs text-rose-500 mt-1">{errors.emissionFactor}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity <span className="text-rose-400">*</span></label>
              <input
                type="number"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className={`input ${errors.quantity ? 'border-rose-400' : ''}`}
              />
              {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="label">Transaction Date <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={form.transactionDate}
                onChange={e => setForm(f => ({ ...f, transactionDate: e.target.value }))}
                className={`input ${errors.transactionDate ? 'border-rose-400' : ''}`}
              />
              {errors.transactionDate && <p className="text-xs text-rose-500 mt-1">{errors.transactionDate}</p>}
            </div>
          </div>

          <div>
            <label className="label">Department <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              className={`input ${errors.department ? 'border-rose-400' : ''}`}
              placeholder="e.g. Manufacturing, Operations, IT"
            />
            {errors.department && <p className="text-xs text-rose-500 mt-1">{errors.department}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input h-20 resize-none"
              placeholder="Provide extra details of this emission source…"
            />
          </div>

          {calculatedEmission > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
              <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider block mb-0.5">Estimated Carbon Emission</span>
              <span className="text-xl font-bold text-emerald-800">{calculatedEmission.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg CO₂e</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Saving…' : editing ? 'Update Transaction' : 'Log Transaction'}
          </button>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDel}
        title="Deactivate Carbon Transaction"
        message="Are you sure you want to deactivate this carbon transaction? It will be soft-deleted."
        confirmLabel="Deactivate"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}
