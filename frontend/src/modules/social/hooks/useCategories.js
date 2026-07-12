import { useState, useEffect, useCallback } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../api/socialApi';

function useCategoriesHook() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async (data) => {
    setError(null);
    try {
      const newCategory = await createCategory(data);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Failed to create category';
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleUpdate = async (id, data) => {
    setError(null);
    try {
      const updated = await updateCategory(id, data);
      setCategories((prev) => prev.map((cat) => (cat._id === id ? updated : cat)));
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Failed to update category';
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete category';
      setError(msg);
      throw new Error(msg);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory: handleCreate,
    updateCategory: handleUpdate,
    deleteCategory: handleDelete,
  };
}

// Default export for: import useCategories from './useCategories'
export default useCategoriesHook;

// Named export for: import { useCategories } from './useCategories'
export { useCategoriesHook as useCategories };
