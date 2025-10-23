export default function FiscalProgress({ current, progress }) {
  const step = current === 'A' ? 1 : current === 'B' ? 2 : 3;
  const computed = step === 1 ? 33 : step === 2 ? 66 : 100;
  const value = typeof progress === 'number' ? Math.max(0, Math.min(100, progress)) : computed;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Datos personales</span>
        <span>Régimen fiscal</span>
        <span>Declaraciones</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-2 bg-green-500 transition-all" style={{ width: `${value}%` }} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} role="progressbar" />
      </div>
      <p className="text-sm text-gray-600 text-center mt-2">Sección {current} de 3 — {value}% completado</p>
    </div>
  );
}

