import React from 'react';
import { PaperResponse } from '../types/explore';
import CategoryChips from './CategoryChips';
import PaperMeta from './PaperMeta';
import ViewPdfButton from './ViewPdfButton';
import './PaperDetailsCard.css';

interface PaperDetailsCardProps {
  paper: PaperResponse;
}

const PaperDetailsCard: React.FC<PaperDetailsCardProps> = ({ paper }) => {
  // Debug logging
  React.useEffect(() => {
    console.log('Paper details:', paper);
    console.log('Categories:', paper.categories);
    console.log('Categories length:', paper.categories?.length);
  }, [paper]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAbstractText = () => {
    if (paper.abstractSnippet) {
      return paper.abstractSnippet;
    }
    return 'No abstract available.';
  };

  return (
    <div className="paper-details-card">
      <div className="paper-header">
        <h1 className="paper-title">{paper.title}</h1>
        <ViewPdfButton filePath={paper.filePath} />
      </div>

      <PaperMeta 
        author={paper.author}
        publicationYear={paper.publicationYear}
        uploadedAt={formatDate(paper.uploadedAt)}
      />

      <div className="paper-categories-section">
        <h3>Categories</h3>
        {paper.categories && paper.categories.length > 0 ? (
          <CategoryChips categories={paper.categories} />
        ) : (
          <p style={{ color: '#718096', fontStyle: 'italic' }}>No categories assigned</p>
        )}
      </div>

      <div className="paper-abstract-section">
        <h3>Abstract</h3>
        <div className="abstract-content">
          {getAbstractText()}
        </div>
      </div>
    </div>
  );
};

export default PaperDetailsCard;
