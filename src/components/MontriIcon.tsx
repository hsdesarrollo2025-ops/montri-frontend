export default function MontriIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* Shadow */}
      <ellipse cx="32" cy="50" rx="14" ry="4" fill="#34d399" opacity="0.25" />

      {/* Body */}
      <circle cx="32" cy="28" r="18" fill="#34d399" />

      {/* Eyes */}
      <circle cx="26.5" cy="24" r="2" fill="#1f2937" />
      <circle cx="37.5" cy="24" r="2" fill="#1f2937" />

      {/* Smile */}
      <path d="M24 31 Q 32 35 40 31" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Feet */}
      <rect x="22" y="36" width="8" height="8" rx="2" fill="#34d399" />
      <rect x="34" y="36" width="8" height="8" rx="2" fill="#34d399" />
    </svg>
  );
}

