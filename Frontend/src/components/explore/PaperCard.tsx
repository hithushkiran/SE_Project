import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaperResponse } from '../../types/explore';
import { commentService } from '../../services/commentService';
import { api } from '../../api/axios';
import './PaperCard.css';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';

interface PaperCardProps {
  paper: PaperResponse;
  onClick?: (paper: PaperResponse) => void;
  initialSaved?: boolean;
  onRemovedFromLibrary?: (paperId: string) => void;
  onViewCountUpdate?: (paperId: string, newViewCount: number) => void; // notify caller when view count updates
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, onClick, initialSaved = false, onRemovedFromLibrary, onViewCountUpdate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPaperToLibrary, removePaperFromLibrary, isPaperSaved, hydrated } = useLibrary();
  const [commentCount, setCommentCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [savingLibrary, setSavingLibrary] = useState(false);
  const [viewCount, setViewCount] = useState<number>(paper.viewCount);

  useEffect(() => {
    if (hydrated) {
      setIsSaved(isPaperSaved(paper.id));
    }
  }, [hydrated, isPaperSaved, paper.id]);

  // Load comment count when component mounts
  useEffect(() => {
    const loadCommentCount = async () => {
      try {
        const response = await commentService.getCommentCount(paper.id);
        if (response.success) {
          setCommentCount(response.data);
        }
      } catch (error) {
        console.error('Failed to load comment count:', error);
      } finally {
        setLoadingCount(false);
      }
    };
    
    loadCommentCount();
  }, [paper.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const incrementViewCount = async (): Promise<PaperResponse | null> => {
    try {
      const response = await api.post(`/api/papers/${paper.id}/view`);
      if (response.data.success) {
        const newViewCount = response.data.data.viewCount;
        setViewCount(newViewCount);
        if (onViewCountUpdate) {
          onViewCountUpdate(paper.id, newViewCount);
        }
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }

    return null;
  };

  const handleClick = async () => {
    // Increment view count first
    const updatedPaper = await incrementViewCount();
    const nextPaper = updatedPaper ?? { ...paper, viewCount };

    if (onClick) {
      onClick(nextPaper);
    } else {
      // Default navigation to paper details
      const navigationState = updatedPaper ? { state: { paper: updatedPaper } } : undefined;
      navigate(`/papers/${paper.id}`, navigationState);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement download functionality
    console.log('Download paper:', paper.id);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/papers/${paper.id}/comments`);
  };

  const getLibraryError = (err: unknown): string => {
    if (typeof err === 'object' && err !== null) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message;
      if (message) {
        return message;
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Unable to update your library. Please try again.';
  };

  const handleToggleLibrary = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      window.alert('Please sign in to manage your library.');
      return;
    }
    if (savingLibrary) {
      return;
    }

    const nextState = !isSaved;
    setIsSaved(nextState);
    setSavingLibrary(true);

    try {
      if (nextState) {
        await addPaperToLibrary(paper);
      } else {
        await removePaperFromLibrary(paper.id);
        if (onRemovedFromLibrary) {
          onRemovedFromLibrary(paper.id);
        }
      }
    } catch (error) {
      const message = getLibraryError(error);
      setIsSaved(!nextState);
      window.alert(message);
      console.error('[library] toggle failed', paper.id, error);
    } finally {
      setSavingLibrary(false);
    }
  };

  return (
    <div 
      className="paper-card" 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="paper-header">
        <div className="paper-icon">📄</div>
        <div className="paper-actions">
          <button 
            className="comment-button"
            onClick={handleCommentClick}
            title="View comments"
          >
            💬
            {!loadingCount && (
              <span className="comment-count">{commentCount}</span>
            )}
          </button>
          <button
            className={`bookmark-button${isSaved ? ' saved' : ''}`}
            onClick={handleToggleLibrary}
            disabled={savingLibrary}
            title={isSaved ? 'Saved' : 'Add to Library'}
          >
            {isSaved ? '📘' : '📑'}
          </button>
          <button 
            className="download-button"
            onClick={handleDownload}
            title="Download paper"
          >
            ⬇️
          </button>
        </div>
      </div>

      <div className="paper-content">
        <h3 className="paper-title" title={paper.title}>
          {paper.title}
        </h3>
        
        <div className="paper-meta">
          <div className="paper-author">
            <span className="author-label">Author:</span>
            <span className="author-name">{paper.author}</span>
          </div>
          
          {paper.publicationYear && (
            <div className="paper-year">
              <span className="year-label">Year:</span>
              <span className="year-value">{paper.publicationYear}</span>
            </div>
          )}
        </div>

        <p className="paper-abstract">
          {paper.abstractSnippet}
        </p>

        {paper.categories && paper.categories.length > 0 && (
          <div className="paper-categories">
            {paper.categories.slice(0, 3).map(category => (
              <span key={category.id} className="category-tag">
                {category.name}
              </span>
            ))}
            {paper.categories.length > 3 && (
              <span className="category-more">
                +{paper.categories.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="paper-footer">
          <div className="paper-date">
            Uploaded {formatDate(paper.uploadedAt)}
          </div>
          <div className="paper-status">
            Available
          </div>
        </div>

        <div className="paper-view-count">
          👁️ {viewCount} views
        </div>
      </div>
    </div>
  );
};

export default PaperCard;
