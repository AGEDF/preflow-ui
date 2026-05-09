/**
 * Axios instance with interceptors for API calls
 */

import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../../config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('preflow_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      localStorage.removeItem('preflow_jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
