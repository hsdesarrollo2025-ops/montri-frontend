import { Link } from 'react-router-dom';
import MontriIcon from './MontriIcon';

export default function Navbar() {
  return (
    <nav className="w-full bg-white px-6 py-5" aria-label="Navegación principal">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Ir al inicio">
          <MontriIcon className="w-10 h-10" />
          <span className="text-2xl font-bold text-blue-600">montri</span>
        </Link>

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
      </div>
    </nav>
  );
}
