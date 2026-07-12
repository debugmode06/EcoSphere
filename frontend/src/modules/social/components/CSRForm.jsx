import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CSRForm({ activity, categories, departments, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', departmentId: '',
    location: '', startDate: '', endDate: '',
    maxParticipants: 10, evidenceRequired: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activity) {
      setForm({
        title: activity.title || '',
        description: activity.description || '',
        categoryId: activity.categoryId?._id || activity.categoryId || '',
        departmentId: activity.departmentId?._id || activity.departmentId || '',
        location: activity.location || '',
        startDate: activity.startDate ? activity.startDate.split('T')[0] : '',
        endDate: activity.endDate ? activity.endDate.split('T')[0] : '',
        maxParticipants: activity.maxParticipants || 10,
        evidenceRequired: activity.evidenceRequired || false,
      });
    }
  }, [activity]);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay overflow-y-auto">
      <div className="card w-full max-w-2xl bg-surface p-6 my-4 space-y-4 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {activity ? 'Edit CSR Activity' : 'Create CSR Activity'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={set('title')} placeholder="Activity title" required disabled={loading} />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description} onChange={set('description')} placeholder="Brief description..." disabled={loading} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.categoryId} onChange={set('categoryId')} required disabled={loading}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.departmentId} onChange={set('departmentId')} required disabled={loading}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={set('location')} placeholder="City, Venue" required disabled={loading} />
          </div>
          <div>
            <label className="label">Max Participants</label>
            <input className="input" type="number" min="1" value={form.maxParticipants} onChange={set('maxParticipants')} required disabled={loading} />
          </div>
          <div>
            <label className="label">Start Date</label>
            <input className="input" type="date" value={form.startDate} onChange={set('startDate')} required disabled={loading} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input className="input" type="date" value={form.endDate} onChange={set('endDate')} required disabled={loading} />
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <input
              id="evidenceRequired"
              type="checkbox"
              className="w-4 h-4 accent-brand-500 cursor-pointer"
              checked={form.evidenceRequired}
              onChange={set('evidenceRequired')}
              disabled={loading}
            />
            <label htmlFor="evidenceRequired" className="text-sm text-slate-700 cursor-pointer">
              Require proof document for approval
            </label>
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : activity ? 'Update Activity' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
