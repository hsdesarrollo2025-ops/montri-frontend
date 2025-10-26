import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '../config';

function currencyFormat(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(Number(value || 0));
}

// Pequeño gráfico de barras sin dependencias (fallback a Recharts)
function WeeklyBars({ data = [] }) {
  const max = useMemo(() => {
    return data.reduce((m, d) => Math.max(m, Number(d.income || 0), Number(d.expense || 0)), 0) || 1;
  }, [data]);
  return (
    <div className="w-full">
      <div className="h-52 flex items-end gap-4">
        {data.map((d) => {
          const hIn = Math.round((Number(d.income || 0) / max) * 100);
          const hEx = Math.round((Number(d.expense || 0) / max) * 100);
          return (
            <div key={String(d.week)} className="flex flex-col items-center flex-1">
              <div className="flex items-end gap-1 w-full justify-center">
                <div className="bg-green-500/80 w-4 rounded-t" style={{ height: `${hIn}%` }} title={`Ingresos ${currencyFormat(d.income)}`} />
                <div className="bg-red-500/80 w-4 rounded-t" style={{ height: `${hEx}%` }} title={`Gastos ${currencyFormat(d.expense)}`} />
              </div>
              <span className="mt-2 text-xs text-gray-600">{d.week}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userName = (user?.firstName || user?.username || user?.email || 'Usuario').split(' ')[0];

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al obtener resumen');
        const json = await res.json();
        const normalized = {
          incomeTotal: json?.totalIngresos ?? json?.incomeTotal ?? 0,
          expenseTotal: json?.totalEgresos ?? json?.expenseTotal ?? 0,
          netBalance: json?.saldoEstimado ?? json?.netBalance ?? 0,
          totalDeducibles: json?.totalDeducibles ?? 0,
          weeklySummary: json?.weeklySummary || [],
          recentMovements: json?.recentMovements || [],
          alerts: json?.alerts || [],
        };
        setData(normalized);
      } catch (e) {
        console.error('Error al cargar resumen:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando resumen...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">No se pudo cargar la información.</p>;

  const noData =
    !data || (Number(data.incomeTotal) === 0 && Number(data.expenseTotal) === 0 && Number(data.netBalance) === 0);

  if (noData) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-[#F8FAFF] px-4 pt-3 pb-4 flex items-start justify-center">
        <div className="text-center flex flex-col items-center">
          <img src="/img/montri_sin_datos.png" alt="Sin datos" className="mx-auto mb-3 max-h-[120px] sm:max-h-[140px] w-auto object-contain" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">Todavía no hay actividad registrada</h2>
          <p className="text-gray-500 text-sm mb-4 max-w-sm">
            Comenzá cargando tus primeros ingresos y egresos. Así vas a poder ver tu resumen mensual y alertas fiscales.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/ingresos/nuevo" className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-2 px-5 rounded-lg shadow-sm transition font-medium">+ Agregar ingreso</a>
            <a href="/egresos/nuevo" className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-lg shadow-sm transition font-medium">+ Agregar gasto</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-gray-50 px-6 py-10 flex flex-col items-center">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Bienvenido a tu panel, {userName}</h1>
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
        <WeeklyBars data={data.weeklySummary} />
      </div>

      {/* Movimientos recientes */}
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-3xl mb-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Últimos movimientos</h2>
        {Array.isArray(data.recentMovements) && data.recentMovements.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {data.recentMovements.map((mov) => (
              <li key={mov.id} className="grid grid-cols-3 gap-2 items-center py-2 text-sm">
                <span className={`font-medium ${mov.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>{mov.description}</span>
                <span className="text-gray-500 justify-self-center">{mov.date}</span>
                <span className="font-semibold text-gray-800 justify-self-end">{currencyFormat(mov.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Sin movimientos recientes.</p>
        )}
      </div>

      {/* Alertas fiscales */}
      {Array.isArray(data.alerts) && data.alerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 w-full max-w-3xl mb-10 rounded-lg">
          <h3 className="font-semibold mb-2">Alertas fiscales</h3>
          <ul className="list-disc ml-6">
            {data.alerts.map((alert, idx) => (
              <li key={idx}>{alert.message || alert.mensaje || String(alert)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="flex justify-center gap-4 mt-4">
        <a href="/ingresos/nuevo" className="bg-green-500 hover:bg-green-600 text-white py-2 px-5 rounded-lg shadow-sm transition font-medium">+ Agregar ingreso</a>
        <a href="/egresos/nuevo" className="bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-lg shadow-sm transition font-medium">+ Agregar gasto</a>
      </div>
    </div>
  );
}

