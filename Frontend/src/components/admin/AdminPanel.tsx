import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, FileText, MessageSquareMore, BellRing, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import PaperModeration from './PaperModeration';
import CommentModeration from './CommentModeration';
import NotificationCenter from './NotificationCenter';
import './AdminPanel.css';

type AdminTab = 'dashboard' | 'users' | 'papers' | 'comments' | 'notifications';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  // Keep sidebar badge in sync with the unread count reported by dashboard stats
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user || user.role !== 'ADMIN') {
        setUnreadCount(0);
        return;
      }

      try {
        const stats = await adminService.getDashboardStats();
        setUnreadCount(stats?.unreadNotifications ?? 0);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load unread notifications', err);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to logout', err);
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-loading">
          <div className="loading-spinner">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>You need an administrator account to access this area.</p>
          <div className="access-denied-actions">
            <button
              className="admin-login-redirect-btn"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
            <button
              className="back-to-site-btn"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'papers', label: 'Papers', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageSquareMore },
    { id: 'notifications', label: 'Notifications', icon: BellRing }
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
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">
                  <Icon size={20} />
                </span>
                <span className="nav-label">{tab.label}</span>
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
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

