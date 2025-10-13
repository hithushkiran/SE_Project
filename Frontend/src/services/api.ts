import axios from 'axios';

// Centralized API base URL via Vite env (set in .env as VITE_API_BASE_URL)
// Rely on Vite's built-in typing (will work once a global env.d.ts is added). Fallback provided.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not the profile check endpoint
    // This prevents infinite redirect loops during initial auth check
    if (error.response?.status === 401 && !error.config.url?.includes('auth/profile')) {
      // Auto-redirect to login on 401 for other protected endpoints
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);