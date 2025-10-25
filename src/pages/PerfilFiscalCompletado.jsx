import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PerfilFiscalCompletado() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/dashboard'), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const sections = [
    { label: 'Datos personales', code: 'A' },
    { label: 'Régimen y actividad', code: 'B' },
    { label: 'Confirmación final', code: 'C' },
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F8FAFF] flex flex-col items-center justify-center px-4 text-center">
      <CheckCircle className="h-20 w-20 text-green-600 mb-4 animate-scale-in" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Perfil fiscal completado con éxito! 🎉</h1>
      <p className="text-gray-600 max-w-md mb-6">
        Todos tus datos fueron guardados correctamente.  
        Ya podés acceder a tu panel principal y continuar tu experiencia en Montri.
      </p>

      {/* Resumen visual del progreso */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-6 w-full max-w-md text-left">
        <h2 className="text-gray-800 font-semibold mb-4">Progreso del perfil fiscal</h2>
        <div className="flex flex-col space-y-4">
          {sections.map((s) => (
            <div key={s.code} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-none">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-gray-800">{s.label}</span>
              </div>
              <span className="text-sm text-green-700 font-medium">Completado</span>
            </div>
          ))}
        </div>

        {/* Barra de progreso */}
        <div className="mt-6 w-full bg-gray-200 h-3 rounded-full">
          <div className="bg-green-600 h-3 rounded-full transition-all duration-700" style={{ width: '100%' }} />
        </div>
        <p className="text-sm text-gray-600 mt-2 font-medium">100 % completado</p>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-all"
      >
        Ir al Dashboard
      </button>
    </div>
  );
}
