import React, { useCallback, useEffect, useState } from 'react';
import { libraryApi } from '../services/libraryApi';
import { PaperResponse } from '../types/explore';
import { LibraryItem } from '../types/library';
import PaperCard from '../components/explore/PaperCard';
import '../components/explore/PaperGrid.css';
import { useAuth } from '../contexts/AuthContext';

const LibraryPage: React.FC = () => {
  const [papers, setPapers] = useState<PaperResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadLibrary = useCallback(async () => {
    try {
      if (!user?.id) {
        setPapers([]);
        setLoading(false);
        return;
      }
      const page = await libraryApi.list();
      const savedItems: LibraryItem[] = page?.content ?? [];
      const mappedPapers: PaperResponse[] = savedItems.map(item => ({
        id: item.paperId,
        title: item.title,
        author: item.author,
        abstractSnippet: item.abstractSnippet,
        uploadedAt: item.uploadedAt,
        publicationYear: item.publicationYear,
        filePath: item.filePath,
        viewCount: item.viewCount,
        categories: item.categories ?? [],
      }));
      const uniqueById = mappedPapers.length
        ? Array.from(new Map(mappedPapers.map(paper => [paper.id, paper])).values())
        : [];
      console.debug('[lib] library:set', { count: uniqueById.length });
      setPapers(uniqueById);
      setError(null);
    } catch (err: any) {
      console.error('[lib] library:load failed', err?.response?.status, err?.response?.data ?? err);
      setError(err?.response?.data?.message || 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    const handleLibraryUpdated = () => {
      if (!user?.id) return;
      void loadLibrary();
    };

    window.addEventListener('library:updated', handleLibraryUpdated);
    return () => window.removeEventListener('library:updated', handleLibraryUpdated);
  }, [loadLibrary, user?.id]);

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


