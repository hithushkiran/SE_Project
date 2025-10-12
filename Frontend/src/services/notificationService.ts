import { api } from './api';

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export const notificationService = {
  async getNotifications(page = 0, size = 10): Promise<NotificationResponse[]> {
    const response = await api.get(`/notifications?page=${page}&size=${size}`);
    return response.data.data;
  },

  async getUnreadNotifications(): Promise<NotificationResponse[]> {
    const response = await api.get('/notifications/unread');
    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/count');
    return response.data.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.post(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  }
};
