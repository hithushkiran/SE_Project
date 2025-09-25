import { api } from './api';
import { LoginRequest, RegisterRequest, UpdateProfileRequest, UserResponse } from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<void> {
    await api.post('/auth/login', credentials);
  },

  async register(userData: RegisterRequest): Promise<void> {
    await api.post('/auth/signup', userData);
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getProfile(): Promise<UserResponse> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<void> {
    await api.put('/auth/profile', profileData);
  },
};