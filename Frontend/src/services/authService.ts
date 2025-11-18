import { api } from './api';
import { LoginRequest, RegisterRequest, UpdateProfileRequest, UserResponse, Category } from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<void> {
    // Debug: log payload and backend response on error to help diagnose 400s
    // eslint-disable-next-line no-console
    console.info('[auth] login payload', credentials);
    try {
      await api.post('/auth/login', credentials);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[auth] login failed', {
        status: err?.response?.status,
        data: err?.response?.data,
        headers: err?.response?.headers
      }, err);
      throw err;
    }
  },

  async register(userData: RegisterRequest): Promise<void> {
    await api.post('auth/signup', userData);
  },

  async logout(): Promise<void> {
    await api.post('auth/logout');
  },

  async getProfile(): Promise<UserResponse> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('[auth] getProfile failed', {
        status: err?.response?.status,
        data: err?.response?.data,
        headers: err?.response?.headers
      });
      throw err;
    }
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<void> {
    await api.put('auth/profile', profileData);
  },

  async updateInterests(categoryIds: string[]): Promise<void> {
    await api.put('profile/interests', { categoryIds });
  },

  async getInterests(): Promise<Category[]> {
    const response = await api.get('profile/interests');
    return response.data.data || [];
  },
};