import MontriIcon from './MontriIcon';

export default function Navbar() {
  return (
    <nav className="w-full bg-white px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <MontriIcon className="w-10 h-10" />
          <span className="text-2xl font-bold text-blue-600">montri</span>
        </a>

        <div className="hidden md:flex items-center space-x-8 text-[15px]">
          <a href="#" className="text-gray-600 hover:text-gray-900 transition">Características</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition">Precios</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition">Preguntas Frecuentes</a>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-5 py-2 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
            Iniciar Sesión
          </button>
          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Registrarse
          </button>
        </div>
      </div>
    </nav>
  );
}
