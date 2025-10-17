import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user) {
      navigate('/login', { replace: true });
    }
  }, [token, user, navigate]);

  const firstName = (user?.firstName || user?.username || user?.email || '').split(' ')[0];

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F8FAFF] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido a tu panel, {firstName}</h1>
          <p className="text-gray-600 mt-1">Aquí verás un resumen de tu actividad.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Ingresos</h2>
            <p className="mt-2 text-3xl font-bold text-green-600">$ 0</p>
            <p className="text-xs text-gray-500 mt-1">Este mes</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Gastos</h2>
            <p className="mt-2 text-3xl font-bold text-red-600">$ 0</p>
            <p className="text-xs text-gray-500 mt-1">Este mes</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Balance</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">$ 0</p>
            <p className="text-xs text-gray-500 mt-1">Actual</p>
          </div>
        </div>
      </div>
    </div>
  );
}
