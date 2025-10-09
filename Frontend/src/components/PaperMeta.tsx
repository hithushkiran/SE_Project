import React from 'react';
import './PaperMeta.css';

interface PaperMetaProps {
  author: string;
  publicationYear: number | null;
  uploadedAt: string;
}

const PaperMeta: React.FC<PaperMetaProps> = ({ author, publicationYear, uploadedAt }) => {
  return (
    <div className="paper-meta">
      <div className="meta-item">
        <span className="meta-label">Author:</span>
        <span className="meta-value">{author}</span>
      </div>
      
      {publicationYear && (
        <div className="meta-item">
          <span className="meta-label">Publication Year:</span>
          <span className="meta-value">{publicationYear}</span>
        </div>
      )}
      
      <div className="meta-item">
        <span className="meta-label">Uploaded:</span>
        <span className="meta-value">{uploadedAt}</span>
      </div>
    </div>
  );
};

export default PaperMeta;
