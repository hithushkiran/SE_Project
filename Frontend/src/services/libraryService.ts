import { api } from './api';
import { ApiResponse, PaperResponse } from '../types/explore';

type LibraryActionResponse = ApiResponse<null>;

const normalizeLibraryList = (data: unknown): PaperResponse[] => {
  if (!Array.isArray(data)) {
    return [];
  }
  return data as PaperResponse[];
};

export const libraryService = {
  async addToLibrary(paperId: string): Promise<LibraryActionResponse> {
    const response = await api.post<LibraryActionResponse>(`/library/add/${paperId}`);
    return response.data;
  },

  async removeFromLibrary(paperId: string): Promise<LibraryActionResponse> {
    const response = await api.delete<LibraryActionResponse>(`/library/remove/${paperId}`);
    return response.data;
  },

  async getUserLibrary(userId: string): Promise<PaperResponse[]> {
    const response = await api.get<ApiResponse<PaperResponse[]>>(`/users/${userId}/library`);
    return normalizeLibraryList(response.data?.data ?? response.data);
  },
};


