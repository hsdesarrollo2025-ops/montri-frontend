import api from '../api/axiosConfig';

const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (process.env.VITE_API_URL || 'https://montri-backend.onrender.com');

export async function registerUser(data) {
  try {
    const payload = {
      username: String(data.email || '').split('@')[0],
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    };
    const res = await api.post(`${API_URL}/api/auth/local/register`, payload, { baseURL: '' });
    const out = res.data || {};
    if (out.jwt) {
      try { localStorage.setItem('jwt', out.jwt); localStorage.setItem('token', out.jwt); localStorage.setItem('user', JSON.stringify(out.user)); } catch {}
    }
    return out;
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
}

export async function loginUser(data) {
  try {
    const payload = { identifier: data.email, password: data.password };
    const res = await api.post(`${API_URL}/api/auth/local`, payload, { baseURL: '' });
    const out = res.data || {};
    if (out.jwt) {
      try { localStorage.setItem('jwt', out.jwt); localStorage.setItem('token', out.jwt); localStorage.setItem('user', JSON.stringify(out.user)); } catch {}
    }
    return out;
  } catch (error) {
    console.error('Error en loginUser:', error);
    if (error instanceof TypeError && !('status' in error)) {
      const err = new Error('No se pudo conectar al servidor');
      err.code = 'NETWORK_ERROR';
      throw err;
    }
    throw error;
  }
}

export const AuthService = {
  async login(email, password) { return loginUser({ email, password }); },
  async register(username, email, password) { return registerUser({ email, password, username }); },
  logout() { try { localStorage.removeItem('jwt'); localStorage.removeItem('token'); localStorage.removeItem('user'); } catch {} },
  getToken() { try { return localStorage.getItem('token') || localStorage.getItem('jwt'); } catch { return null; } },
  getUser() { try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; } catch { return null; } },
};
