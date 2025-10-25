export default function EmptyState({ title, message, actions }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <img
        src="/img/empty-dashboard.svg"
        alt="Sin datos"
        className="w-56 mb-6 opacity-90"
      />
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">{title}</h2>
      <p className="text-gray-500 mb-6 max-w-md">{message}</p>
      <div className="flex gap-4 flex-wrap justify-center">{actions}</div>
    </div>
  );
}

