import { api } from './api';
import { LoginRequest, RegisterRequest, UpdateProfileRequest, UserResponse, Category } from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<void> {
    await api.post('auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<void> {
    await api.post('auth/signup', userData);
  },

  async logout(): Promise<void> {
    await api.post('auth/logout');
  },

  async getProfile(): Promise<UserResponse> {
    const response = await api.get('auth/profile');
    return response.data;
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