import React from "react";
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
  const isWeekly = (arr) => Array.isArray(arr) && arr.some((x) => x && (x.semana != null || x.week != null || x?.label?.toString().toLowerCase().includes("semana")));

  let data = [];
  if (isWeekly(ingresos) || isWeekly(egresos)) {
    // Modo semanal: combinar por número de semana
    const toWeekMap = (arr = []) => {
      const m = new Map();
      for (const it of arr) {
        const w = Number(it?.semana ?? it?.week ?? it?.label ?? 0) || 0;
        const val = Number(it?.monto ?? it?.total ?? it?.amount ?? 0) || 0;
        m.set(w, val);
      }
      return m;
    };
    const inMap = toWeekMap(ingresos);
    const outMap = toWeekMap(egresos);
    const keys = new Set([...inMap.keys(), ...outMap.keys()]);
    data = Array.from(keys)
      .sort((a, b) => a - b)
      .map((k) => ({ semana: `Semana ${k}`, ingresos: inMap.get(k) || 0, egresos: outMap.get(k) || 0 }));
  } else {
    // Modo mensual (fallback): combinar por mes
    const inNorm = normalizeMonthly(ingresos);
    const outNorm = normalizeMonthly(egresos);
    const map = new Map();
    for (const i of inNorm) {
      const key = i.idx >= 0 ? i.idx : i.semana;
      map.set(key, { ...i });
    }
    for (const e of outNorm) {
      const key = e.idx >= 0 ? e.idx : e.semana;
      const prev = map.get(key) || { semana: e.semana, idx: e.idx, ingresos: 0, egresos: 0 };
      prev.egresos = e.ingresos; // en outNorm, "ingresos" contiene el total del arreglo de egresos
      map.set(key, prev);
    }
    data = Array.from(map.values()).sort((a, b) => (a.idx ?? 99) - (b.idx ?? 99));
  }

  const hasAny = data.length > 0 && data.some((d) => (d.ingresos || 0) !== 0 || (d.egresos || 0) !== 0);
  if (!hasAny) {
    return <div className="text-slate-500 text-sm text-center py-10">No hay datos suficientes para el gráfico.</div>;
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semana" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ingresos" name="Ingresos" fill="#3b82f6" />
          <Bar dataKey="egresos" name="Gastos" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

