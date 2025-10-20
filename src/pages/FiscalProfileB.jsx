import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getTaxCategories, updateSectionB, getFiscalProfile } from '../services/FiscalProfileService.js';
import FiscalProgress from '../components/FiscalProgress.jsx';

const PROVINCIAS_AR = [
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

export default function FiscalProfileB() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user) navigate('/login', { replace: true });
  }, [token, user, navigate]);

  const [form, setForm] = useState({
    regimen: 'Monotributista',
    startDate: '',
    category: '',
    annualRevenue: '',
    activity: '',
    province: '',
    customerType: 'Consumidor final',
    monthlyOperations: '',
    hasEmployees: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');
  const saveTimerRef = useRef(null);

  const fmtARS = useMemo(() => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }), []);

  useEffect(() => {
    if (form.regimen === 'Monotributista' && categories.length === 0) {
      (async () => {
        try {
          setLoadingCategories(true);
          const data = await getTaxCategories();
          const list = Array.isArray(data?.categories) ? data.categories : Array.isArray(data) ? data : [];
          setCategories(list);
        } catch (e) {
          console.error('No se pudieron cargar categorías:', e);
        } finally {
          setLoadingCategories(false);
        }
      })();
    }
  }, [form.regimen, categories.length]);

  const provinciasSet = useMemo(() => new Set(PROVINCIAS_AR), []);

  // Draft key per user
  const draftKey = useMemo(() => `fiscal_profile_b_draft:${user?.id || user?.email || 'anon'}`, [user?.id, user?.email]);

  // Cargar borrador y datos backend (si existen tienen prioridad)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        setForm((f) => ({ ...f, ...saved }));
      }
    } catch {}
    (async () => {
      if (!user?.id || !token) return;
      const data = await getFiscalProfile(token, user.id);
      const b = data?.sectionB || data?.b || {};
      if (b && typeof b === 'object') {
        setForm((f) => ({
          ...f,
          regimen: b.regimen || f.regimen,
          startDate: b.startDate || f.startDate,
          category: b.category || f.category,
          annualRevenue: b.annualRevenue != null ? String(b.annualRevenue) : f.annualRevenue,
          activity: b.activity || f.activity,
          province: b.province || f.province,
          customerType: b.customerType || f.customerType,
          monthlyOperations: b.monthlyOperations != null ? String(b.monthlyOperations) : f.monthlyOperations,
          hasEmployees: typeof b.hasEmployees === 'boolean' ? b.hasEmployees : f.hasEmployees,
        }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, token, user?.id]);

  // Guardado automático del borrador con debounce
  useEffect(() => {
    setDraftStatus('guardando');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(form));
        setDraftStatus('guardado');
      } catch {}
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [form, draftKey]);

  const onChange = (e) => {
    const { name, type } = e.target;
    let value = type === 'checkbox' ? e.target.checked : e.target.value;
    if (name === 'annualRevenue') {
      value = value.replace(/[^0-9.]/g, '');
    }
    if (name === 'regimen') {
      setForm((f) => ({ ...f, regimen: value, category: '' }));
      setErrors((prev) => ({ ...prev, category: undefined }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  function validar() {
    const e = {};
    if (!form.regimen) e.regimen = 'Seleccioná un régimen.';
    if (!form.province) e.province = 'Seleccioná una provincia.';
    else if (!provinciasSet.has(form.province)) e.province = 'Seleccioná una provincia válida.';

    const rev = Number(form.annualRevenue);
    if (!rev || rev <= 0) e.annualRevenue = 'Ingresá una facturación mayor a 0.';

    if (form.startDate) {
      const today = new Date();
      const d = new Date(form.startDate + 'T00:00:00');
      if (d > new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        e.startDate = 'La fecha no puede ser futura.';
      }
    }

    if (form.regimen === 'Monotributista') {
      if (!form.category) e.category = 'Seleccioná una categoría.';
      const cat = categories.find((c) => c?.code === form.category || c?.id === form.category || c?.name === form.category);
      const limit = cat?.limit ?? cat?.limitAnnual ?? cat?.maxAnnual ?? cat?.annualMax ?? cat?.annualLimit;
      if (limit && rev > Number(limit)) {
        e.annualRevenue = `La facturación supera el tope de la categoría (${fmtARS.format(Number(limit))}).`;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validar()) return;
    try {
      setSaving(true);
      await updateSectionB(token, {
        regimen: form.regimen,
        startDate: form.startDate || null,
        category: form.category || null,
        annualRevenue: form.annualRevenue ? Number(form.annualRevenue) : null,
        activity: form.activity || '',
        province: form.province,
        customerType: form.customerType,
        monthlyOperations: form.monthlyOperations ? Number(form.monthlyOperations) : null,
        hasEmployees: !!form.hasEmployees,
      });
      try { localStorage.removeItem(draftKey); } catch {}
      navigate('/perfil-fiscal/C');
    } catch (err) {
      const status = err?.status;
      const payload = err?.payload;
      if (status === 400 || status === 422) {
        const beErrors = payload?.errors || payload?.error?.errors;
        if (beErrors && typeof beErrors === 'object') {
          const mapped = {};
          Object.keys(beErrors).forEach((k) => {
            const msg = Array.isArray(beErrors[k]) ? beErrors[k][0] : beErrors[k];
            mapped[k] = String(msg || '').trim();
          });
          setErrors((prev) => ({ ...prev, ...mapped }));
        }
        const msg = payload?.message || payload?.error?.message;
        if (msg) setServerError(String(msg));
      } else {
        setServerError('Ocurrió un error al guardar la información. Intentalo nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F8FAFF] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Definí tu régimen fiscal y los datos de tu actividad.</h1>
          <p className="text-gray-600 mt-1">Completá la información para continuar con tu perfil fiscal.</p>
        </div>

        <FiscalProgress current="B" />
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5" noValidate>
          {serverError ? (
            <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200" role="alert">{serverError}</div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="regimen" className="block text-sm font-medium text-gray-700">Régimen</label>
              <select
                id="regimen"
                name="regimen"
                value={form.regimen}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Monotributista">Monotributista</option>
                <option value="Responsable Inscripto">Responsable Inscripto</option>
              </select>
              {errors.regimen && <p className="mt-1 text-sm text-red-600">{errors.regimen}</p>}
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha de inicio de actividad</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>
          </div>

          {form.regimen === 'Monotributista' && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
              {loadingCategories ? (
                <div className="mt-1 text-sm text-gray-600">Cargando categorías...</div>
              ) : (
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccioná una categoría</option>
                  {categories.map((c) => {
                    const code = c?.code || c?.id || c?.name;
                    const limit = c?.limit ?? c?.limitAnnual ?? c?.maxAnnual ?? c?.annualMax ?? c?.annualLimit;
                    const label = code ? `Categoría ${code} – hasta ${limit ? fmtARS.format(Number(limit)) : 'N/A'} anual` : String(c?.name || 'Categoría');
                    return (
                      <option key={String(code)} value={String(code)}>{label}</option>
                    );
                  })}
                </select>
              )}
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700">Facturación anual estimada</label>
              <input
                id="annualRevenue"
                name="annualRevenue"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={form.annualRevenue}
                onChange={onChange}
                placeholder="Ej: 1500000"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.annualRevenue && <p className="mt-1 text-sm text-red-600">{errors.annualRevenue}</p>}
            </div>
            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-700">Actividad principal</label>
              <input
                id="activity"
                name="activity"
                value={form.activity}
                onChange={onChange}
                placeholder="Ej: Servicios profesionales"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.activity && <p className="mt-1 text-sm text-red-600">{errors.activity}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">Provincia donde realizás la actividad</label>
              <select
                id="province"
                name="province"
                value={form.province}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccioná una provincia</option>
                {PROVINCIAS_AR.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province}</p>}
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">Tipo de cliente</span>
              <div className="mt-2 flex flex-wrap gap-4">
                {['Consumidor final', 'Contribuyente registrado', 'Mixto'].map((t) => (
                  <label key={t} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="customerType"
                      value={t}
                      checked={form.customerType === t}
                      onChange={onChange}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="monthlyOperations" className="block text-sm font-medium text-gray-700">Operaciones mensuales (opcional)</label>
              <input
                id="monthlyOperations"
                name="monthlyOperations"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={form.monthlyOperations}
                onChange={onChange}
                placeholder="Ej: 50"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-3 select-none">
                <input
                  type="checkbox"
                  name="hasEmployees"
                  checked={form.hasEmployees}
                  onChange={onChange}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">Tiene empleados</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => navigate('/perfil-fiscal/A')}
            >
              Volver
            </button>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => { try { localStorage.setItem(draftKey, JSON.stringify(form)); } catch {}; navigate('/dashboard'); }}
            >
              Salir y continuar después
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={saving}
            >
              {saving ? 'Guardando información...' : 'Guardar y continuar'}
            </button>
          </div>

          {saving && (
            <div className="fixed inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
              <div className="bg-white border border-gray-100 shadow-lg rounded-2xl px-6 py-5 flex items-center gap-4">
                <span className="inline-block h-5 w-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin" aria-hidden="true" />
                <p className="text-gray-800 font-medium">Guardando información...</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
