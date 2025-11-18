import { api } from './api';
import { UserProfile } from '../types/userProfile';
import { PaginatedResponse, PaperResponse } from '../types/explore';

export const userProfileService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data.data;
  },

  async getUserPapers(
    userId: string,
    page = 0,
    size = 12
  ): Promise<PaginatedResponse<PaperResponse>> {
    const response = await api.get(`/users/${userId}/papers?page=${page}&size=${size}`);
    return response.data.data;
  }
};
