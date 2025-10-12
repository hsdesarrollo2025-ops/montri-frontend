export default function Footer() {
  return (
    <footer className="w-full py-8 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-gray-500 text-sm mb-3">
          © 2025 Montri. Todos los derechos reservados.
        </p>
        <div className="flex justify-center space-x-6 text-sm">
          <a href="#" className="text-gray-500 hover:text-blue-600 transition">
            Términos y condiciones
          </a>
          <a href="#" className="text-gray-500 hover:text-blue-600 transition">
            Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
}
