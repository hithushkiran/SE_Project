import React, { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XOctagon,
  MessageCircleWarning,
  BellRing,
  UserRoundMinus,
  UserRoundPlus,
  Megaphone
} from 'lucide-react';
import { adminService, NotificationResponse } from '../../services/adminService';
import './NotificationCenter.css';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminService.getNotifications(currentPage, 10);
      setNotifications(response);
      // TODO: update total pages when backend adds pagination metadata
      setTotalPages(response.length === 10 ? currentPage + 2 : currentPage + 1);
    } catch (err) {
      setError('Failed to load notifications');
      // eslint-disable-next-line no-console
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await adminService.markNotificationAsRead(notificationId);
      await fetchNotifications();
    } catch (err) {
      setError('Failed to mark notification as read');
      // eslint-disable-next-line no-console
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      PAPER_SUBMITTED: <FileText size={18} />,
      PAPER_APPROVED: <CheckCircle2 size={18} />,
      PAPER_REJECTED: <XOctagon size={18} />,
      COMMENT_REPORTED: <MessageCircleWarning size={18} />,
      COMMENT_APPROVED: <CheckCircle2 size={18} />,
      COMMENT_REJECTED: <XOctagon size={18} />,
      USER_REGISTERED: <UserRoundPlus size={18} />,
      USER_SUSPENDED: <UserRoundMinus size={18} />,
      USER_ACTIVATED: <UserRoundPlus size={18} />,
      SYSTEM_ANNOUNCEMENT: <Megaphone size={18} />
    };
    return iconMap[type] || <BellRing size={18} />;
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      PAPER_SUBMITTED: '#3498db',
      PAPER_APPROVED: '#28a745',
      PAPER_REJECTED: '#dc3545',
      COMMENT_REPORTED: '#ffc107',
      COMMENT_APPROVED: '#28a745',
      COMMENT_REJECTED: '#dc3545',
      USER_REGISTERED: '#17a2b8',
      USER_SUSPENDED: '#6c757d',
      USER_ACTIVATED: '#28a745',
      SYSTEM_ANNOUNCEMENT: '#6f42c1'
    };
    return colors[type] || '#6c757d';
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="notification-center">
        <div className="loading-spinner">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h1>Notification Center</h1>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={fetchNotifications}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <BellRing size={40} />
          </div>
          <h3>No Notifications</h3>
          <p>You're all caught up! No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-header">
                  <h3 className="notification-title">{notification.title}</h3>
                  <div className="notification-meta">
                    <span className="notification-time">
                      {getRelativeTime(notification.createdAt)}
                    </span>
                    {!notification.isRead && (
                      <span className="unread-indicator">New</span>
                    )}
                  </div>
                </div>

                <p className="notification-message">{notification.message}</p>

                <div className="notification-footer">
                  <span
                    className="notification-type"
                    style={{ color: getNotificationColor(notification.type) }}
                  >
                    {notification.type.replace(/_/g, ' ')}
                  </span>

                  {notification.relatedEntityId && (
                    <span className="related-entity">
                      Related: {notification.relatedEntityType} #{notification.relatedEntityId.substring(0, 8)}...
                    </span>
                  )}

                  {!notification.isRead && (
                    <button
                      className="mark-read-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

