import axios from 'axios';

// Resolve base URL from Vite env or fallback
const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (process.env.VITE_API_URL || 'https://montri-backend.onrender.com');

export const api = axios.create({
  baseURL: API_URL,
});

// Lazy import to avoid circular deps during tests/build
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

