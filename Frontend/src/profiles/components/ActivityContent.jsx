import React from 'react';
import './ActivityContent.css';

const ActivityContent = () => {
  return (
    <div className="activity-content">
      <div className="activity-center">
        <div className="decorative-elements">
          <div className="floating-dot dot-1"></div>
          <div className="floating-dot dot-2"></div>
          <div className="floating-dot dot-3"></div>
          <div className="floating-dot dot-4"></div>
          <div className="floating-dot dot-5"></div>
        </div>
        
        <div className="dashed-circle">
          <div className="illustration-container">
            <div className="browser-window">
              <div className="browser-dots">
                <div className="browser-dot red"></div>
                <div className="browser-dot yellow"></div>
                <div className="browser-dot green"></div>
              </div>
              
              <div className="browser-content">
                <div className="pen-icon">
                  <svg className="pen-svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>
                
                <div className="magnifying-glass">
                  <div className="glass-circle"></div>
                  <div className="glass-handle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="no-activity-text">
          No author activity found in this section.
        </p>
      </div>
    </div>
  );
};

export default ActivityContent;

