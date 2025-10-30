import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getIngresos, getEgresos } from "../../services/movimientosService.js";
import ModalNuevoIngreso from "../../components/movimientos/ModalNuevoIngreso.jsx";
import ModalNuevoEgreso from "../../components/movimientos/ModalNuevoEgreso.jsx";

export default function Movimientos() {
  const [ingresos, setIngresos] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showIngresoModal, setShowIngresoModal] = useState(false);
  const [showEgresoModal, setShowEgresoModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { user, token } = useAuth();
  const fetchMovimientos = useCallback(async () => {
    try {
      if (!user?.id) {
        console.log("[Movimientos] userId no disponible; se omite fetch.");
        setLoading(false);
        return;
      }
      setLoading(true);
      const userId = user.id;
      const apiBase = import.meta.env.VITE_API_BASE_URL || "https://montri-backend.onrender.com";
      console.log("🔍 Cargando ingresos de usuario:", userId);
      console.log(`✅ GET ${apiBase}/api/ingresos`);
      console.log(`✅ GET ${apiBase}/api/egresos`);

      const [li, le] = await Promise.all([
        getIngresos(userId, token, apiBase),
        getEgresos(userId, token, apiBase),
      ]);
      setIngresos(Array.isArray(li) ? li : []);
      setEgresos(Array.isArray(le) ? le : []);
      setError("");
    } catch (e) {
      setError(e?.message || "Error al cargar movimientos");
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return; // evitar doble ejecución en StrictMode
    fetchedRef.current = true;
    fetchMovimientos();
  }, [fetchMovimientos]);

  const movimientos = useMemo(() => {
    const mapItem = (it, tipo) => ({
      ...it,
      tipo,
      _fecha: new Date(it?.fecha || it?.date || it?.createdAt || 0),
      _monto: Number(it?.monto ?? it?.amount ?? 0) || 0,
      _desc: it?.descripcion || it?.description || "",
    });
    const merged = [
      ...(Array.isArray(ingresos) ? ingresos.map((x) => mapItem(x, "Ingreso")) : []),
      ...(Array.isArray(egresos) ? egresos.map((x) => mapItem(x, "Egreso")) : []),
    ];
    return merged.sort((a, b) => b._fecha - a._fecha);
  }, [ingresos, egresos]);

  const money = (n) => (n ?? 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {successMsg && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {successMsg}
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Movimientos registrados</h1>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowIngresoModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              + Nuevo ingreso
            </button>
            <button
              type="button"
              onClick={() => setShowEgresoModal(true)}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
            >
              + Nuevo egreso
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center text-slate-500 py-10">Cargando movimientos…</div>
        )}
        {!loading && error && (
          <div className="text-center text-red-600 py-10">{error}</div>
        )}

        {!loading && !error && (
          <div className="bg-white/95 backdrop-blur rounded-xl shadow-md border border-slate-200 overflow-hidden">
            {movimientos.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-10">No hay movimientos aún</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wide px-4 py-3">Descripción</th>
                      <th className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wide px-4 py-3">Fecha</th>
                      <th className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wide px-4 py-3">Monto</th>
                      <th className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wide px-4 py-3">Tipo</th>
                      <th className="text-right text-slate-600 text-xs font-semibold uppercase tracking-wide px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {movimientos.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-800 font-medium">{m._desc || "Movimiento"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-600">{(m?.fecha || m?.date || m?._fecha?.toISOString()?.slice(0,10) || "").toString()}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-sm font-semibold ${m.tipo === "Egreso" ? "text-red-600" : "text-green-600"}`}>
                            {m.tipo === "Egreso" ? "-" : "+"}{money(m._monto)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${m.tipo === "Egreso" ? "text-rose-600 border-rose-200 bg-rose-50" : "text-emerald-600 border-emerald-200 bg-emerald-50"}`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button type="button" onClick={() => { /* TODO: editar */ }} className="px-3 py-1.5 text-xs rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700">Editar</button>
                            <button type="button" onClick={() => { /* TODO: eliminar */ }} className="px-3 py-1.5 text-xs rounded-md border border-rose-200 hover:bg-rose-50 text-rose-700">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {showIngresoModal && (
          <ModalNuevoIngreso
            open={showIngresoModal}
            onClose={() => setShowIngresoModal(false)}
            onCreated={() => {
              fetchMovimientos();
              setSuccessMsg("Ingreso registrado correctamente");
              setTimeout(() => setSuccessMsg(""), 3000);
            }}
          />
        )}

        {showEgresoModal && (
          <ModalNuevoEgreso
            open={showEgresoModal}
            onClose={() => setShowEgresoModal(false)}
            onCreated={() => {
              fetchMovimientos();
              setSuccessMsg("Egreso registrado correctamente");
              setTimeout(() => setSuccessMsg(""), 3000);
            }}
          />
        )}
      </div>
    </div>
  );
}
