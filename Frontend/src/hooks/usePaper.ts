import { useState, useEffect } from 'react';
import { PaperResponse } from '../types/explore';

const API_BASE = 'http://localhost:8081';

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
      const response = await fetch(`${API_BASE}/api/papers/${id}`, {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaper(data.data);
      } else {
        setError(data.message || 'Failed to load paper');
      }
    } catch (err) {
      setError('Failed to load paper');
      console.error('Error fetching paper:', err);
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
