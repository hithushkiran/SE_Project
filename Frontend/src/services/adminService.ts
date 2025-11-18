import { api } from './api';

export interface AdminDashboardStats {
  totalUsers: number;
  totalPapers: number;
  pendingPapers: number;
  totalComments: number;
  unreadNotifications: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminPaper {
  id: string;
  title: string;
  author: string;
  filePath: string;
  uploadedAt: string;
  publicationYear: number;
  abstractText: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedAt?: string;
}

export interface AdminComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  paperId: string;
  createdAt: string;
  edited: boolean;
  status: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';
  moderationReason?: string;
  moderatedAt?: string;
}

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

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },

  // User Management
  async getAllUsers(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Promise<PaginatedResponse<AdminUser>> {
    const response = await api.get(`/admin/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
    return response.data.data;
  },

  async getUserById(userId: string): Promise<AdminUser> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  async suspendUser(userId: string, reason?: string): Promise<void> {
    await api.post(`/admin/users/${userId}/suspend`, reason || 'No reason provided');
  },

  async activateUser(userId: string): Promise<void> {
    await api.post(`/admin/users/${userId}/activate`);
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  // Paper Moderation
  async getAllPapers(page = 0, size = 10, status?: string, sortBy = 'uploadedAt', sortDir = 'desc'): Promise<PaginatedResponse<AdminPaper>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });
    if (status) params.append('status', status);
    
    const response = await api.get(`/admin/papers?${params}`);
    return response.data.data;
  },

  async getPendingPapers(page = 0, size = 10): Promise<PaginatedResponse<AdminPaper>> {
    const response = await api.get(`/admin/papers/pending?page=${page}&size=${size}`);
    return response.data.data;
  },

  async approvePaper(paperId: string): Promise<void> {
    await api.post(`/admin/papers/${paperId}/approve`);
  },

  async rejectPaper(paperId: string, reason: string): Promise<void> {
    await api.post(`/admin/papers/${paperId}/reject`, reason);
  },

  // Comment Moderation
  async getAllComments(page = 0, size = 10, status?: string, sortBy = 'createdAt', sortDir = 'desc'): Promise<PaginatedResponse<AdminComment>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });
    if (status) params.append('status', status);
    
    const response = await api.get(`/admin/comments?${params}`);
    return response.data.data;
  },

  async approveComment(commentId: string): Promise<void> {
    await api.post(`/admin/comments/${commentId}/approve`);
  },

  async rejectComment(commentId: string, reason: string): Promise<void> {
    await api.post(`/admin/comments/${commentId}/reject`, reason);
  },

  // Notifications
  async getNotifications(page = 0, size = 10): Promise<NotificationResponse[]> {
    const response = await api.get(`/admin/notifications?page=${page}&size=${size}`);
    return response.data.data;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await api.post(`/admin/notifications/${notificationId}/read`);
  }
};
