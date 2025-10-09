import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainContent.css';

const MainContent: React.FC = () => {
  const navigate = useNavigate();

  const handlePublishClick = () => {
    navigate('/publish');
  };

  const handleExploreClick = () => {
    navigate('/explore');
  };

  return (
    <div className="main-content">
      <div className="top-left-branding">
        <div className="researchhub-branding">
          <div className="brand-logo">🧪</div>
          <h1 className="brand-name">ResearchHub</h1>
        </div>
      </div>
      
      <div className="dashboard-container">
        <div className="hero-section">
          <h1 className="hero-title">Find. Summarize. Collaborate.</h1>
          <p className="hero-subtitle">Accelerate your research</p>
          <div className="hero-icon">
            <div className="envelope-icon">✉️</div>
          </div>
        </div>
        
        <div className="feature-cards">
          <div className="feature-card" onClick={handleExploreClick}>
            <div className="card-icon">
              <div className="document-icon">📄</div>
            </div>
            <h3 className="card-title">Explore Papers</h3>
            <p className="card-description">Search and discover research papers from various fields</p>
          </div>
          
          <div className="feature-card">
            <div className="card-icon">
              <span className="summarize-icon">📝</span>
            </div>
            <h3 className="card-title">Summarize Papers</h3>
            <p className="card-description">Get AI-powered summaries of complex research papers</p>
          </div>
          
          <div className="feature-card" onClick={handlePublishClick}>
            <div className="card-icon">
              <span className="rocket-icon">🚀</span>
            </div>
            <h3 className="card-title">Publish Research</h3>
            <p className="card-description">Share your research with the academic community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
