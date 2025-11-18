import axios from 'axios';

// Use environment variable for API base URL (includes /api prefix)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate instance for multipart (let browser set Content-Type with boundary)
export const multipartApi = axios.create({
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

export default api;
