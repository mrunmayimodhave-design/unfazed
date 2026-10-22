import axios from 'axios';

// In production, when served as a unified full-stack web service, use same-origin '/api'.
// In local development, fall back to http://localhost:5000/api (or VITE_API_BASE_URL if set).
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('unfazed_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired/invalid on protected routes
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('unfazed_token');
        localStorage.removeItem('unfazed_therapist');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
