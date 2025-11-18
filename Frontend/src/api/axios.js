import axios from 'axios';

// Vite proxy works best when VITE_API_BASE_URL is set to '/api'. If it's a full URL, use it as-is.
const rawBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = rawBase
  ? rawBase.endsWith('/api')
    ? rawBase
    : rawBase.replace(/\/$/, '') + '/api'
  : 'http://localhost:8080/api';

// Debug: print resolved API base URL in the browser console during dev
try {
  // Only run in browser environments
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.info('[api] API_BASE_URL =', API_BASE_URL);
  }
} catch (e) {}

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
