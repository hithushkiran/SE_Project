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
  
  const handleSummariesClick = () => {
    navigate('/summary');
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
          <div className="hero-badge">
            <span className="badge-text">✨ Welcome to the future of research</span>
          </div>
          <h1 className="hero-title">
            <span className="gradient-text">Discover</span>, <span className="gradient-text">Analyze</span>, <span className="gradient-text">Collaborate</span>
          </h1>
          <p className="hero-subtitle">
            Your intelligent research companion for exploring, understanding, and sharing academic knowledge
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Research Papers</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Active Researchers</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">AI Assistance</div>
            </div>
          </div>
        </div>
        
        <div className="feature-cards">
          <div className="feature-card explore-card" onClick={handleExploreClick}>
            <div className="card-background"></div>
            <div className="card-content">
              <div className="card-icon">
                <div className="icon-wrapper explore-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
                    <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <h3 className="card-title">Explore Papers</h3>
              <p className="card-description">Search and discover research papers with advanced AI-powered filtering</p>
              <div className="card-arrow">→</div>
            </div>
          </div>
          
          <div className="feature-card summarize-card">
            <div className="card-background"></div>
            <div className="card-content">
              <div className="card-icon">
                <div className="icon-wrapper summarize-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor"/>
                    <path d="M14 2V8H20" fill="currentColor"/>
                    <path d="M16 13H8V15H16V13ZM16 17H8V19H16V17ZM10 9H8V11H10V9Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <h3 className="card-title" onClick={handleSummariesClick} style={{ cursor: 'pointer' }}>
                AI Summaries
              </h3>
              <p className="card-description">Get intelligent summaries and key insights from complex research papers</p>
              <div className="card-arrow">→</div>
            </div>
          </div>
          
          <div className="feature-card publish-card" onClick={handlePublishClick}>
            <div className="card-background"></div>
            <div className="card-content">
              <div className="card-icon">
                <div className="icon-wrapper publish-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <h3 className="card-title">Publish Research</h3>
              <p className="card-description">Share your findings with the global academic community</p>
              <div className="card-arrow">→</div>
            </div>
          </div>
        </div>
        
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={handleExploreClick}>
              <span className="btn-icon">🔍</span>
              Start Exploring
            </button>
            <button className="action-btn secondary" onClick={handlePublishClick}>
              <span className="btn-icon">📤</span>
              Upload Paper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
