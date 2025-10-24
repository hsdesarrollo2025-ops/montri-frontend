import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateStatus, initProfile } from '../services/FiscalProfileService';

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

  const jwt = token;

  useEffect(() => {
    if (jwt && !profileChecked) {
      checkFiscalProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

  async function checkFiscalProfile() {
    try {
      setIsValidatingProfile(true);
      const data = await validateStatus(jwt);

      if (data.status === 'none') {
        await initProfile(jwt);
        navigate('/perfil-fiscal/A');
      } else if (data.status === 'draft') {
        const cs = data?.completedSection;
        // Redirigir a la próxima sección pendiente según completedSection
        if (cs === null || cs === undefined || cs === 'none') {
          navigate('/perfil-fiscal/A');
        } else if (cs === 'A') {
          navigate('/perfil-fiscal/B');
        } else if (cs === 'B') {
          navigate('/perfil-fiscal/C');
        } else if (cs === 'C' || cs === 'complete') {
          navigate('/dashboard');
        } else {
          // Valor desconocido: comenzar desde A
          navigate('/perfil-fiscal/A');
        }
      } else if (data.status === 'complete') {
        navigate('/dashboard');
      } else {
        // Estado desconocido: ir al dashboard por defecto
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error al validar perfil fiscal:', err);
      // En caso de error o token inválido, enviar al login
      navigate('/login', { replace: true });
    } finally {
      setIsValidatingProfile(false);
      setProfileChecked(true); // evita reejecuciones
    }
  }

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
