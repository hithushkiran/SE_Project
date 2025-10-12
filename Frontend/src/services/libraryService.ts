import { api } from './api';

export const libraryService = {
  async addToLibrary(paperId: string, userId: string): Promise<void> {
    await api.post(`/library/add/${paperId}?userId=${encodeURIComponent(userId)}`);
  },

  async removeFromLibrary(paperId: string, userId: string): Promise<void> {
    await api.delete(`/library/remove/${paperId}?userId=${encodeURIComponent(userId)}`);
  },

  async getUserLibrary(userId: string): Promise<import('../types/explore').PaperResponse[]> {
    const response = await api.get(`/users/${userId}/library`);
    // Assume standard API shape { success, data }
    return response.data?.data ?? response.data;
  },
};


