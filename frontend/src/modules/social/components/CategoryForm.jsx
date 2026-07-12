import { useState, useEffect } from 'react';

export default function CategoryForm({ category, onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setStatus(category.status || 'Active');
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');

    setLoading(true);
    setError(null);
    try {
      await onSubmit({ name, description, status });
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay">
      <div className="card w-full max-w-md bg-surface p-6 relative flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-100">
          {category ? 'Edit Category' : 'Create Category'}
        </h2>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Environmental, Education"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of this CSR category..."
              disabled={loading}
            />
          </div>

          {category && (
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
