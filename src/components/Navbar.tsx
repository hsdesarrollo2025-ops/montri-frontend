export default function Navbar() {
  return (
    <nav className="w-full bg-white px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">Montri</span>
        </div>

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
