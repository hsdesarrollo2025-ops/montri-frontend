import RegisterForm from '../components/RegisterForm';

export default function Register() {
  return (
    <div className="flex justify-center items-start bg-gradient-to-b from-blue-50 to-white min-h-screen pt-24 pb-16 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-gray-600">
          Completá tus datos para empezar a usar Montri.
        </p>

        <RegisterForm />
      </div>
    </div>
  );
}
