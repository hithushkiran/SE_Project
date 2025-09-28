import React from 'react';
import './MainContent.css';
import ActionCards from './ActionCards';

const MainContent = () => {
  return (
    <main className="main-content">
      <div className="content-area">
        <div className="welcome-section">
          <div className="welcome-header">
            <h1>Find. Summarize. Collaborate.</h1>
            <h2>Accelerate your research</h2>
            <div className="email-placeholder">
              <div className="envelope-icon">✉️</div>
            </div>
          </div>
        </div>
        
        <ActionCards />
        
        <div className="mobile-tabs">
          <button className="mobile-tab active">🏠 Home</button>
          <button className="mobile-tab">📚 Library</button>
          <button className="mobile-tab">⚙️ Settings</button>
        </div>
      </div>
    </main>
  );
};

export default MainContent;