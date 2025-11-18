import { api } from './api';
import { Category } from '../types/auth';

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get('categories');
    return response.data.data || [];
  },
};
