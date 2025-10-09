import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

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
    if (error.response?.status === 401) {
      // Auto-redirect to login on 401
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
