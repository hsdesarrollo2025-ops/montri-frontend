import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { updateSectionC } from '../services/FiscalProfileService.js';
import FiscalProgress from '../components/FiscalProgress.jsx';

export default function FiscalProfileC() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    acceptsAccuracy: false,
    acceptsTerms: false,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !user) navigate('/login', { replace: true });
  }, [token, user, navigate]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateSectionC(token, form);
      navigate('/perfil-fiscal/completado');
    } catch (err) {
      console.error('Error al guardar Sección C:', err);
      const status = err?.response?.status ?? err?.status;
      if (status === 422) {
        const msg = err?.response?.data?.errores?.join(' ') || 'Debes completar las confirmaciones obligatorias.';
        setError(msg);
      } else {
        setError('Ocurrió un error al guardar la información.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F8FAFF] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Confirmá y finalizá tu perfil fiscal</h1>
          <p className="text-gray-600 mt-1">Revisá que los datos cargados sean correctos y completá las confirmaciones para finalizar el proceso.</p>
        </div>

        <FiscalProgress current="C" />

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Observaciones (opcional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Podés dejar algún comentario adicional..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
              rows={3}
              maxLength={255}
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 select-none">
              <input
                type="checkbox"
                name="acceptsAccuracy"
                checked={form.acceptsAccuracy}
                onChange={handleChange}
                className="h-5 w-5 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-800">Confirmo que los datos ingresados son verídicos.</span>
            </label>

            <label className="flex items-center gap-3 select-none">
              <input
                type="checkbox"
                name="acceptsTerms"
                checked={form.acceptsTerms}
                onChange={handleChange}
                className="h-5 w-5 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-800">Acepto los términos y condiciones de uso del servicio.</span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200">{error}</div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/perfil-fiscal/B')}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Volver
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm"
            >
              {saving ? 'Guardando...' : 'Finalizar perfil fiscal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

