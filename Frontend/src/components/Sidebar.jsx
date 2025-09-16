import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const sidebarItems = [
    { icon: '🏠', label: 'Home', active: true },
    { icon: '👤', label: 'Profile' },
    { icon: '📚', label: 'Library' },
    { icon: '🕒', label: 'Recent' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="new-btn">+ New</button>
      </div>
      
      <nav className="sidebar-nav">
        {sidebarItems.map((item, index) => (
          <a 
            key={index} 
            href="#" 
            className={`sidebar-item ${item.active ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </a>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="social-links">
          <a href="#" className="social-link">𝕏</a>
          <a href="#" className="social-link">💬</a>
          <a href="#" className="social-link">🐙</a>
          <a href="#" className="social-link">💼</a>
        </div>
        <div className="footer-links">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Issues</a>
          <a href="#">Docs</a>
        </div>
        <div className="footer-links">
          <a href="#">Support</a>
          <a href="#">Foundation</a>
          <a href="#">About</a>
        </div>
        
      </div>
    </aside>
  );
};

export default Sidebar;