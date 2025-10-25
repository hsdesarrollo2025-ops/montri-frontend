import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PerfilFiscalCompletado() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/dashboard'), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F8FAFF] flex flex-col items-center justify-center px-4 text-center">
      <CheckCircle className="h-20 w-20 text-green-600 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Perfil fiscal completado con éxito! 🎉</h1>
      <p className="text-gray-600 max-w-md mb-6">
        Todos tus datos fueron guardados correctamente. Ahora podrás acceder a tu panel principal y continuar con tu experiencia en Montri.
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-all"
      >
        Ir al Dashboard
      </button>
    </div>
  );
}

