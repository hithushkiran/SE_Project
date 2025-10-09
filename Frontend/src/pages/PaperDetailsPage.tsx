import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePaper } from '../hooks/usePaper';
import PaperDetailsCard from '../components/PaperDetailsCard';
import './PaperDetailsPage.css';

const PaperDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { paper, loading, error } = usePaper(id);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="paper-details-page">
        <button className="back-button" onClick={handleBack}>&larr; Back</button>
        <div className="paper-details-loading">Loading paper details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paper-details-page">
        <button className="back-button" onClick={handleBack}>&larr; Back</button>
        <div className="paper-details-error">
          <h2>Error loading paper</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="paper-details-page">
        <button className="back-button" onClick={handleBack}>&larr; Back</button>
        <div className="paper-details-error">
          <h2>Paper not found</h2>
          <p>The paper you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-details-page">
      <button className="back-button" onClick={handleBack}>&larr; Back</button>
      <PaperDetailsCard paper={paper} />
    </div>
  );
};

export default PaperDetailsPage;
