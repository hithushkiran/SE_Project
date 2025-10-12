import React, { useState, useEffect } from 'react';
import { notificationService, NotificationResponse } from '../services/notificationService';
import './NotificationsPage.css';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(currentPage, 10);
      setNotifications(response);
      // Note: API should return pagination info
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      setError('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      setError('Failed to delete notification');
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      'PAPER_APPROVED': '✅',
      'PAPER_REJECTED': '❌',
      'COMMENT_APPROVED': '✅',
      'COMMENT_REJECTED': '❌',
      'USER_SUSPENDED': '⏸️',
      'USER_ACTIVATED': '▶️',
      'SYSTEM_ANNOUNCEMENT': '📢'
    };
    return icons[type as keyof typeof icons] || '🔔';
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      'PAPER_APPROVED': '#28a745',
      'PAPER_REJECTED': '#dc3545',
      'COMMENT_APPROVED': '#28a745',
      'COMMENT_REJECTED': '#dc3545',
      'USER_SUSPENDED': '#6c757d',
      'USER_ACTIVATED': '#28a745',
      'SYSTEM_ANNOUNCEMENT': '#6f42c1'
    };
    return colors[type as keyof typeof colors] || '#6c757d';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="loading-spinner">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
        <div className="header-actions">
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every(n => n.isRead)}
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>No Notifications</h3>
          <p>You're all caught up! No notifications at the moment.</p>
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
                      {formatDate(notification.createdAt)}
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
                </div>
              </div>

              <div className="notification-actions">
                {!notification.isRead && (
                  <button 
                    className="mark-read-btn"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  Delete
                </button>
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

export default NotificationsPage;
