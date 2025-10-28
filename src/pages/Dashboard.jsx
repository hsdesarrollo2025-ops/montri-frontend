// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";

import { FaMoneyBillWave, FaFileInvoice, FaBalanceScale } from "react-icons/fa";

import { ArrowDownCircle, ArrowUpCircle, CalendarDays, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

import {

  ResponsiveContainer,

  BarChart,

  Bar,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip,

  Legend,

} from "recharts";

import MonthlyEvolutionChart from "../components/dashboard/MonthlyEvolutionChart.jsx";
import { alertasFiscalesMock } from "../mocks/alertasFiscalesMock";
// KPI cards are rendered inline in the JSX below



import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  // HOOKS EN ORDEN Y AL TOPE (nunca dentro de condicionales)

  const [kpis, setKpis] = useState({ ingresos: 0, egresos: 0, balance: 0 });

  

  const [mesIngresos, setMesIngresos] = useState([]);

  const [mesEgresos, setMesEgresos] = useState([]);

  const [movimientos, setMovimientos] = useState([]);

  const [alertas, setAlertas] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);



  // Carga de datos

  useEffect(() => {

    let cancelled = false;



    const fetchSummary = async () => {

      try {

                const token = localStorage.getItem("token");
        const base = import.meta.env.VITE_API_BASE_URL || "https://montri-backend.onrender.com";
        const url = `${base}/api/dashboard/summary`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "Content-Type": "application/json",
          },
        });



        if (!res.ok) {

          const txt = await res.text();

          throw new Error(`HTTP ${res.status} - ${txt}`);

        }



        const json = await res.json();

        const data = json?.data ?? json;



        const ingresos =

          data?.ingresosTotal ?? data?.ingresos ?? data?.totalIngresos ?? 0;

        const egresos =

          data?.egresosTotal ?? data?.egresos ?? data?.totalEgresos ?? 0;

        const balance =

          data?.balance ?? data?.balanceNeto ?? ingresos - egresos;



        const serieData = Array.isArray(data?.serie)

          ? data.serie

          : Array.isArray(data?.chart)

          ? data.chart

          : [];



        const movs = Array.isArray(data?.movimientos)

          ? data.movimientos

          : Array.isArray(data?.movs)

          ? data.movs

          : [];



        const warns = Array.isArray(data?.alertas)

          ? data.alertas

          : Array.isArray(data?.alerts)

          ? data.alerts

          : [];



        if (!cancelled) {

          setKpis({ ingresos, egresos, balance });

          setMovimientos(movs);

          setAlertas(warns);

        }



        // Cargar últimos movimientos desde los endpoints de summary

        try {

          const headers = { Authorization: `Bearer ${token || ""}`, "Content-Type": "application/json" };

          const [ri, re] = await Promise.all([

            fetch(`${base}/api/ingresos/summary`, { headers }),

            fetch(`${base}/api/egresos/summary`, { headers }),

          ]);

          const parseUltimos = async (resp) => {

            if (!resp || !resp.ok) return [];

            const j = await resp.json().catch(() => ({}));

            const d = j?.data ?? j ?? {};

            const arr = Array.isArray(d?.ultimos) ? d.ultimos : [];

            return Array.isArray(arr) ? arr : [];

          };

          const [uIng, uEgr] = await Promise.all([parseUltimos(ri), parseUltimos(re)]);

          const merged = [

            ...uIng.map((x) => ({ ...x, tipo: "Ingreso" })),

            ...uEgr.map((x) => ({ ...x, tipo: "Egreso" })),

          ].sort((a, b) => new Date(b?.fecha || b?.date || 0) - new Date(a?.fecha || a?.date || 0));

          if (!cancelled && merged.length) setMovimientos(merged);

        } catch {}

      } catch (e) {

        if (!cancelled) setError(e.message || "Error al cargar el dashboard");

      } finally {

        if (!cancelled) setLoading(false);

      }

    };



    fetchSummary();

    return () => {

      cancelled = true;

    };

  }, []);



  useEffect(() => {

    let cancelled = false;

    const run = async () => {

      try {

        const token = localStorage.getItem("token");

        const base = import.meta.env.VITE_API_BASE_URL || "https://montri-backend.onrender.com";

        const make = async (endpoint) => {

          const r = await fetch(`${base}${endpoint}`, {

            headers: { Authorization: `Bearer ${token || ""}`, "Content-Type": "application/json" },

          });

          if (!r.ok) return [];

          const j = await r.json().catch(() => ({}));

          const d = j?.data ?? j ?? {};

          const semanal = Array.isArray(d?.semanal) ? d.semanal : Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : [];

          return semanal.map((it) => ({

            semana: Number(it?.semana ?? it?.week ?? it?.label ?? 0) || 0,

            monto: Number(it?.monto ?? it?.total ?? it?.amount ?? 0) || 0,

          }));

        };

        const [ing, egr] = await Promise.all([

          make('/api/ingresos/summary'),

          make('/api/egresos/summary'),

        ]);

        if (!cancelled) {

          setMesIngresos(ing);

          setMesEgresos(egr);

        }

      } catch {}

    };

    run();

    return () => { cancelled = true; };

  }, []);

  // Helpers

  const money = (n) =>

    (n ?? 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });



  // UI

  return (

    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}

                <div className="text-center mb-8">

          <h1 className="text-2xl font-bold text-gray-800">Bienvenido a tu panel, Hernán</h1>

          <p className="text-gray-500 text-base mb-6">Aquí verás un resumen de tu actividad.</p>

        </div>



        {/* Loading / Error inline sin romper hooks */}

        {loading && (

          <div className="text-center text-slate-500 py-10">Cargando…</div>

        )}

        {!loading && error && (

          <div className="text-center text-red-600 py-10">

            Ocurrió un error: {error}

          </div>

        )}



        {/* KPIs */}
        {!loading && !error && (
          <div className="mx-auto max-w-[1000px] px-4 sm:px-0 space-y-8">
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4 sm:gap-6">
              <div className="flex items-center gap-4 bg-white/95 backdrop-blur rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 px-8 py-6 w-full min-w-[280px] sm:w-[320px] min-h-[120px]">
                <FaMoneyBillWave size={28} className="text-emerald-500 shrink-0" />
                <div className="flex flex-col items-start">
                  <div className="text-2xl font-semibold">{money(kpis.ingresos)}</div>
                  <div className="text-sm text-gray-500">Ingresos Totales (mes actual)</div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/95 backdrop-blur rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 px-8 py-6 w-full min-w-[280px] sm:w-[320px] min-h-[120px]">
                <FaFileInvoice size={28} className="text-rose-500 shrink-0" />
                <div className="flex flex-col items-start">
                  <div className="text-2xl font-semibold">{money(kpis.egresos)}</div>
                  <div className="text-sm text-gray-500">Gastos Totales (mes actual)</div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/95 backdrop-blur rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 px-8 py-6 w-full min-w-[280px] sm:w-[320px] min-h-[120px]">
                <FaBalanceScale size={28} className="text-indigo-500 shrink-0" />
                <div className="flex flex-col items-start">
                  <div className={`text-2xl font-semibold ${kpis.balance < 0 ? "text-red-600" : "text-green-600"}`}>{money(kpis.balance)}</div>
                  <div className="text-sm text-gray-500">Balance Neto</div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 p-6">
              <h2 className="text-slate-800 text-lg font-semibold mb-4">Evolución mensual</h2>
              <MonthlyEvolutionChart ingresos={mesIngresos} egresos={mesEgresos} />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 bg-white/95 backdrop-blur rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 p-6">
                <h2 className="text-slate-800 text-lg font-semibold mb-4">Últimos movimientos</h2>
                {Array.isArray(movimientos) && movimientos.length > 0 ? (
                  <ul className="divide-y divide-slate-200">
                    {movimientos.slice(0, 5).map((m, i) => (
                      <li key={i} className="py-3 flex items-center justify-between">
                        <div className="text-slate-700 text-sm">
                          <div className="font-medium">{m?.descripcion || m?.description || "Movimiento"}</div>
                          <div className="text-slate-500">{m?.fecha || m?.date || ""}</div>
                        </div>
                        <div className={`text-sm font-semibold ${m?.tipo === "Egreso" ? "text-red-600" : "text-green-600"}`}>
                          {m?.tipo === "Egreso" ? "-" : "+"}{money(m?.monto ?? m?.amount ?? 0)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-400 text-sm text-center py-10">Aún no registraste movimientos.</div>
                )}
              </div>

              <div className="w-full lg:flex-1 bg-white/95 backdrop-blur rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 p-6">
                <h2 className="text-slate-800 text-lg font-semibold mb-4">Alertas fiscales</h2>
                <div className="space-y-3">
                  {alertasFiscalesMock.map((a) => {
                    const color = a.tipo === "advertencia" ? "text-yellow-500" : a.tipo === "recordatorio" ? "text-blue-500" : a.tipo === "ok" ? "text-green-600" : "text-gray-500";
                    const Icon = a.icono === "CalendarDays" ? CalendarDays : a.icono === "AlertTriangle" ? AlertTriangle : a.icono === "Info" ? Info : CheckCircle2;
                    return (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white shadow-sm">
                        <Icon className={color} size={18} />
                        <p className="text-gray-700 text-sm">{a.mensaje}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
