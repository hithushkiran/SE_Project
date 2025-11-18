import React, { useEffect, useState } from 'react';
import { Users, FileText, Clock3, MessageSquare, BellRing } from 'lucide-react';
import { adminService, AdminDashboardStats } from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        // eslint-disable-next-line no-console
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, papers, and comments</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <div className="stat-number">{stats?.totalUsers ?? 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon papers-icon">
            <FileText size={28} />
          </div>
          <div className="stat-content">
            <h3>Total Papers</h3>
            <div className="stat-number">{stats?.totalPapers ?? 0}</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon pending-icon">
            <Clock3 size={28} />
          </div>
          <div className="stat-content">
            <h3>Pending Papers</h3>
            <div className="stat-number">{stats?.pendingPapers ?? 0}</div>
            {(stats?.pendingPapers ?? 0) > 0 && (
              <div className="stat-alert">Requires attention</div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon comments-icon">
            <MessageSquare size={28} />
          </div>
          <div className="stat-content">
            <h3>Total Comments</h3>
            <div className="stat-number">{stats?.totalComments ?? 0}</div>
          </div>
        </div>

        <div className="stat-card notifications">
          <div className="stat-icon notifications-icon">
            <BellRing size={28} />
          </div>
          <div className="stat-content">
            <h3>Unread Notifications</h3>
            <div className="stat-number">{stats?.unreadNotifications ?? 0}</div>
            {(stats?.unreadNotifications ?? 0) > 0 && (
              <div className="stat-alert">New notifications</div>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary">
            Review Pending Papers
          </button>
          <button className="action-btn secondary">
            Manage Users
          </button>
          <button className="action-btn secondary">
            Moderate Comments
          </button>
          <button className="action-btn secondary">
            View Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

