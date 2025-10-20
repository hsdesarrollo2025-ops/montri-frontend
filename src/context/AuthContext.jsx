import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { validateStatus, initProfile } from '../services/FiscalProfileService.js';

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
  const didValidateRef = useRef(false);

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
    window.location.assign('/');
  };

  useEffect(() => {
    // Ejecutar validación solo una vez por login (cuando aparece token)
    if (!token || !user) {
      didValidateRef.current = false;
      return;
    }
    if (didValidateRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        setIsValidatingProfile(true);
        const res = await validateStatus(token);
        if (cancelled) return;
        const status = res?.status;
        if (status === 'none') {
          try {
            await initProfile(token);
          } catch {}
          window.location.assign('/perfil-fiscal/A');
        } else if (status === 'draft') {
          const section = res?.completedSection || 'A';
          window.location.assign(`/perfil-fiscal/${section}`);
        } else if (status === 'complete') {
          // Si ya está completo, a dashboard
          window.location.assign('/dashboard');
        } else {
          // Estado desconocido: ir al dashboard por defecto
          window.location.assign('/dashboard');
        }
      } catch (e) {
        console.error('Error validando perfil fiscal:', e);
        // En caso de error, continuar a dashboard para no bloquear
        window.location.assign('/dashboard');
      } finally {
        if (!cancelled) {
          setIsValidatingProfile(false);
          didValidateRef.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const value = useMemo(() => ({ token, user, setToken, setUser, logout, isValidatingProfile }), [token, user, isValidatingProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
