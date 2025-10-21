import axios from 'axios';

// Base URL from Vite env with sane local fallback
const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (process.env.VITE_API_URL || 'http://localhost:1337');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: agrega el token JWT automáticamente si existe
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('jwt');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

export { api };
export default api;
