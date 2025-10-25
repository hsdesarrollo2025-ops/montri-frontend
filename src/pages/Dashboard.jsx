import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DollarSign, FileText, Scale, Receipt, Bell, CalendarDays } from 'lucide-react';
import { getDashboardSummary, getDashboardAlerts } from '../services/DashboardService.js';
import EmptyState from '../components/EmptyState.jsx';

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !user) {
      navigate('/login', { replace: true });
    }
  }, [token, user, navigate]);

  const fmtARS = useMemo(
    () => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }),
    []
  );

  const firstName = (user?.firstName || user?.username || user?.email || '').split(' ')[0];

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const [s, a] = await Promise.all([
          getDashboardSummary(token),
          getDashboardAlerts(token),
        ]);
        setSummary(s || null);
        setAlerts(Array.isArray(a?.alertas) ? a.alertas : []);
        setVencimientos(Array.isArray(a?.vencimientos) ? a.vencimientos : []);
      } catch (e) {
        setError('No se pudo cargar tu resumen.');
        setSummary(null);
        setAlerts([]);
        setVencimientos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  const noData =
    !summary ||
    (Number(summary?.totalIngresos || 0) === 0 &&
      Number(summary?.totalEgresos || 0) === 0 &&
      Number(summary?.totalDeducibles || 0) === 0);

  if (noData) {
    return (
      <EmptyState
        title="Todavía no hay actividad registrada"
        message="Comenzá cargando tus primeros ingresos y egresos. Así vas a poder ver tu resumen mensual y alertas fiscales."
        actions={
          <>
            <a href="/ingresos/nuevo" className="bg-green-500 hover:bg-green-600 text-white py-3 px-5 rounded-lg">
              + Agregar ingreso
            </a>
            <a href="/egresos/nuevo" className="bg-red-500 hover:bg-red-600 text-white py-3 px-5 rounded-lg">
              + Agregar gasto
            </a>
          </>
        }
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F8FAFF] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido a tu panel, {firstName}</h1>
          <p className="text-gray-600 mt-1">Aquí verás un resumen de tu actividad.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* Ingresos Totales */}
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="p-4 rounded-full bg-green-500 shadow-md mb-4 flex items-center justify-center">
              <DollarSign size={28} color="white" strokeWidth={2} />
            </div>
            <p className="text-gray-500 text-sm">Ingresos Totales (mes actual)</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">{fmtARS.format(Number(summary?.totalIngresos || 0))}</h2>
          </div>

          {/* Gastos Totales */}
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="p-4 rounded-full bg-rose-500 shadow-md mb-4 flex items-center justify-center">
              <FileText size={28} color="white" strokeWidth={2} />
            </div>
            <p className="text-gray-500 text-sm">Gastos Totales (mes actual)</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">{fmtARS.format(Number(summary?.totalEgresos || 0))}</h2>
          </div>

          {/* Deducciones válidas */}
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="p-4 rounded-full bg-blue-500 shadow-md mb-4 flex items-center justify-center">
              <Receipt size={28} color="white" strokeWidth={2} />
            </div>
            <p className="text-gray-500 text-sm">Deducciones válidas (mes actual)</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">{fmtARS.format(Number(summary?.totalDeducibles || 0))}</h2>
          </div>

          {/* Balance Neto */}
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="p-4 rounded-full bg-indigo-500 shadow-md mb-4 flex items-center justify-center">
              <Scale size={28} color="white" strokeWidth={2} />
            </div>
            <p className="text-gray-500 text-sm">Balance Neto (mes actual)</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">{fmtARS.format(Number(summary?.saldoEstimado || 0))}</h2>
          </div>
        </div>

        {/* Alertas y vencimientos */}
        <div className="max-w-3xl mx-auto mt-10">
          <h2 className="text-xl font-semibold mb-3">Alertas y vencimientos</h2>
          {alerts?.length > 0 || vencimientos?.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((al, idx) => (
                <div key={`a-${idx}`} className="flex items-center gap-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <Bell size={18} className="text-yellow-600" />
                  <p className="text-gray-800">{al?.mensaje || al}</p>
                </div>
              ))}
              {vencimientos.map((v, idx) => (
                <div key={`v-${idx}`} className="flex items-center gap-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <CalendarDays size={18} className="text-blue-600" />
                  <p className="text-gray-800">{v?.titulo} – vence el {new Date(v?.fecha).toLocaleDateString('es-AR')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay alertas por el momento 🎉</p>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="max-w-3xl mx-auto mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <a href="/ingresos/nuevo" className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg">+ Ingreso</a>
          <a href="/egresos/nuevo" className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg">+ Gasto</a>
          <a href="/calendario" className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg">📅 Calendario</a>
          <a href="/perfil-fiscal" className="bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg">⚙️ Perfil</a>
        </div>
      </div>
    </div>
  );
}
