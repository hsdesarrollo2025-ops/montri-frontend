import React, { useMemo } from "react";
import { CalendarDays, AlertTriangle, CheckCircle2, Info } from "lucide-react";

function colorByType(tipo) {
  switch (tipo) {
    case "recordatorio":
      return { text: "text-blue-600", border: "border-blue-200", bg: "bg-blue-50" };
    case "advertencia":
      return { text: "text-amber-700", border: "border-amber-200", bg: "bg-amber-50" };
    case "informativo":
      return { text: "text-gray-600", border: "border-gray-200", bg: "bg-gray-50" };
    default:
      return { text: "text-emerald-700", border: "border-emerald-200", bg: "bg-emerald-50" };
  }
}

function iconByName(name = "") {
  if (name === "CalendarDays") return CalendarDays;
  if (name === "AlertTriangle") return AlertTriangle;
  if (name === "Info") return Info;
  return CheckCircle2;
}

export default function FiscalAlerts({ user, totalIngresos = 0, limiteCategoria = 0, preset }) {
  // Debug temporal: verificar llegada del mock
  // eslint-disable-next-line no-console
  console.log("Alertas recibidas (preset):", preset);

  const alerts = useMemo(() => {
    if (Array.isArray(preset) && preset.length > 0) return preset;
    const arr = [];

    if (user?.regimen === "Monotributista") {
      arr.push({
        tipo: "recordatorio",
        mensaje: "Recordá pagar tu monotributo antes del día 20 de este mes.",
        icono: "CalendarDays",
      });
    }

    const limite = Number(limiteCategoria || user?.categoria?.limite || user?.categoryLimit || 0) || 0;
    if (limite > 0 && Number(totalIngresos) >= limite * 0.8) {
      arr.push({
        tipo: "advertencia",
        mensaje: "Estás alcanzando el límite de facturación de tu categoría.",
        icono: "AlertTriangle",
      });
    }

    if (arr.length === 0) {
      arr.push({ tipo: "ok", mensaje: "Sin alertas por ahora.", icono: "CheckCircle2" });
    }
    return arr;
  }, [user, totalIngresos, limiteCategoria, preset]);

  return (
    <div>
      {alerts.map((a, i) => {
        const Icon = iconByName(a.icono);
        const c = colorByType(a.tipo);
        return (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-md border ${c.border} ${c.bg} mb-2`}>
            <Icon className={`${c.text}`} size={18} />
            <p className="text-gray-700 text-sm">{a.mensaje}</p>
          </div>
        );
      })}
    </div>
  );
}
