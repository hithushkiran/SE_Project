import { api } from './api';
import { CommentRequest, CommentResponse, ApiResponse, CommentCountResponse } from '../types/comment';

export const commentService = {
  // Create a new comment on a paper
  async createComment(paperId: string, request: CommentRequest): Promise<ApiResponse<CommentResponse>> {
    try {
      const response = await api.post(`/papers/${paperId}/comments`, request);
      return response.data;
    } catch (error: any) {
      console.error('Create comment error:', error);
      throw error;
    }
  },

  // Get all comments for a paper
  async getPaperComments(paperId: string): Promise<ApiResponse<CommentResponse[]>> {
    try {
      const response = await api.get(`/papers/${paperId}/comments`);
      return response.data;
    } catch (error: any) {
      console.error('Get comments error:', error);
      throw error;
    }
  },

  // Update a specific comment
  async updateComment(paperId: string, commentId: string, request: CommentRequest): Promise<ApiResponse<CommentResponse>> {
    try {
      const response = await api.put(`/papers/${paperId}/comments/${commentId}`, request);
      return response.data;
    } catch (error: any) {
      console.error('Update comment error:', error);
      throw error;
    }
  },

  // Delete a specific comment
  async deleteComment(paperId: string, commentId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/papers/${paperId}/comments/${commentId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete comment error:', error);
      throw error;
    }
  },

  // Get comment count for a paper
  async getCommentCount(paperId: string): Promise<CommentCountResponse> {
    try {
      const response = await api.get(`/papers/${paperId}/comments/count`);
      return response.data;
    } catch (error: any) {
      console.error('Get comment count error:', error);
      throw error;
    }
  }
};
