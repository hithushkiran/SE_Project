import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">🧪</div>
          <span className="logo-text">ResearchHub</span>
        </div>
      </div>
      
      <div className="header-right">
        
        <div className="user-actions">
          <NotificationBell />
          
          {/* User dropdown or menu */}
          <div className="user-menu">
            <div 
              className="user-avatar" 
              onClick={handleProfileClick}
              title={user?.fullName || user?.email}
            >
              {getUserInitial()}
            </div>
            
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-name">{user?.fullName || 'User'}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <button className="dropdown-item" onClick={handleProfileClick}>
                👤 Profile
              </button>
              {user?.role === 'ADMIN' && (
                <button className="dropdown-item admin-item" onClick={handleAdminClick}>
                  ⚙️ Admin Panel
                </button>
              )}
              <button className="dropdown-item" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;