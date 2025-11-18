import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePaper } from '../hooks/usePaper';
import PaperDetailsCard from '../components/PaperDetailsCard';
import './PaperDetailsPage.css';
import { PaperResponse } from '../types/explore';

const PaperDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { paper?: PaperResponse } | null;
  const initialPaper = locationState?.paper;
  const { paper, loading, error } = usePaper(id, initialPaper);

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
