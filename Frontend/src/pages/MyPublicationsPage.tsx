import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPublications } from '../services/api';
import { ApiResponse, PaginatedResponse, PaperResponse } from '../types/explore';
import PaperGrid from '../components/explore/PaperGrid';
import './ExplorePage.css';

const MyPublicationsPage: React.FC = () => {
  const [papers, setPapers] = useState<PaperResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async (pageToLoad: number) => {
    setLoading(true);
    setError(null);
    try {
      const res: ApiResponse<PaginatedResponse<PaperResponse>> = await getMyPublications(pageToLoad, 20);
      if (res.success) {
        const data = res.data;
        setPapers(prev => pageToLoad === 0 ? (data.content || []) : [...prev, ...(data.content || [])]);
        setHasMore(!data.last);
        setPage(pageToLoad);
      } else {
        setError(res.message || 'Failed to load publications');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  const onLoadMore = useCallback(() => {
    if (loading || !hasMore) return;
    load(page + 1);
  }, [load, page, loading, hasMore]);

  return (
    <div className="explore-page">
      <div className="explore-layout">
        <div className="explore-content">
          <div className="explore-header">
            <h1>My Publications</h1>
          </div>

          {papers.length === 0 && !loading && !error ? (
            <div className="paper-grid-empty">
              <div className="empty-content">
                <div className="empty-icon">📄</div>
                <h3>You haven’t uploaded any papers yet.</h3>
                {/* Optional future action: upload button */}
              </div>
            </div>
          ) : (
            <PaperGrid
              papers={papers}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
              isSearching={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPublicationsPage;


