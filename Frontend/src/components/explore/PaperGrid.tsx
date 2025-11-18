import React, { useState } from 'react';
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
}

const PaperGrid: React.FC<PaperGridProps> = ({
  papers,
  loading,
  error,
  hasMore,
  onLoadMore,
  isSearching,
  title
}) => {
  const [papersWithViewCounts, setPapersWithViewCounts] = useState<PaperResponse[]>(papers);
  const headerTitle = title ?? (isSearching ? 'Search Results' : 'Recommended for You');

  // Update local papers when props change
  React.useEffect(() => {
    setPapersWithViewCounts(papers);
  }, [papers]);

  const handleViewCountUpdate = (paperId: string, newViewCount: number) => {
    setPapersWithViewCounts(prevPapers => 
      prevPapers.map(paper => 
        paper.id === paperId 
          ? { ...paper, viewCount: newViewCount }
          : paper
      )
    );
  };
  if (error) {
    return (
      <div className="paper-grid-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
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

  if (papersWithViewCounts.length === 0 && !loading) {
    return (
      <div className="paper-grid-empty">
        <div className="empty-content">
          <div className="empty-icon">
            {isSearching ? '🔍' : '📄'}
          </div>
          <h3>
            {isSearching ? 'No papers found' : 'No papers available'}
          </h3>
          <p>
            {isSearching 
              ? 'Try adjusting your search criteria or filters'
              : 'Check back later for new research papers'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-grid">
      <div className="paper-grid-header">
        <h2>
          {headerTitle}
        </h2>
        <span className="paper-count">
          {papersWithViewCounts.length} paper{papersWithViewCounts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="papers-container">
        {papersWithViewCounts.map(paper => (
          <PaperCard 
            key={paper.id} 
            paper={paper} 
            onViewCountUpdate={handleViewCountUpdate}
          />
        ))}
      </div>

      {loading && papersWithViewCounts.length > 0 && (
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
