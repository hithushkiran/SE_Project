import React from 'react';
import './AiUnderstanding.css';

interface AiUnderstandingProps {
  keywords?: string | null;
  categories?: string[] | null;
  author?: string | null;
  year?: number | null;
}

const AiUnderstanding: React.FC<AiUnderstandingProps> = ({
  keywords,
  categories,
  author,
  year
}) => {
  const hasFilters = keywords || (categories && categories.length > 0) || author || year;
  
  if (!hasFilters) {
    return (
      <div className="ai-understanding-box">
        <div className="ai-understanding-title">✨ AI Search Active</div>
        <div className="ai-understanding-subtitle">No specific filters detected. Searching all papers...</div>
      </div>
    );
  }
  
  return (
    <div className="ai-understanding-box">
      <div className="ai-understanding-title">✨ AI understood your search as:</div>
      <div className="ai-filters">
        {keywords && (
          <div className="ai-filter-chip">
            <span className="ai-filter-label">Keywords:</span>
            <span>{keywords}</span>
          </div>
        )}
        {categories && categories.length > 0 && (
          <div className="ai-filter-chip">
            <span className="ai-filter-label">Categories:</span>
            <span>{categories.join(', ')}</span>
          </div>
        )}
        {author && (
          <div className="ai-filter-chip">
            <span className="ai-filter-label">Author:</span>
            <span>{author}</span>
          </div>
        )}
        {year && (
          <div className="ai-filter-chip">
            <span className="ai-filter-label">Year:</span>
            <span>{year}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiUnderstanding;
