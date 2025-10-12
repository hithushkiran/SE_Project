import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import PaperModeration from './PaperModeration';
import CommentModeration from './CommentModeration';
import NotificationCenter from './NotificationCenter';
import './AdminPanel.css';

type AdminTab = 'dashboard' | 'users' | 'papers' | 'comments' | 'notifications';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      // Redirect non-admin users to admin login
      window.location.href = '/admin/login';
    }
  }, [user]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-panel">
      <div className="access-denied">
        <h1>Access Denied</h1>
        <p>You do not have permission to access the admin panel.</p>
        <div className="access-denied-actions">
          <button 
            className="admin-login-redirect-btn"
            onClick={() => window.location.href = '/admin/login'}
          >
            Go to Admin Login
          </button>
          <button 
            className="back-to-site-btn"
            onClick={() => window.location.href = '/'}
          >
            Back to Site
          </button>
        </div>
      </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: '📊' },
    { id: 'users' as AdminTab, label: 'Users', icon: '👥' },
    { id: 'papers' as AdminTab, label: 'Papers', icon: '📄' },
    { id: 'comments' as AdminTab, label: 'Comments', icon: '💬' },
    { id: 'notifications' as AdminTab, label: 'Notifications', icon: '🔔' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'papers':
        return <PaperModeration />;
      case 'comments':
        return <CommentModeration />;
      case 'notifications':
        return <NotificationCenter />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <div className="admin-info">
            <div className="admin-avatar">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="admin-details">
              <div className="admin-name">{user.fullName}</div>
              <div className="admin-role">Administrator</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
              {tab.id === 'notifications' && unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={() => window.location.href = '/'}
          >
            ← Back to Site
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="content-header">
          <h1>{tabs.find(tab => tab.id === activeTab)?.label}</h1>
          <div className="header-actions">
            <div className="admin-status">
              <span className="status-indicator"></span>
              Online
            </div>
          </div>
        </div>

        <div className="content-body">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
