import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaperCard from '../components/explore/PaperCard';
import { paperService, PaperResponse, PaginatedResponse } from '../services/paperService';
import './MyPublicationsPage.css';

interface PaperGridState {
  papers: PaperResponse[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
}

const MyPublicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<PaperGridState>({
    papers: [],
    loading: true,
    error: null,
    hasMore: false,
    totalPages: 0,
    currentPage: 0
  });

  const loadPublications = async (page: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const response: PaginatedResponse<PaperResponse> = await paperService.getMyPublications(page, 10);
      
      setState(prev => ({
        ...prev,
        papers: append ? [...prev.papers, ...response.content] : response.content,
        loading: false,
        hasMore: !response.last,
        totalPages: response.totalPages,
        currentPage: response.pageable.pageNumber
      }));

    } catch (error) {
      console.error('Failed to load publications:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load publications'
      }));
    }
  };

  // Load publications on component mount
  useEffect(() => {
    loadPublications(0, false);
  }, []);

  const handleLoadMore = () => {
    if (state.hasMore && !state.loading) {
      loadPublications(state.currentPage + 1, true);
    }
  };

  const handleBackToProfile = () => {
    navigate('/profile');
  };

  const renderEmptyState = () => (
    <div className="publications-empty">
      <div className="empty-content">
        <div className="empty-icon">📚</div>
        <h3>You haven't uploaded any papers yet</h3>
        <p>Start sharing your research with the community by uploading your first paper.</p>
        <button className="explore-button" onClick={() => navigate('/explore')}>
          Browse Papers
        </button>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="publications-error">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{state.error}</p>
        <button onClick={() => loadPublications(0, false)} className="retry-button">
          Try Again
        </button>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="publications-loading">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p>Loading your publications...</p>
      </div>
    </div>
  );

  return (
    <div className="my-publications-page">
      {/* Header */}
      <div className="publications-header">
        <div className="header-content">
          <button className="back-button" onClick={handleBackToProfile}>
            ← Back to Profile
          </button>
          <h1>My Publications</h1>
          <p>Manage and view your uploaded research papers</p>
        </div>
      </div>

      <div className="publications-content">
        {/* Stats Section */}
        <div className="publications-stats">
          <div className="stats-card">
            <div className="stat-item">
              <span className="stat-number">{state.papers.length}</span>
              <span className="stat-label">Publications</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{state.totalPages}</span>
              <span className="stat-label">Pages</span>
            </div>
          </div>
    </div>

        {/* Main Content */}
        <div className="publications-main">
          {/* Error State */}
          {state.error && !state.loading && renderErrorState()}
          
          {/* Loading State (initial load) */}
          {state.loading && state.papers.length === 0 && renderLoadingState()}
          
          {/* Empty State */}
          {!state.loading && !state.error && state.papers.length === 0 && renderEmptyState()}
          
          {/* Papers Grid */}
          {!state.loading && !state.error && state.papers.length > 0 && (
            <div className="publications-grid">
              <div className="grid-header">
                <h2>Your Publications</h2>
                <span className="paper-count">
                  {state.papers.length} paper{state.papers.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="papers-container">
                {state.papers.map(paper => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>

              {/* Load More */}
              {state.loading && state.papers.length > 0 && (
                <div className="loading-more">
                  <div className="loading-spinner small"></div>
                  <span>Loading more papers...</span>
                </div>
              )}

              {state.hasMore && !state.loading && (
                <div className="load-more-container">
                  <button onClick={handleLoadMore} className="load-more-button">
                    Load More Papers
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPublicationsPage;
