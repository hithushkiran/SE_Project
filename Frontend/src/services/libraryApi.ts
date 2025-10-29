import { AxiosError } from 'axios';
import { api } from './api';
import { LibraryItem, LibraryPage } from '../types/library';

export const libraryApi = {
  async add(paperId: string | number): Promise<LibraryItem> {
    const target = String(paperId);
    try {
      const response = await api.post<LibraryItem>(`/library/${target}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<LibraryItem>;
      const status = axiosError.response?.status;
      if (status && (status === 409 || status === 422) && axiosError.response?.data) {
        return axiosError.response.data;
      }
      throw error;
    }
  },

  async list(page = 0, size = 20): Promise<LibraryPage> {
    const response = await api.get<LibraryPage>('/library', {
      params: { page, size },
    });
    return response.data;
  },

  async remove(paperId: string | number): Promise<void> {
    const target = String(paperId);
    await api.delete(`/library/${target}`);
  },
};
