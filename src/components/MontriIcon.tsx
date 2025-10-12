export default function MontriIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* Shadow */}
      <ellipse cx="32" cy="52" rx="16" ry="5" fill="#34d399" opacity="0.25" />

      {/* Body (rounded head) */}
      <circle cx="32" cy="27" r="21" fill="#34d399" />

      {/* Curved base to suggest feet/body extension */}
      <rect x="18" y="36" width="28" height="10" rx="8" fill="#34d399" />

      {/* Eyes */}
      <circle cx="26.5" cy="23.5" r="2" fill="#1f2937" />
      <circle cx="37.5" cy="23.5" r="2" fill="#1f2937" />

      {/* Smile */}
      <path d="M24 30 Q 32 35 40 30" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Subtle feet */}
      <rect x="22" y="42" width="8" height="6" rx="3" fill="#34d399" />
      <rect x="34" y="42" width="8" height="6" rx="3" fill="#34d399" />
    </svg>
  );
}
