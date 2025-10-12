import React, { useEffect, useState } from 'react';
import { libraryService } from '../services/libraryService';
import { PaperResponse } from '../types/explore';
import PaperCard from '../components/explore/PaperCard';
import '../components/explore/PaperGrid.css';
import { useAuth } from '../contexts/AuthContext';

const LibraryPage: React.FC = () => {
  const [papers, setPapers] = useState<PaperResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        if (!user?.id) {
          setPapers([]);
          setLoading(false);
          return;
        }
        const saved = await libraryService.getUserLibrary(user.id);
        setPapers(saved || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load library');
      } finally {
        setLoading(false);
      }
    };
    loadLibrary();
  }, [user?.id]);

  const handleRemoved = (paperId: string) => {
    setPapers(prev => prev.filter(p => p.id !== paperId));
  };

  if (loading) {
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
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-grid">
      <div className="paper-grid-header">
        <h2>Your Library</h2>
        <span className="paper-count">{papers.length} saved</span>
      </div>
      <div className="papers-container">
        {papers.map(paper => (
          <PaperCard
            key={paper.id}
            paper={paper}
            initialSaved={true}
            onRemovedFromLibrary={handleRemoved}
          />
        ))}
      </div>
      {papers.length === 0 && (
        <div className="paper-grid-empty">
          <div className="empty-content">
            <div className="empty-icon">📚</div>
            <h3>No saved papers</h3>
            <p>Use the bookmark on Explore to add papers here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;


