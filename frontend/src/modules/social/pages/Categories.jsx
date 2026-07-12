import { useState } from 'react';
import useCategories from '../hooks/useCategories';
import { useAuth } from '../../../context/AuthContext';
import CategoryForm from '../components/CategoryForm';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Categories() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';
  
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleEditClick = (cat) => {
    setSelectedCategory(cat);
    setFormOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    if (selectedCategory) {
      await updateCategory(selectedCategory._id, data);
    } else {
      await createCategory(data);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
      } catch (err) {
        alert(err.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">CSR Categories</h1>
          <p className="page-subheader">
            Manage categories for Corporate Social Responsibility activities and programs.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreateClick}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-200 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Categories Table */}
      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          No categories found. {isAdmin && 'Click "Add Category" to create the first one.'}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Created At</th>
                {isAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td className="font-semibold text-slate-100">{cat.name}</td>
                  <td className="text-slate-300 max-w-xs truncate">{cat.description || '-'}</td>
                  <td>
                    <span className={cat.status === 'Active' ? 'badge-green' : 'badge-red'}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="text-slate-300">{cat.createdBy?.name || 'System'}</td>
                  <td className="text-slate-400 text-xs">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="text-brand-400 hover:text-brand-300 transition-colors p-1.5 inline-flex"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat._id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1.5 inline-flex"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <CategoryForm
          category={selectedCategory}
          onSubmit={handleFormSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
