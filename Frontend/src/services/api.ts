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
    if (error.response?.status === 401) {
      // Auto-redirect to login on 401
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Papers API helpers
export const getMyPublications = async (page: number = 0, size: number = 20) => {
  const response = await api.get(`/papers/mine?page=${page}&size=${size}`);
  return response.data;
};