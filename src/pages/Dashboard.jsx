import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { DollarSign, FileText, Scale } from "lucide-react";
import { getDashboardSummary } from '../services/DashboardService.js';


export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    mes: '',
    totalIngresos: 0,
    totalEgresos: 0,
    totalDeducibles: 0,
    saldoEstimado: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fmtARS = useMemo(() => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }), []);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login', { replace: true });
    }
  }, [token, user, navigate]);

  const firstName = (user?.firstName || user?.username || user?.email || '').split(' ')[0];

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getDashboardSummary(token);
        if (!mounted) return;
        setSummary({
          mes: data?.mes || '',
          totalIngresos: Number(data?.totalIngresos || 0),
          totalEgresos: Number(data?.totalEgresos || 0),
          totalDeducibles: Number(data?.totalDeducibles || 0),
          saldoEstimado: Number(data?.saldoEstimado || 0),
        });
      } catch (err) {
        if (!mounted) return;
        setError('No se pudo cargar el resumen del mes.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F8FAFF] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido a tu panel, {firstName}</h1>
          <p className="text-gray-600 mt-1">Aquí verás un resumen de tu actividad.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {/* Ingresos Totales */}
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="p-4 rounded-full bg-green-500 shadow-md mb-4 flex items-center justify-center">
              <DollarSign size={28} color="white" strokeWidth={2} />
            </div>
            <p className="text-gray-500 text-sm">Ingresos Totales (mes actual)</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">{fmtARS.format(summary.totalIngresos)}</h2>
          </div>

          {/* Gastos Totales */}
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="p-4 rounded-full bg-rose-500 shadow-md mb-4 flex items-center justify-center">
              <FileText size={28} color="white" strokeWidth={2} />
            </div>
            <p className="text-gray-500 text-sm">Gastos Totales (mes actual)</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">{fmtARS.format(summary.totalEgresos)}</h2>
          </div>

          {/* Balance Neto */}
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all">
            <div className="p-4 rounded-full bg-indigo-500 shadow-md mb-4 flex items-center justify-center">
              <Scale size={28} color="white" strokeWidth={2} />
            </div>
            <p className="text-gray-500 text-sm">Balance Neto (mes actual)</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">{fmtARS.format(summary.saldoEstimado)}</h2>
          </div>
        </div>

        {loading && (
          <p className="mt-4 text-sm text-gray-500">Cargando resumen del mes...</p>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

