import React, { useEffect, useState } from "react";
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

// Normaliza entradas mensuales (por si llegan en otro formato)
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const monthIndex = (v) => {
  if (v == null) return -1;
  const s = String(v).toLowerCase();
  const map = { enero: 0, ene: 0, febrero: 1, feb: 1, marzo: 2, mar: 2, abril: 3, abr: 3, mayo: 4, may: 4, junio: 5, jun: 5, julio: 6, jul: 6, agosto: 7, ago: 7, septiembre: 8, set: 8, sep: 8, octubre: 9, oct: 9, noviembre: 10, nov: 10, diciembre: 11, dic: 11 };
  if (map[s] != null) return map[s];
  const m = s.match(/(?:^|[-/])(?:(0?[1-9])|(1[0-2]))/);
  if (m) return (Number(m[1] || m[2]) || 1) - 1;
  return -1;
};

function normalizeMonthly(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .map((it) => {
      const raw = it?.mes ?? it?.month ?? it?.label ?? it?.name ?? "";
      const total = Number(it?.total ?? it?.monto ?? it?.amount ?? 0) || 0;
      const idx = monthIndex(raw);
      const label = idx >= 0 ? MONTHS[idx] : String(raw || "");
      return { semana: label, idx, ingresos: total, egresos: 0 };
    })
    .filter((x) => x.semana !== "");
}

export default function MonthlyEvolutionChart({ ingresos = [], egresos = [] }) {
  const [rango, setRango] = useState("semanal");
  const [inData, setInData] = useState(ingresos || []);
  const [outData, setOutData] = useState(egresos || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cuando cambia el rango
  useEffect(() => {
    let cancelled = false;
    const fetchRange = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const base = import.meta.env.VITE_API_BASE_URL || "https://montri-backend.onrender.com";
        const endpoints =
          rango === "mensual"
            ? ["/api/ingresos/summary-mensual", "/api/egresos/summary-mensual"]
            : ["/api/ingresos/summary", "/api/egresos/summary"];
        const headers = { Authorization: `Bearer ${token || ""}`, "Content-Type": "application/json" };
        const [ri, re] = await Promise.all([
          fetch(`${base}${endpoints[0]}`, { headers }),
          fetch(`${base}${endpoints[1]}`, { headers }),
        ]);
        const parse = async (r) => {
          if (!r || !r.ok) return null;
          const j = await r.json().catch(() => ({}));
          return j?.data ?? j ?? null;
        };
        const di = await parse(ri);
        const de = await parse(re);
        if (!cancelled) {
          // Para semanal esperamos objeto con semanal: []
          if (rango === "semanal") {
            setInData(Array.isArray(di?.semanal) ? di.semanal : Array.isArray(di) ? di : []);
            setOutData(Array.isArray(de?.semanal) ? de.semanal : Array.isArray(de) ? de : []);
          } else {
            // Mensual: arreglo de { mes, monto } o similar
            setInData(Array.isArray(di) ? di : Array.isArray(di?.items) ? di.items : []);
            setOutData(Array.isArray(de) ? de : Array.isArray(de?.items) ? de.items : []);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Vista mensual aún no disponible");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRange();
    return () => {
      cancelled = true;
    };
  }, [rango]);

  // Construcción de data para el gráfico según rango
  const buildWeekly = (ing = [], egr = []) => {
    const toWeekMap = (arr = []) => {
      const m = new Map();
      for (const it of arr) {
        const w = Number(it?.semana ?? it?.week ?? it?.label ?? 0) || 0;
        const val = Number(it?.monto ?? it?.total ?? it?.amount ?? 0) || 0;
        m.set(w, val);
      }
      return m;
    };
    const wIn = toWeekMap(ing);
    const wOut = toWeekMap(egr);
    const keys = new Set([...wIn.keys(), ...wOut.keys()]);
    return Array.from(keys)
      .sort((a, b) => a - b)
      .map((k) => ({ label: `Semana ${k}`, ingresos: wIn.get(k) || 0, egresos: wOut.get(k) || 0 }));
  };

  const buildMonthly = (ing = [], egr = []) => {
    const inNorm = normalizeMonthly(ing);
    const outNorm = normalizeMonthly(egr).map((x) => ({ ...x, egresos: x.ingresos, ingresos: 0 }));
    const map = new Map();
    for (const i of inNorm) {
      const key = i.idx >= 0 ? i.idx : i.semana;
      map.set(key, { label: i.semana, idx: i.idx, ingresos: i.ingresos, egresos: 0 });
    }
    for (const e of outNorm) {
      const key = e.idx >= 0 ? e.idx : e.semana;
      const prev = map.get(key) || { label: e.semana, idx: e.idx, ingresos: 0, egresos: 0 };
      prev.egresos = e.egresos;
      map.set(key, prev);
    }
    return Array.from(map.values()).sort((a, b) => (a.idx ?? 99) - (b.idx ?? 99));
  };

  const series = rango === "semanal" ? buildWeekly(inData, outData) : buildMonthly(inData, outData);
  const hasAny = series.length > 0 && series.some((d) => (d.ingresos || 0) !== 0 || (d.egresos || 0) !== 0);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div />
        <select
          className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 focus:outline-none"
          value={rango}
          onChange={(e) => setRango(e.target.value)}
        >
          <option value="semanal">Semanal</option>
          <option value="mensual">Mensual</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center text-slate-500 py-10">Cargando…</div>
      ) : error ? (
        <div className="text-center text-slate-500 py-10">{error}</div>
      ) : hasAny ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" name="Ingresos" fill="#3b82f6" />
              <Bar dataKey="egresos" name="Gastos" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-slate-500 text-sm text-center py-10">No hay datos suficientes para el gráfico.</div>
      )}
    </>
  );
}
