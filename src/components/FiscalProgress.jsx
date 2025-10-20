export default function FiscalProgress({ current }) {
  const step = current === 'A' ? 1 : current === 'B' ? 2 : 3;
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Datos personales</span>
        <span>Régimen fiscal</span>
        <span>Declaraciones</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 bg-green-500 transition-all"
          style={{ width: `${progress}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          role="progressbar"
        />
      </div>
      <p className="text-sm text-gray-600 text-center mt-2">
        Sección {current} de 3 — {progress}% completado
      </p>
    </div>
  );
}

