import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { updateSectionA, getFiscalProfile } from '../services/FiscalProfileService.js';
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

export default function FiscalProfileA() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user) {
      navigate('/login', { replace: true });
    }
  }, [token, user, navigate]);

  const initial = useMemo(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    documentType: 'DNI',
    documentNumber: '',
    cuit: user?.cuit || user?.taxId || '',
    addressStreet: '',
    addressNumber: '',
    city: '',
    province: '',
    postalCode: '',
    email: user?.email || '',
    phone: '',
  }), [user]);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const saveTimerRef = useRef(null);

  const draftKey = useMemo(() => `fiscal_profile_a_draft:${user?.id || user?.email || 'anon'}`, [user?.id, user?.email]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        // Mantener datos del backend para evitar arrastrar de otro usuario
        const merged = {
          ...initial,
          ...saved,
          firstName: initial.firstName,
          lastName: initial.lastName,
          email: initial.email,
        };
        setForm(merged);
      } else {
        setForm(initial);
      }
    } catch { setForm(initial); }

    // Intentar traer datos del backend si existen (tienen prioridad)
    (async () => {
      if (!user?.id || !token) return;
      const data = await getFiscalProfile(token, user.id);
      if (!data) return;
      try {
        const a = data?.sectionA || data?.a || {};
        const next = { ...form };
        const map = {
          firstName: a.firstName,
          lastName: a.lastName,
          documentType: a.documentType,
          documentNumber: a.documentNumber,
          cuit: a.cuit,
          addressStreet: a.addressStreet,
          addressNumber: a.addressNumber,
          city: a.city,
          province: a.province,
          postalCode: a.postalCode,
          email: a.email,
          phone: a.phone,
        };
        Object.keys(map).forEach((k) => {
          if (map[k] !== undefined && map[k] !== null && map[k] !== '') next[k] = String(map[k]);
        });
        setForm((prev) => ({ ...prev, ...next }));
      } catch {}
    })();
  }, [initial, draftKey, token, user?.id]);

  const normalizeDigits = (str) => String(str || '').replace(/\D/g, '');
  const formatCuit = (digits) => {
    const d = normalizeDigits(digits).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
  };

  const onChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === 'cuit') {
      value = normalizeDigits(value).slice(0, 11);
    }
    if (name === 'documentType') {
      setForm((f) => {
        const next = { ...f, documentType: value };
        if (value === 'DNI') {
          next.documentNumber = normalizeDigits(f.documentNumber).slice(0, 10);
        }
        return next;
      });
      setErrors((prev) => ({ ...prev, documentNumber: undefined }));
      return;
    }
    if (name === 'documentNumber') {
      const type = form.documentType;
      if (type === 'DNI') {
        value = normalizeDigits(value).slice(0, 10);
      } else {
        value = String(value).slice(0, 20);
      }
    }

    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, { ...form, [name]: value }) }));
  };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const provinciasSet = useMemo(() => new Set(PROVINCIAS_AR), []);

  function validateField(key, state = form) {
    const value = (state[key] ?? '').toString().trim();
    if (key === 'firstName') return value.length >= 2 ? '' : 'Ingresá un nombre válido (mínimo 2 caracteres).';
    if (key === 'lastName') return value.length >= 2 ? '' : 'Ingresá un apellido válido (mínimo 2 caracteres).';
    if (key === 'documentType') return value ? '' : 'Seleccioná un tipo de documento.';
    if (key === 'documentNumber') {
      if (!value) return 'Ingresá un número de documento válido.';
      if (state.documentType === 'DNI') {
        const digits = normalizeDigits(value);
        if (digits.length < 7 || digits.length > 10) return 'Ingresá un DNI válido (7 a 10 dígitos).';
      } else {
        if (value.length < 4) return 'Ingresá un documento válido.';
      }
      return '';
    }
    if (key === 'cuit') {
      const digits = normalizeDigits(value);
      if (digits.length !== 11) return 'Ingresá tu CUIT sin puntos ni guiones';
      return '';
    }
    if (key === 'addressStreet') return value ? '' : 'Ingresá una calle válida.';
    if (key === 'addressNumber') return value ? '' : 'Ingresá un número válido.';
    if (key === 'city') return value ? '' : 'Ingresá una ciudad válida.';
    if (key === 'province') {
      if (!value) return 'Seleccioná una provincia.';
      if (!provinciasSet.has(value)) return 'Seleccioná una provincia válida.';
      return '';
    }
    if (key === 'postalCode') {
      const digits = normalizeDigits(value);
      if (digits.length < 4 || digits.length > 5) return 'Ingresá un código postal válido (4 a 5 dígitos).';
      return '';
    }
    if (key === 'email') return emailRe.test(value) ? '' : 'Ingresá un correo electrónico válido.';
    return '';
  }

  function validar() {
    const keys = [
      'firstName',
      'lastName',
      'documentType',
      'documentNumber',
      'cuit',
      'addressStreet',
      'addressNumber',
      'city',
      'province',
      'postalCode',
      'email',
    ];
    const e = {};
    keys.forEach((k) => {
      const msg = validateField(k);
      if (msg) e[k] = msg;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  useEffect(() => {
    if (!form) return;
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

  async function onSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validar()) return;
    try {
      setSaving(true);
      await updateSectionA(token, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        documentType: form.documentType,
        documentNumber: form.documentNumber.trim(),
        cuit: form.cuit,
        addressStreet: form.addressStreet.trim(),
        addressNumber: form.addressNumber.trim(),
        city: form.city.trim(),
        province: form.province,
        postalCode: form.postalCode.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      try { localStorage.removeItem(draftKey); } catch {}
      setToastType('success');
      setToastMsg('Datos guardados correctamente');
      setTimeout(() => navigate('/perfil-fiscal/B'), 700);
    } catch (err) {
      const status = err?.status;
      const payload = err?.payload;
      if (status === 400 || status === 422) {
        const beErrors = payload?.errors || payload?.error?.errors;
        if (beErrors && typeof beErrors === 'object') {
          const mapped = {};
          Object.keys(beErrors).forEach((k) => {
            const msg = Array.isArray(beErrors[k]) ? beErrors[k][0] : beErrors[k];
            if (k in form) mapped[k] = String(msg || '').trim();
          });
          if (Object.keys(mapped).length) setErrors((prev) => ({ ...prev, ...mapped }));
        }
        setServerError('Verificá los datos ingresados. Algunos campos no cumplen el formato requerido.');
        setToastType('error');
        setToastMsg(err.message || 'Error al guardar los datos');
      } else {
        setServerError('Ocurrió un error al guardar la información. Intentalo nuevamente.');
        setToastType('error');
        setToastMsg(err.message || 'Error al guardar los datos');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#F8FAFF] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Completá tus datos personales para comenzar tu perfil fiscal</h1>
          <p className="text-gray-600 mt-1">Esta información se utilizará para definir tu situación fiscal en Montri.</p>
        </div>
        <FiscalProgress current="A" />

        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5" noValidate>
          {serverError ? (
            <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200" role="alert">{serverError}</div>
          ) : null}
          <div className="sr-only" aria-live="polite" role="status">
            {draftStatus === 'guardando' ? 'Guardando borrador...' : draftStatus === 'guardado' ? 'Borrador guardado' : ''}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={onChange}
                placeholder="Ej: Juan"
                aria-invalid={Boolean(errors.firstName) || undefined}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.firstName && <p id="firstName-error" className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={onChange}
                placeholder="Ej: Pérez"
                aria-invalid={Boolean(errors.lastName) || undefined}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.lastName && <p id="lastName-error" className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">Tipo de documento</label>
              <select
                id="documentType"
                name="documentType"
                value={form.documentType}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.documentType && <p className="mt-1 text-sm text-red-600">{errors.documentType}</p>}
            </div>
            <div>
              <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700">Número de documento</label>
              <input
                id="documentNumber"
                name="documentNumber"
                value={form.documentNumber}
                onChange={onChange}
                placeholder="Ej: 12345678"
                inputMode={form.documentType === 'DNI' ? 'numeric' : undefined}
                aria-invalid={Boolean(errors.documentNumber) || undefined}
                aria-describedby={errors.documentNumber ? 'documentNumber-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.documentNumber && <p id="documentNumber-error" className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cuit" className="block text-sm font-medium text-gray-700">CUIT</label>
              <input
                id="cuit"
                name="cuit"
                value={form.cuit}
                onChange={onChange}
                placeholder="Ej: 20123456789"
                aria-invalid={Boolean(errors.cuit) || undefined}
                aria-describedby={errors.cuit ? 'cuit-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
              />
              {errors.cuit && <p id="cuit-error" className="mt-1 text-sm text-red-600">{errors.cuit}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="Ej: +54 9 11 2345 6789"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="addressStreet" className="block text-sm font-medium text-gray-700">Calle</label>
              <input
                id="addressStreet"
                name="addressStreet"
                value={form.addressStreet}
                onChange={onChange}
                placeholder="Ej: Corrientes"
                aria-invalid={Boolean(errors.addressStreet) || undefined}
                aria-describedby={errors.addressStreet ? 'addressStreet-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.addressStreet && <p id="addressStreet-error" className="mt-1 text-sm text-red-600">{errors.addressStreet}</p>}
            </div>
            <div>
              <label htmlFor="addressNumber" className="block text-sm font-medium text-gray-700">Número</label>
              <input
                id="addressNumber"
                name="addressNumber"
                value={form.addressNumber}
                onChange={onChange}
                placeholder="Ej: 1234"
                aria-invalid={Boolean(errors.addressNumber) || undefined}
                aria-describedby={errors.addressNumber ? 'addressNumber-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.addressNumber && <p id="addressNumber-error" className="mt-1 text-sm text-red-600">{errors.addressNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
              <input
                id="city"
                name="city"
                value={form.city}
                onChange={onChange}
                placeholder="Ej: Rosario"
                aria-invalid={Boolean(errors.city) || undefined}
                aria-describedby={errors.city ? 'city-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.city && <p id="city-error" className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">Provincia</label>
              <input
                id="province"
                name="province"
                value={form.province}
                onChange={onChange}
                placeholder="Seleccioná una provincia"
                list="provincias"
                aria-invalid={Boolean(errors.province) || undefined}
                aria-describedby={errors.province ? 'province-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <datalist id="provincias">
                {PROVINCIAS_AR.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              {errors.province && <p id="province-error" className="mt-1 text-sm text-red-600">{errors.province}</p>}
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Código postal</label>
              <input
                id="postalCode"
                name="postalCode"
                value={form.postalCode}
                onChange={onChange}
                placeholder="Ej: 2000"
                aria-invalid={Boolean(errors.postalCode) || undefined}
                aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.postalCode && <p id="postalCode-error" className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Ej: usuario@correo.com"
                readOnly
                aria-invalid={Boolean(errors.email) || undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={saving}
            >
              {saving ? 'Guardando información...' : 'Guardar y continuar'}
            </button>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => navigate('/dashboard')}
            >
              Salir y continuar después
            </button>
          </div>
        </form>

        {saving && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
            <div className="bg-white border border-gray-100 shadow-lg rounded-2xl px-6 py-5 flex items-center gap-4">
              <span className="inline-block h-5 w-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin" aria-hidden="true" />
              <p className="text-gray-800 font-medium">Guardando información...</p>
            </div>
          </div>
        )}

        {!!toastMsg && (
          <div
            className={`fixed right-4 bottom-6 z-50 px-4 py-3 rounded-lg shadow-md text-white ${toastType === 'success' ? 'bg-green-600' : 'bg-rose-600'}`}
            role="status" aria-live="polite"
          >
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
