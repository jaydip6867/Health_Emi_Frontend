import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with extended timeout for large file uploads
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes timeout for large payloads with multiple file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available and extend timeout for specific endpoints
axiosInstance.interceptors.request.use(
  (config) => {
    // Remove API_BASE_URL from URL if it's already included (to prevent double URL issue)
    if (config.url?.includes(API_BASE_URL)) {
      config.url = config.url.replace(API_BASE_URL, '');
    }
    
    // Extend timeout for profile/edit endpoint which handles large payloads
    if (config.url?.includes('/profile/edit') || config.url?.includes('/upload')) {
      config.timeout = 300000; // 5 minutes for profile edit and file uploads
    }
    
    // Don't override if manual Authorization header is already set
    if (!config.headers.Authorization) {
      const token = localStorage.getItem('healthhospital') || localStorage.getItem('HospitalLogin');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      error.message = 'Request timeout. The server took too long to respond. Please try again or reduce the file sizes.';
    } else if (error.response?.status === 504) {
      error.message = 'Gateway timeout. The server is experiencing delays. This may be due to large file uploads. Please try again.';
    } else if (error.response?.status === 500) {
      error.message = 'Server error. Please try again later.';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
