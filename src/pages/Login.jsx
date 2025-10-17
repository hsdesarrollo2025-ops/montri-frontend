import LoginForm from '../components/LoginForm.jsx';

export default function Login() {
  return (
    <div className="flex justify-center items-start bg-[#F8FAFF] min-h-screen pt-24 pb-16 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-gray-600">Ingresá con tu cuenta de Montri.</p>

        <LoginForm />
      </div>
    </div>
  );
}

