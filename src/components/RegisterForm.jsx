import { useState } from 'react';
import InputField from './InputField';
import { registerUser } from '../services/AuthService';

function validate(values) {
  const errors = {};
  if (!values.firstName || values.firstName.trim().length < 2) {
    errors.firstName = 'El nombre es requerido (mínimo 2 caracteres).';
  }
  if (!values.lastName || values.lastName.trim().length === 0) {
    errors.lastName = 'El apellido es requerido.';
  }
  if (!values.email) {
    errors.email = 'El correo es requerido.';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      errors.email = 'Ingresá un correo válido.';
    }
  }
  if (!values.cuit) {
    errors.cuit = 'El CUIT es requerido.';
  } else {
    const cuitRegex = /^\d{2}-\d{8}-\d$/;
    if (!cuitRegex.test(values.cuit)) {
      errors.cuit = 'Formato de CUIT inválido (99-99999999-9).';
    }
  }
  if (!values.password) {
    errors.password = 'La contraseña es requerida.';
  } else {
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!pwRegex.test(values.password)) {
      errors.password = 'Mín. 8 caracteres, con mayúscula, minúscula y número.';
    }
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirmá tu contraseña.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }
  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Debés aceptar los términos y condiciones.';
  }
  return errors;
}

export default function RegisterForm() {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cuit: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [globalMessage, setGlobalMessage] = useState(null);
  const [globalType, setGlobalType] = useState(''); // 'success' | 'info' | 'error'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBlur = () => {
    setErrors(validate(values));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate(values);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setGlobalMessage(null);
    try {
      const username = values.email.split('@')[0];
      const payload = {
        username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        cuit: values.cuit,
        planType: 'free',
        acceptedTerms: true,
        provider: 'local',
      };

      const res = await registerUser(payload);
      const { user, jwt } = res || {};

      if (user && user.confirmed && jwt) {
        try {
          localStorage.setItem('token', jwt);
          localStorage.setItem('user', JSON.stringify(user));
        } catch {}
        setGlobalType('success');
        setGlobalMessage('¡Bienvenido a Montri! 🎉 Tu cuenta fue creada con éxito.');
        // Redirigir al dashboard
        setTimeout(() => {
          window.location.assign('/dashboard');
        }, 800);
        return;
      }

      if (user && user.confirmed === false) {
        setGlobalType('info');
        setGlobalMessage('Te enviamos un correo para confirmar tu cuenta antes de iniciar sesión.');
        setTimeout(() => {
          window.location.assign('/login');
        }, 1400);
        return;
      }

      // Caso inesperado pero manejado
      setGlobalType('error');
      setGlobalMessage('Error inesperado. Intentá de nuevo.');
    } catch (err) {
      if (err && err.code === 'NETWORK_ERROR') {
        setGlobalType('error');
        setGlobalMessage('No se pudo conectar al servidor. Intentá nuevamente.');
      } else if (err && err.status === 400) {
        // Heurística sobre mensaje de Strapi
        const apiMsg = err.payload?.error?.message || err.payload?.message || '';
        if (typeof apiMsg === 'string' && apiMsg.toLowerCase().includes('email')) {
          setGlobalType('error');
          setGlobalMessage('Este correo ya está registrado.');
        } else if (typeof apiMsg === 'string' && apiMsg.toLowerCase().includes('username')) {
          setGlobalType('error');
          setGlobalMessage('Este correo ya está registrado.');
        } else {
          setGlobalType('error');
          setGlobalMessage('Datos inválidos. Verificá la información e intentá nuevamente.');
        }
      } else {
        setGlobalType('error');
        setGlobalMessage('Error inesperado. Intentá de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6" noValidate>
      {globalMessage && (
        <div
          role="alert"
          className={
            `mb-4 rounded-xl px-4 py-3 ` +
            (globalType === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : globalType === 'info'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-red-50 text-red-700 border border-red-200')
          }
        >
          {globalMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Nombre"
          name="firstName"
          value={values.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Tu nombre"
          error={errors.firstName}
          disabled={submitting}
        />
        <InputField
          label="Apellido"
          name="lastName"
          value={values.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Tu apellido"
          error={errors.lastName}
          disabled={submitting}
        />
      </div>

      <InputField
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="tu@correo.com"
        error={errors.email}
        disabled={submitting}
      />

      <InputField
        label="CUIT"
        name="cuit"
        value={values.cuit}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="99-99999999-9"
        error={errors.cuit}
        disabled={submitting}
      />

      <InputField
        label="Contraseña"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="••••••••"
        error={errors.password}
        disabled={submitting}
      />

      <InputField
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="••••••••"
        error={errors.confirmPassword}
        disabled={submitting}
      />

      <div className="mb-4 flex items-start gap-3">
        <input
          id="acceptedTerms"
          name="acceptedTerms"
          type="checkbox"
          checked={values.acceptedTerms}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={submitting}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-400"
        />
        <label htmlFor="acceptedTerms" className="text-sm text-gray-700">
          Acepto los{' '}
          <a href="#terms" className="text-green-600 hover:text-green-700 underline">
            términos y condiciones
          </a>
        </label>
      </div>
      {errors.acceptedTerms && (
        <p className="-mt-2 mb-3 text-sm text-red-600">{errors.acceptedTerms}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`w-full py-2 rounded-xl font-semibold text-white transition shadow ` +
          (submitting
            ? 'bg-green-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600')}
        aria-busy={submitting}
      >
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{' '}
        <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
          Iniciá sesión
        </a>
      </p>
    </form>
  );
}

