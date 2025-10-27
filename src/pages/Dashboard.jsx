import React, { useEffect, useState } from 'react';
import { DollarSign, FileMinus, Scale } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        // Intenta 'jwt' y luego 'token' para compatibilidad con el login actual
        const token = localStorage.getItem('jwt') || localStorage.getItem('token');
        if (!token) {
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }

        const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
        const res = await fetch(`${base}/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 404) {
          // Si el backend aún no expone el endpoint, mostrar 0s en vez de error
          setData({ ingresos: 0, egresos: 0, balance: 0 });
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error('Error al obtener resumen');
        const json = await res.json().catch(() => ({}));
        // Admite estructura {data: {...}} o {...}
        setData(json?.data ?? json ?? null);
      } catch (err) {
        console.error('Error al obtener resumen del dashboard:', err);
        setError('Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500">
        Cargando datos del dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-red-500">
        {error}
      </div>
    );
  }

  const { ingresos, egresos, balance } = data || {};

  return (
    <div className="min-h-[90vh] bg-gray-50 flex flex-col items-center py-10">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Bienvenido a tu panel, Hernán
      </h1>
      <p className="text-gray-500 mb-10">Aquí verás un resumen de tu actividad.</p>

      {/* Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <DollarSign className="text-green-500 w-10 h-10 mb-2" />
          <h2 className="text-gray-600 text-sm">Ingresos Totales (mes actual)</h2>
          <p className="text-2xl font-semibold text-gray-800">
            ${ingresos?.toLocaleString('es-AR') || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <FileMinus className="text-red-500 w-10 h-10 mb-2" />
          <h2 className="text-gray-600 text-sm">Gastos Totales (mes actual)</h2>
          <p className="text-2xl font-semibold text-gray-800">
            ${egresos?.toLocaleString('es-AR') || 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <Scale className="text-indigo-500 w-10 h-10 mb-2" />
          <h2 className="text-gray-600 text-sm">Balance Neto</h2>
          <p className={`text-2xl font-semibold ${Number(balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${balance?.toLocaleString('es-AR') || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
