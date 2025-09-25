import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { icon: '🏠', label: 'Home', path: '/dashboard' },
    { icon: '👤', label: 'Profile', path: '/profile' },
    { icon: '📚', label: 'Library', path: '/library' },
    { icon: '🕒', label: 'Recent', path: '/recent' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="new-btn">+ New</button>
      </div>
      
      <nav className="sidebar-nav">
        {sidebarItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(item.path)}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
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