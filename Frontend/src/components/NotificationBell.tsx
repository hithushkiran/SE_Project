import React, { useState, useEffect } from 'react';
import { notificationService, NotificationResponse } from '../services/notificationService';
import './NotificationBell.css';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(0, 5);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!showDropdown) {
      fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await fetchUnreadCount();
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await fetchUnreadCount();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell"
        onClick={handleBellClick}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {notifications.some(n => !n.isRead) && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="loading">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="empty">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.createdAt)}</div>
                  </div>
                  {!notification.isRead && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="dropdown-footer">
              <button 
                className="view-all-btn"
                onClick={() => window.location.href = '/notifications'}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
