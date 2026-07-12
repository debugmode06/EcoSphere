import { useState, useEffect, useCallback } from 'react';
import {
  getMyParticipations, getPendingParticipations,
  joinActivity, uploadProof, approveParticipation, rejectParticipation,
} from '../../../api/socialApi';

export function useMyParticipations() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyParticipations();
      setParticipations(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoin = async (csrActivityId) => {
    const p = await joinActivity({ csrActivityId });
    setParticipations((prev) => [p, ...prev]);
    return p;
  };

  const handleUploadProof = async (participationId, proofDocument) => {
    const p = await uploadProof({ participationId, proofDocument });
    setParticipations((prev) => prev.map((x) => (x._id === participationId ? p : x)));
    return p;
  };

  useEffect(() => { fetch(); }, [fetch]);

  return {
    participations, loading, error,
    refetch: fetch, joinActivity: handleJoin, uploadProof: handleUploadProof,
  };
}

export function usePendingParticipations() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingParticipations();
      setParticipations(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprove = async (id, remarks) => {
    const p = await approveParticipation(id, { remarks });
    setParticipations((prev) => prev.filter((x) => x._id !== id));
    return p;
  };

  const handleReject = async (id, remarks) => {
    const p = await rejectParticipation(id, { remarks });
    setParticipations((prev) => prev.filter((x) => x._id !== id));
    return p;
  };

  useEffect(() => { fetch(); }, [fetch]);

  return {
    participations, loading, error,
    refetch: fetch, approve: handleApprove, reject: handleReject,
  };
}
