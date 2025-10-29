import { useState, useCallback, useRef } from 'react';
import { PaperResponse, ExploreFilters } from '../types/explore';
import { api } from '../services/api';

type ExploreMode = 'recommended' | 'search' | 'trending';

interface UseExploreReturn {
  papers: PaperResponse[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  searchPapers: (filters: ExploreFilters) => Promise<void>;
  loadTrendingPapers: (page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  resetSearch: () => void;
}

export const useExplore = (): UseExploreReturn => {
  const [papers, setPapers] = useState<PaperResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<ExploreFilters | null>(null);
  const [mode, setMode] = useState<ExploreMode>('recommended');
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const buildQueryParams = (filters: ExploreFilters, page: number = 0) => {
    const params = new URLSearchParams();
    
    if (filters.query) {
      params.append('query', filters.query);
    }
    
    if (filters.categories.length > 0) {
      params.append('categories', filters.categories.join(','));
    }
    
    if (filters.year) {
      params.append('year', filters.year.toString());
    }
    
    if (filters.author) {
      params.append('author', filters.author);
    }
    
    params.append('page', page.toString());
    params.append('size', '20');
    
    return params.toString();
  };

  const searchPapers = useCallback(async (filters: ExploreFilters) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setCurrentPage(0);
    setCurrentFilters(filters);
    setMode('search');

    try {
      const queryParams = buildQueryParams(filters, 0);
      const response = await api.get(
        `/explore?${queryParams}`,
        { signal: abortControllerRef.current.signal }
      );

      if (response.data.success) {
        const data = response.data.data;
        setPapers(data.content || []);
        setHasMore(!data.last);
        setCurrentPage(0);
      } else {
        setError(response.data.message || 'Failed to fetch papers');
        setPapers([]);
        setHasMore(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      console.error('Error searching papers:', err);
      setError(err.response?.data?.message || 'Failed to search papers');
      setPapers([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrendingPapers = useCallback(async (page: number = 0) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setCurrentFilters(null);
    setMode('trending');

    try {
      const response = await api.get(
        `/explore/trending?page=${page}&size=20`,
        { signal: abortControllerRef.current.signal }
      );

      if (response.data.success) {
        const data = response.data.data;
        const content = data.content || [];
        if (page === 0) {
          setPapers(content);
        } else {
          setPapers(prev => [...prev, ...content]);
        }
        setHasMore(!data.last);
        setCurrentPage(page);
      } else {
        setError(response.data.message || 'Failed to fetch trending papers');
        if (page === 0) {
          setPapers([]);
        }
        setHasMore(false);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching trending papers:', err);
      setError(err.response?.data?.message || 'Failed to fetch trending papers');
      if (page === 0) {
        setPapers([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      let response;

      if (mode === 'search' && currentFilters) {
        const queryParams = buildQueryParams(currentFilters, nextPage);
        response = await api.get(
          `/explore?${queryParams}`,
          { signal: abortControllerRef.current.signal }
        );
      } else if (mode === 'trending') {
        response = await api.get(
          `/explore/trending?page=${nextPage}&size=20`,
          { signal: abortControllerRef.current.signal }
        );
      } else {
        response = await api.get(
          `/explore?page=${nextPage}&size=20`,
          { signal: abortControllerRef.current.signal }
        );
      }

      if (response.data.success) {
        const data = response.data.data;
        setPapers(prev => [...prev, ...(data.content || [])]);
        setHasMore(!data.last);
        setCurrentPage(nextPage);
      } else {
        setError(response.data.message || 'Failed to load more papers');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      console.error('Error loading more papers:', err);
      setError(err.response?.data?.message || 'Failed to load more papers');
    } finally {
      setLoading(false);
    }
  }, [currentFilters, loading, hasMore, currentPage, mode]);

  const resetSearch = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);
    setCurrentPage(0);
    setCurrentFilters(null);
    setMode('recommended');

    // Load recommended papers (no filters)
    const loadRecommended = async () => {
      try {
        const response = await api.get(
          '/explore?page=0&size=20'
        );

        if (response.data.success) {
          const data = response.data.data;
          setPapers(data.content || []);
          setHasMore(!data.last);
          setCurrentPage(0);
        } else {
          setError(response.data.message || 'Failed to fetch recommended papers');
          setPapers([]);
          setHasMore(false);
        }
      } catch (err: any) {
        console.error('Error loading recommended papers:', err);
        setError(err.response?.data?.message || 'Failed to load recommended papers');
        setPapers([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadRecommended();
  }, []);

  return {
    papers,
    loading,
    error,
    hasMore,
    currentPage,
    searchPapers,
    loadTrendingPapers,
    loadMore,
    resetSearch
  };
};
