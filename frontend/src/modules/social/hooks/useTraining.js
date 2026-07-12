import { useState, useEffect, useCallback } from 'react';
import {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  assignTraining,
  markComplete,
  getEmployeeTrainingHistory,
} from '../../../api/socialApi';

export default function useTraining() {
  const [trainings, setTrainings] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrainings = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrainings(filters);
      setTrainings(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch trainings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployeeTrainingHistory();
      setHistory(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch training history');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async (data) => {
    const newTraining = await createTraining(data);
    setTrainings((prev) => [newTraining, ...prev]);
    return newTraining;
  };

  const handleUpdate = async (id, data) => {
    const updated = await updateTraining(id, data);
    setTrainings((prev) => prev.map((t) => (t._id === id ? { ...t, ...updated } : t)));
    return updated;
  };

  const handleDelete = async (id) => {
    await deleteTraining(id);
    setTrainings((prev) => prev.filter((t) => t._id !== id));
  };

  const handleAssign = async (id, employeeIds) => {
    await assignTraining(id, { employeeIds });
    // Refresh to update totals
    await fetchTrainings();
  };

  const handleMarkComplete = async (id) => {
    const completion = await markComplete(id);
    setHistory((prev) =>
      prev.map((h) => {
        const hId = h.trainingId?._id || h.trainingId;
        return hId === id ? { ...h, status: 'completed', completionDate: completion.completionDate } : h;
      })
    );
    // Refresh list to update totals/percentages
    await fetchTrainings();
    return completion;
  };

  return {
    trainings,
    history,
    loading,
    error,
    refetchTrainings: fetchTrainings,
    refetchHistory: fetchHistory,
    createTraining: handleCreate,
    updateTraining: handleUpdate,
    deleteTraining: handleDelete,
    assignTraining: handleAssign,
    markComplete: handleMarkComplete,
  };
}
