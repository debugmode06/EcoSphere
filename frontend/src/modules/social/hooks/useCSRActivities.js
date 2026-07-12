import { useState, useEffect, useCallback } from 'react';
import { getActivities, createActivity, updateActivity, deleteActivity, publishActivity } from '../../../api/socialApi';

export default function useCSRActivities(filters = {}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActivities(filters);
      setActivities(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const handleCreate = async (data) => {
    const newActivity = await createActivity(data);
    setActivities((prev) => [newActivity, ...prev]);
    return newActivity;
  };

  const handleUpdate = async (id, data) => {
    const updated = await updateActivity(id, data);
    setActivities((prev) => prev.map((a) => (a._id === id ? updated : a)));
    return updated;
  };

  const handleDelete = async (id) => {
    await deleteActivity(id);
    setActivities((prev) => prev.filter((a) => a._id !== id));
  };

  const handlePublish = async (id) => {
    const updated = await publishActivity(id);
    setActivities((prev) => prev.map((a) => (a._id === id ? updated : a)));
    return updated;
  };

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  return {
    activities, loading, error,
    refetch: fetchActivities,
    createActivity: handleCreate,
    updateActivity: handleUpdate,
    deleteActivity: handleDelete,
    publishActivity: handlePublish,
  };
}
