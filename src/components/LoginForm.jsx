import { useState } from 'react';
import InputField from './InputField';
import { loginUser } from '../services/AuthService';

function validate(values) {
  const errors = {};
  if (!values.email) {
    errors.email = 'El correo es requerido.';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      errors.email = 'Ingresá un correo válido.';
    }
  }
  if (!values.password) {
    errors.password = 'La contraseña es requerida.';
  }
  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [globalMessage, setGlobalMessage] = useState(null);
  const [globalType, setGlobalType] = useState(''); // 'success' | 'info' | 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
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
      const payload = { email: values.email, password: values.password };
      const res = await loginUser(payload);
      const { user, jwt } = res || {};

      if (user && jwt) {
        try {
          localStorage.setItem('token', jwt);
          localStorage.setItem('user', JSON.stringify(user));
        } catch {}
        setGlobalType('success');
        setGlobalMessage('¡Bienvenido de nuevo a Montri!');
        setTimeout(() => {
          window.location.assign('/dashboard');
        }, 800);
        return;
      }

      // Caso inesperado
      setGlobalType('error');
      setGlobalMessage('Error inesperado. Intentá de nuevo.');
    } catch (err) {
      if (err && err.code === 'NETWORK_ERROR') {
        setGlobalType('error');
        setGlobalMessage('No se pudo conectar al servidor. Intentá nuevamente.');
      } else if (err && (err.status === 400 || err.status === 401)) {
        const apiMsg = (err.payload?.error?.message || err.message || '').toLowerCase();
        if (apiMsg.includes('invalid') || apiMsg.includes('credencial') || apiMsg.includes('identifier')) {
          setErrors((prev) => ({ ...prev, email: 'Email o contraseña incorrectos.', password: 'Email o contraseña incorrectos.' }));
          setGlobalType('error');
          setGlobalMessage('Credenciales inválidas. Verificá tu email y contraseña.');
        } else if (apiMsg.includes('confirm')) {
          setGlobalType('info');
          setGlobalMessage('Tu cuenta aún no está confirmada. Revisá tu correo.');
        } else {
          setGlobalType('error');
          setGlobalMessage('No pudimos iniciar sesión. Verificá los datos e intentá nuevamente.');
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

      <button
        type="submit"
        disabled={submitting}
        className={`w-full py-2 rounded-xl font-semibold text-white transition shadow ` +
          (submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600')}
        aria-busy={submitting}
      >
        {submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tenés cuenta?{' '}
        <a href="/register" className="text-green-600 hover:text-green-700 font-medium">
          Registrate
        </a>
      </p>
    </form>
  );
}

