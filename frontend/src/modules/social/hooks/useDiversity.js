import { useState, useEffect, useCallback } from 'react';
import { getDiversity } from '../../../api/socialApi';

export default function useDiversity() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiversity();
      setMetrics(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch diversity metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
