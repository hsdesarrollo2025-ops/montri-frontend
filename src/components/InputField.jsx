export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  disabled = false,
}) {
  const id = name;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={
          `w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ` +
          `bg-white ${disabled ? 'opacity-70 cursor-not-allowed' : ''} ` +
          `${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-green-400 focus:border-green-400'}`
        }
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

