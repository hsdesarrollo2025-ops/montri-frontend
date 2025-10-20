import { useAuth } from '../context/AuthContext.jsx';

export default function FiscalProfileLoader() {
  const { profileChecked } = useAuth();
  if (profileChecked) return null;
  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border border-gray-100 shadow-lg rounded-2xl px-6 py-5 flex items-center gap-4">
        <span
          className="inline-block h-5 w-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin"
          aria-hidden="true"
        />
        <p className="text-gray-800 font-medium">Verificando tu perfil fiscal...</p>
      </div>
    </div>
  );
}

