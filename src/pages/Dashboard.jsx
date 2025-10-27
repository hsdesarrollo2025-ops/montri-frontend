import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, FileMinus, Scale } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [recent, setRecent] = useState([]);
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
        const payload = result?.data ?? result ?? null;
        setData(payload);

        // Series mensuales si existen en el resumen
        const series = payload?.evolucionMensual || payload?.monthly || payload?.months || [];
        setMonthly(Array.isArray(series) ? series : []);

        // Últimos movimientos (ingresos y egresos)
        try {
          const [resIng, resEgr] = await Promise.all([
            fetch('https://montri-backend.onrender.com/api/ingresos?sort=createdAt:desc&pagination[limit]=5', {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch('https://montri-backend.onrender.com/api/egresos?sort=createdAt:desc&pagination[limit]=5', {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          const [dataIng, dataEgr] = await Promise.all([
            resIng.ok ? resIng.json().catch(() => ({})) : {},
            resEgr.ok ? resEgr.json().catch(() => ({})) : {},
          ]);
          const listIng = Array.isArray(dataIng?.data)
            ? dataIng.data.map((it) => ({
                id: `ing-${it?.id}`,
                date: it?.attributes?.createdAt || it?.attributes?.fecha || '',
                type: 'Ingreso',
                description: it?.attributes?.descripcion || it?.attributes?.description || 'Ingreso',
                amount: Number(it?.attributes?.monto ?? it?.attributes?.amount ?? 0),
              }))
            : [];
          const listEgr = Array.isArray(dataEgr?.data)
            ? dataEgr.data.map((it) => ({
                id: `egr-${it?.id}`,
                date: it?.attributes?.createdAt || it?.attributes?.fecha || '',
                type: 'Gasto',
                description: it?.attributes?.descripcion || it?.attributes?.description || 'Gasto',
                amount: Number(it?.attributes?.monto ?? it?.attributes?.amount ?? 0),
              }))
            : [];
          const merged = [...listIng, ...listEgr].sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecent(merged.slice(0, 5));
        } catch {}
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

  const { ingresos = 0, egresos = 0, balance = 0, categoriaTope, categoryLimit } = data || {};
  const fmtARS = useMemo(() => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }), []);
  const monthData = useMemo(() => (Array.isArray(monthly) ? monthly : []).map((d) => ({
    mes: d.mes || d.month || d.label || '',
    ingresos: Number(d.ingresos ?? d.income ?? d.in ?? 0),
    egresos: Number(d.egresos ?? d.expense ?? d.out ?? 0),
  })), [monthly]);
  const limit = Number(categoriaTope ?? categoryLimit ?? 0);
  const nearLimit = limit > 0 && Number(ingresos) >= 0.8 * limit;
  const noActivity = recent.length === 0 && Number(ingresos) === 0 && Number(egresos) === 0;

  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-blue-50 to-white flex flex-col items-center py-10">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Bienvenido a tu panel, Hernán</h1>
      <p className="text-gray-500 mb-10">Aquí verás un resumen de tu actividad.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-6 mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <DollarSign className="text-green-500 w-10 h-10 mb-2" />
          <h2 className="text-gray-600 text-sm">Ingresos Totales (mes actual)</h2>
          <p className="text-2xl font-semibold text-gray-800">{fmtARS.format(ingresos)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <FileMinus className="text-red-500 w-10 h-10 mb-2" />
          <h2 className="text-gray-600 text-sm">Gastos Totales (mes actual)</h2>
          <p className="text-2xl font-semibold text-gray-800">{fmtARS.format(egresos)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <Scale className="text-indigo-500 w-10 h-10 mb-2" />
          <h2 className="text-gray-600 text-sm">Balance Neto</h2>
          <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtARS.format(balance)}</p>
        </div>
      </div>

      {/* Gráfico mensual */}
      <MonthlyChart data={monthData} />

      {/* Últimos movimientos */}
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-[1000px] mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Últimos movimientos</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">Sin movimientos recientes.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((m) => (
              <li key={m.id} className="grid grid-cols-3 gap-2 py-2 text-sm">
                <span className="text-gray-600">{new Date(m.date).toLocaleDateString('es-AR')}</span>
                <span className={m.type === 'Ingreso' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{m.type}</span>
                <div className="flex justify-between">
                  <span className="text-gray-800">{m.description}</span>
                  <span className="font-semibold">{fmtARS.format(m.amount)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Alertas fiscales */}
      <div className="w-full max-w-[1000px] mt-10 space-y-3">
        {Number(balance) < 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 rounded-lg">⚠️ Tu balance es negativo este mes.</div>
        )}
        {nearLimit && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-3 rounded-lg">⚠️ Estás cerca del límite de facturación de tu categoría.</div>
        )}
        {noActivity && (
          <div className="bg-gray-50 border-l-4 border-gray-300 text-gray-700 p-3 rounded-lg">⚠️ Aún no registraste actividad este mes.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

// Componente con intento de uso de Recharts; si no está disponible, renderiza un fallback simple
function MonthlyChart({ data }) {
  const [lib, setLib] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await import('recharts');
        if (mounted) setLib(m);
      } catch {
        if (mounted) setLib(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-[1000px] mt-10">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Gráfico mensual</h2>
      {lib ? (
        <lib.ResponsiveContainer width="100%" height={260}>
          <lib.BarChart data={data}>
            <lib.CartesianGrid strokeDasharray="3 3" />
            <lib.XAxis dataKey="mes" />
            <lib.YAxis />
            <lib.Tooltip />
            <lib.Legend />
            <lib.Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" />
            <lib.Bar dataKey="egresos" fill="#ef4444" name="Gastos" />
          </lib.BarChart>
        </lib.ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-end gap-3">
          {data.map((d, idx) => (
            <div key={idx} className="flex-1 flex items-end gap-1">
              <div className="bg-green-500/80 w-4 rounded-t" style={{ height: `${(d.ingresos / Math.max(1, ...data.map(x=>Math.max(x.ingresos,x.egresos)))) * 100}%` }} />
              <div className="bg-red-500/80 w-4 rounded-t" style={{ height: `${(d.egresos / Math.max(1, ...data.map(x=>Math.max(x.ingresos,x.egresos)))) * 100}%` }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
