import React, { useMemo, useState } from 'react';
import { useEnums } from '../../hooks/useEnums';

export default function ModalNuevoIngreso({ open = true, onClose, onCreated }) {
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [metodoCobro, setMetodoCobro] = useState('');
  const [comprobante, setComprobante] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maxDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : undefined;
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://montri-backend.onrender.com';
  const { data: enumsData, loading: enumsLoading, error: enumsError } = useEnums(apiBase, token);

  const decodeUserId = (token) => {
    try {
      const payload = token?.split('.')[1];
      if (!payload) return null;
      const json = JSON.parse(atob(payload));
      return json?.id || json?.userId || json?.user?.id || null;
    } catch {
      return null;
    }
  };

  const validate = () => {
    const errs = [];
    if (!descripcion.trim()) errs.push('La descripción es obligatoria');
    if (!fecha) errs.push('La fecha es obligatoria');
    if (fecha && fecha > maxDate) errs.push('La fecha no puede ser futura');
    const nMonto = Number(monto);
    if (!Number.isFinite(nMonto) || nMonto <= 0) errs.push('El monto debe ser mayor a 0');
    if (!categoria) errs.push('La categoría es obligatoria');
    if (!metodoCobro) errs.push('El método de cobro es obligatorio');
    if (errs.length) {
      setError(errs[0]);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_BASE_URL || 'https://montri-backend.onrender.com';
      const userId = decodeUserId(token);

      const payload = {
        data: {
          descripcion: descripcion.trim(),
          monto: Number(monto),
          fecha,
          categoria,
          metodo_cobro: metodoCobro,
          comprobante: comprobante?.trim() || undefined,
        },
      };
      if (userId) {
        payload.data.user = userId; // si el modelo espera relación user
        payload.data.userId = userId; // fallback si espera userId
      }

      const res = await fetch(`${base}/api/ingresos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'No se pudo registrar el ingreso');
      }

      if (typeof onCreated === 'function') onCreated();
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      setError(err?.message || 'No se pudo registrar el ingreso');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-lg border border-slate-200 p-6 transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Nuevo ingreso</h2>
          <button type="button" className="text-slate-500 hover:text-slate-700" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        {enumsLoading && (
          <div className="mb-4 text-sm text-slate-600">Cargando opciones…</div>
        )}
        {(enumsError || !enumsData) && !enumsLoading && (
          <div className="mb-4 text-sm text-red-600">Error cargando opciones</div>
        )}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Venta de producto"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                max={maxDate}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                disabled={enumsLoading || !enumsData}
              >
                <option value="" disabled>Seleccione</option>
                {(enumsData?.ingresos?.categorias || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de cobro</label>
              <select
                value={metodoCobro}
                onChange={(e) => setMetodoCobro(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                disabled={enumsLoading || !enumsData}
              >
                <option value="" disabled>Seleccione</option>
                {(enumsData?.ingresos?.metodo_cobro || []).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante (opcional)</label>
            <input
              type="text"
              value={comprobante}
              onChange={(e) => setComprobante(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ej: A1234"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed`}
              disabled={submitting}
            >
              {submitting ? 'Guardando…' : 'Guardar ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
