import React from 'react';
import { PaperResponse } from '../../types/explore';
import './PaperCard.css';
// import { useNavigate } from 'react-router-dom';

interface PaperCardProps {
  paper: PaperResponse;
  onClick?: (paper: PaperResponse) => void;
}

const PaperCard: React.FC<PaperCardProps> = ({ paper, onClick }) => {
  // const navigate = useNavigate();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClick = () => {
    if (onClick) {
      onClick(paper);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement download functionality
    console.log('Download paper:', paper.id);
  };

  return (
    <div className="paper-card" onClick={handleClick}>
      <div className="paper-header">
        <div className="paper-icon">📄</div>
        <div className="paper-actions">
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
      </div>
    </div>
  );
};

export default PaperCard;
