import { Link } from 'react-router-dom';
import { useState } from 'react';
import MontriIcon from './MontriIcon';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout, token } = useAuth();
  const isAuthed = Boolean(token && user);
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = (user?.firstName || user?.username || user?.email || '').split(' ')[0];

  return (
    <nav className="w-full bg-white px-6 py-5" aria-label="Navegación principal">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Ir al inicio">
          <MontriIcon className="w-10 h-10" />
          <span className="text-2xl font-bold text-blue-600">montri</span>
        </Link>

        {!isAuthed ? (
          <>
            <div className="hidden md:flex items-center space-x-8 text-[15px]">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition" aria-label="Ir a Características">Características</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition" aria-label="Ir a Precios">Precios</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition" aria-label="Ir a Preguntas frecuentes">Preguntas frecuentes</a>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-5 py-2 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                aria-label="Iniciar sesión"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                aria-label="Registrarse"
              >
                Registrarse
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 relative">
            <span className="hidden sm:block text-sm text-gray-700">Hola, <span className="font-semibold">{firstName}</span></span>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              aria-expanded={menuOpen}
              aria-label="Abrir menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
                <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 014.5 6h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 5.25A.75.75 0 014.5 11h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 5.25A.75.75 0 014.5 16h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </button>

            <div
              className={`absolute right-0 top-12 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden transition-all duration-200 ease-out ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'}`}
              role="menu"
            >
              <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" role="menuitem" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

