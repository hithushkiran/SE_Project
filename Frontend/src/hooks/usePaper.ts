import { useState, useEffect } from 'react';
import { PaperResponse } from '../types/explore';
import { api } from '../services/api';

interface UsePaperResult {
  paper: PaperResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePaper = (id: string | undefined): UsePaperResult => {
  const [paper, setPaper] = useState<PaperResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaper = async () => {
    if (!id) {
      setError('Paper ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get(`papers/${id}`);
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
  };

  useEffect(() => {
    fetchPaper();
  }, [id]);

  return {
    paper,
    loading,
    error,
    refetch: fetchPaper,
  };
};
