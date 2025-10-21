import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initProfile } from '../services/FiscalProfileService';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isValidatingProfile, setIsValidatingProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Keep state in sync if other tabs log out/in
    const onStorage = (e) => {
      if (e.key === 'token') {
        setToken(e.newValue);
      }
      if (e.key === 'user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    setToken(null);
    setUser(null);
    setProfileChecked(false);
    window.location.assign('/');
  };

  // Validar sesión solo si existe JWT en localStorage
  useEffect(() => {
    const validateSession = async () => {
      const lsToken = (() => { try { return localStorage.getItem('jwt'); } catch { return null; } })();
      if (!lsToken) {
        console.log('Sin sesión activa, no se valida perfil fiscal');
        setProfileChecked(true);
        return;
      }

      try {
        setIsValidatingProfile(true);
        const response = await api.get('/api/fiscal-profile/validate-status');
        const data = response?.data || {};

        if (data.status === 'none') {
          await initProfile();
          navigate('/perfil-fiscal/A');
        } else if (data.status === 'draft') {
          const section = data.completedSection || 'A';
          navigate(`/perfil-fiscal/${section}`);
        } else if (data.status === 'complete') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          console.warn('Token inválido, cerrando sesión...');
          logout();
        } else {
          console.error('Error al validar sesión:', err);
        }
      } finally {
        setIsValidatingProfile(false);
        setProfileChecked(true);
      }
    };

    validateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ token, user, setToken, setUser, logout, isValidatingProfile, profileChecked }),
    [token, user, isValidatingProfile, profileChecked]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
