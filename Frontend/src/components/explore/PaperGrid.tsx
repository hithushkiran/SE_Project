import React from 'react';
import PaperCard from './PaperCard';
import { PaperResponse } from '../../types/explore';
import './PaperGrid.css';

interface PaperGridProps {
  papers: PaperResponse[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  isSearching: boolean;
  title?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

const PaperGrid: React.FC<PaperGridProps> = ({
  papers,
  loading,
  error,
  hasMore,
  onLoadMore,
  isSearching,
  title,
  emptyTitle,
  emptyMessage
}) => {
  const headerTitle = title ?? (isSearching ? 'Search Results' : 'Recommended for You');
  const emptyStateTitle = emptyTitle ?? (isSearching ? 'No papers found' : 'No papers available');
  const emptyStateMessage =
    emptyMessage ??
    (isSearching
      ? 'Try adjusting your search criteria or filters'
      : 'Check back later for new research papers');
  const emptyIcon = isSearching ? '�Y"?' : '�Y""';

  if (error) {
    return (
      <div className="paper-grid-error">
        <div className="error-content">
          <div className="error-icon">�s���?</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading && papers.length === 0) {
    return (
      <div className="paper-grid-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading papers...</p>
        </div>
      </div>
    );
  }

  if (papers.length === 0 && !loading) {
    return (
      <div className="paper-grid-empty">
        <div className="empty-content">
          <div className="empty-icon">{emptyIcon}</div>
          <h3>{emptyStateTitle}</h3>
          <p>{emptyStateMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-grid">
      <div className="paper-grid-header">
        <h2>{headerTitle}</h2>
        <span className="paper-count">
          {papers.length} paper{papers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="papers-container">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>

      {loading && papers.length > 0 && (
        <div className="loading-more">
          <div className="loading-spinner small"></div>
          <span>Loading more papers...</span>
        </div>
      )}

      {hasMore && !loading && (
        <div className="load-more-container">
          <button onClick={onLoadMore} className="load-more-button">
            Load More Papers
          </button>
        </div>
      )}
    </div>
  );
};

export default PaperGrid;
