import React, { useEffect, useState } from 'react';
import { DollarSign, FileMinus, Scale } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }

        const response = await fetch(
          'https://montri-backend.onrender.com/api/dashboard/summary',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.error('Error de backend:', errData);
          throw new Error(errData.error?.message || 'Error al cargar el dashboard');
        }

        const result = await response.json();
        setData(result.data);
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

  const { ingresos = 0, egresos = 0, balance = 0 } = data || {};

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-blue-50 to-white flex flex-col items-center py-10">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Bienvenido a tu panel, Hernán</h1>
      <p className="text-gray-500 mb-10">Aquí verás un resumen de tu actividad.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-6 mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <DollarSign className="text-green-500 w-10 h-10 mb-2" />
          <h2 className="text-gray-600 text-sm">Ingresos Totales (mes actual)</h2>
          <p className="text-2xl font-semibold text-gray-800">${ingresos.toLocaleString('es-AR')}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <FileMinus className="text-red-500 w-10 h-10 mb-2" />
          <h2 className="text-gray-600 text-sm">Gastos Totales (mes actual)</h2>
          <p className="text-2xl font-semibold text-gray-800">${egresos.toLocaleString('es-AR')}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <Scale className="text-indigo-500 w-10 h-10 mb-2" />
          <h2 className="text-gray-600 text-sm">Balance Neto</h2>
          <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>${balance.toLocaleString('es-AR')}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
