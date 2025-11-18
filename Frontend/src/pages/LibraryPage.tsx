import React, { useEffect } from 'react';
import PaperCard from '../components/explore/PaperCard';
import '../components/explore/PaperGrid.css';
import { useLibrary } from '../contexts/LibraryContext';

const LibraryPage: React.FC = () => {
  const { savedPapers, loading, error, hydrated, refreshLibrary } = useLibrary();

  useEffect(() => {
    if (!hydrated) {
      void refreshLibrary();
    }
  }, [hydrated, refreshLibrary]);

  const isLoading = loading && !hydrated;

  if (isLoading) {
    return (
      <div className="paper-grid-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paper-grid-error">
        <div className="error-content">
          <div className="error-icon">�s��,?</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => void refreshLibrary()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-grid">
      <div className="paper-grid-header">
        <h2>Your Library</h2>
        <span className="paper-count">{savedPapers.length} saved</span>
      </div>
      <div className="papers-container">
        {savedPapers.map(paper => (
          <PaperCard
            key={paper.id}
            paper={paper}
            initialSaved={true}
          />
        ))}
      </div>
      {savedPapers.length === 0 && (
        <div className="paper-grid-empty">
          <div className="empty-content">
            <div className="empty-icon">dY"s</div>
            <h3>No saved papers</h3>
            <p>Use the bookmark on Explore to add papers here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
