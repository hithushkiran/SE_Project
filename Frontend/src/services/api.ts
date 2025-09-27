import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api'; // Adjust port as needed

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Essential for HTTP-only cookies
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