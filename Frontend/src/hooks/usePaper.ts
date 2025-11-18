import { useState, useEffect, useCallback } from 'react';
import { PaperResponse } from '../types/explore';
import { api } from '../services/api';

interface UsePaperResult {
  paper: PaperResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePaper = (id: string | undefined, initialPaper?: PaperResponse): UsePaperResult => {
  const [paper, setPaper] = useState<PaperResponse | null>(initialPaper ?? null);
  const [loading, setLoading] = useState(!initialPaper);
  const [error, setError] = useState<string | null>(null);

  const fetchPaper = useCallback(async () => {
    if (!id) {
      setError('Paper ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get(`/papers/${id}`);
      if (res.data.success) {
        setPaper(res.data.data);
      } else {
        setError(res.data.message || 'Failed to load paper');
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Unauthorized – please log in again.');
      } else {
        setError(err?.response?.data?.message || 'Failed to load paper');
      }
      console.error('Error fetching paper:', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError('Paper ID is required');
      setLoading(false);
      return;
    }

    if (initialPaper && initialPaper.id === id) {
      setPaper(initialPaper);
      setLoading(false);
      setError(null);
      return;
    }

    fetchPaper();
  }, [id, initialPaper, fetchPaper]);

  return {
    paper,
    loading,
    error,
    refetch: fetchPaper,
  };
};
