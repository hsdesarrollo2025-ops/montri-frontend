import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MontriIcon from './MontriIcon.tsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, token, logout } = useAuth();
  const isAuthed = Boolean(token && user);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const firstName = (user?.firstName || user?.username || user?.email || '').split(' ')[0];

  const handleDashboard = () => {
    setOpen(false);
    navigate('/dashboard');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b border-gray-100 relative">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2" aria-label="Ir al inicio">
          <MontriIcon className="h-8 w-8" />
          <span className="font-bold text-lg text-gray-800">montri</span>
        </Link>
      </div>

      {!isAuthed ? (
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Registrarse
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 py-1 px-3 rounded-full shadow-inner">
            <span className="text-gray-600 text-sm">Hola,</span>
            <span className="font-medium text-gray-800">{firstName}</span>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-2xl hover:text-green-500 transition"
            aria-expanded={open}
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div
            className={`absolute right-4 top-16 bg-white shadow-lg rounded-xl w-44 py-2 border border-gray-100 z-10 transition-all duration-200 ease-out ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}
            role="menu"
          >
            <button className="w-full text-left px-4 py-2 hover:bg-gray-50" role="menuitem" onClick={handleDashboard}>
              Dashboard
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
              role="menuitem"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

