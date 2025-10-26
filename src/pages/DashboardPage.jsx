import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const currencyFormat = (value) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value || 0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Error al obtener resumen');
        const json = await response.json();
        // Normalizar posibles claves del backend
        setData({
          incomeTotal: json?.incomeTotal ?? json?.totalIngresos ?? 0,
          expenseTotal: json?.expenseTotal ?? json?.totalEgresos ?? 0,
          netBalance: json?.netBalance ?? json?.saldoEstimado ?? 0,
          weeklySummary: json?.weeklySummary || [],
          recentMovements: json?.recentMovements || [],
          alerts: json?.alerts || json?.alertas || [],
        });
      } catch (err) {
        console.error('Error al cargar resumen:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando resumen...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-500">No se pudo cargar la información. Intentá nuevamente.</p>
    );

  const noData =
    !data || (data.incomeTotal === 0 && data.expenseTotal === 0 && data.netBalance === 0);

  if (noData) {
    return (
      <div className="min-h-[90vh] bg-gray-50 flex flex-col items-center justify-start pt-10 pb-24 px-4">
        <div className="text-center flex flex-col items-center justify-start">
          <div className="flex justify-center mb-4">
            <img
              src="/img/montri_sin_datos.png"
              alt="Sin datos"
              style={{ width: '500px', height: 'auto', objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
            Todavía no hay actividad registrada
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm leading-relaxed">
            Comenzá cargando tus primeros ingresos y egresos. Así vas a poder ver tu resumen mensual y alertas fiscales.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/ingresos/nuevo"
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-5 rounded-lg shadow-sm transition font-medium"
            >
              + Agregar ingreso
            </a>
            <a
              href="/egresos/nuevo"
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-lg shadow-sm transition font-medium"
            >
              + Agregar gasto
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-gray-50 px-6 py-10 flex flex-col items-center">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Bienvenido a tu panel, {user?.nombre || 'Usuario'}
        </h1>
        <p className="text-gray-500 text-sm">Aquí verás un resumen de tu actividad del mes actual.</p>
      </div>

      {/* Cards resumen */}
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-sm p-6 w-60 text-center">
          <div className="text-green-500 text-3xl mb-2">💵</div>
          <p className="text-gray-500 text-sm">Ingresos Totales (mes actual)</p>
          <p className="text-xl font-semibold">{currencyFormat(data.incomeTotal)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 w-60 text-center">
          <div className="text-red-500 text-3xl mb-2">📄</div>
          <p className="text-gray-500 text-sm">Gastos Totales (mes actual)</p>
          <p className="text-xl font-semibold">{currencyFormat(data.expenseTotal)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 w-60 text-center">
          <div className="text-indigo-500 text-3xl mb-2">⚖️</div>
          <p className="text-gray-500 text-sm">Balance Neto (mes actual)</p>
          <p className="text-xl font-semibold">{currencyFormat(data.netBalance)}</p>
        </div>
      </div>

      {/* Gráfico semanal */}
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-3xl mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumen mensual</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.weeklySummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#22C55E" name="Ingresos" />
            <Bar dataKey="expense" fill="#EF4444" name="Gastos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Movimientos recientes */}
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-3xl mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Últimos movimientos</h2>
        <ul className="divide-y divide-gray-100">
          {Array.isArray(data.recentMovements) && data.recentMovements.length > 0 ? (
            data.recentMovements.map((mov) => (
              <li key={mov.id} className="flex justify-between py-2 text-sm items-center">
                <span className={`font-medium ${mov.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                  {mov.description}
                </span>
                <span className="text-gray-500">{mov.date}</span>
                <span className="font-semibold text-gray-800">{currencyFormat(mov.amount)}</span>
              </li>
            ))
          ) : (
            <li className="py-1 text-sm text-gray-500">Sin movimientos recientes.</li>
          )}
        </ul>
      </div>

      {/* Alertas fiscales */}
      {Array.isArray(data.alerts) && data.alerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 w-full max-w-3xl mb-10 rounded-lg">
          <h3 className="font-semibold mb-2">Alertas fiscales</h3>
          <ul className="list-disc ml-6">
            {data.alerts.map((alert, index) => (
              <li key={index}>{alert.message || String(alert)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="flex justify-center gap-4 mt-4">
        <a
          href="/ingresos/nuevo"
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-5 rounded-lg shadow-sm transition font-medium"
        >
          + Agregar ingreso
        </a>
        <a
          href="/egresos/nuevo"
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-lg shadow-sm transition font-medium"
        >
          + Agregar gasto
        </a>
      </div>
    </div>
  );
};

export default DashboardPage;
