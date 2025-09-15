import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">🧪</div>
          <span className="logo-text">ResearchHub</span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="explore-section">
          <h2>Explore</h2>
          <p>Discover trending research, earning, and funding opportunities</p>
        </div>
      </div>
      
      <div className="header-right">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search ResearchHub..." 
            className="search-input"
          />
          <span className="search-shortcut">Ctrl+K</span>
        </div>
        <div className="user-actions">
          <button className="notification-btn">🔔</button>
          <div className="user-avatar">U</div>
        </div>
      </div>
    </header>
  );
};

export default Header;