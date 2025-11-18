import { api } from './api';
import { PaperResponse, PaginatedResponse } from '../types/explore';

export type { PaperResponse, PaginatedResponse } from '../types/explore';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const paperService = {
  /**
   * Get user's uploaded publications with pagination
   */
  async getMyPublications(page = 0, size = 10): Promise<PaginatedResponse<PaperResponse>> {
    const response = await api.get(`/papers/mine?page=${page}&size=${size}`);
    return response.data.data; // ApiResponse<PaginatedResponse<PaperResponse>>
  },

  /**
   * Get single paper by ID
   */
  async getPaper(id: string): Promise<PaperResponse> {
    const response = await api.get(`/papers/${id}`);
    return response.data.data; // ApiResponse<PaperResponse>
  },

  /**
   * Upload a new paper
   */
  async uploadPaper(file: File, metadata: {
    title?: string;
    author?: string;
    publicationYear?: number;
    abstractText?: string;
  }): Promise<PaperResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.author) formData.append('author', metadata.author);
    if (metadata.publicationYear) formData.append('publicationYear', metadata.publicationYear.toString());
    if (metadata.abstractText) formData.append('abstractText', metadata.abstractText);

    const response = await api.post('/papers/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data; // ApiResponse<PaperResponse>
  },

  /**
   * Delete a paper (only if user is the uploader)
   */
  async deletePaper(id: string): Promise<void> {
    await api.delete(`/papers/${id}`);
  },

  /**
   * Get recent papers for explore page
   */
  async getRecentPapers(limit = 10): Promise<PaperResponse[]> {
    const response = await api.get(`/papers/recent?limit=${limit}`);
    return response.data.data; // ApiResponse<PaperResponse[]>
  },

  /**
   * Search papers by keyword
   */
  async searchPapers(query: string): Promise<PaperResponse[]> {
    const response = await api.get(`/papers/search?query=${encodeURIComponent(query)}`);
    return response.data.data; // ApiResponse<PaperResponse[]>
  }
};
