export default function Hero() {
  return (
    <section id="features" className="bg-gradient-to-b from-blue-50 to-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-12 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Simplifica tu gestión fiscal
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                La forma más fácil de llevar tus ingresos y gastos al día
              </p>
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl" aria-label="Empezar gratis">
                Empieza gratis
              </button>
            </div>

            <div className="relative" aria-hidden="true">
              <div className="relative z-10">
                <svg viewBox="0 0 400 400" className="w-full h-auto" role="img" aria-label="Ilustración decorativa">
                  <rect x="50" y="280" width="300" height="80" rx="10" fill="#cbd5e1" opacity="0.3"/>

                  <circle cx="200" cy="180" r="80" fill="#34d399"/>
                  <ellipse cx="200" cy="260" rx="50" ry="15" fill="#34d399" opacity="0.5"/>

                  <circle cx="185" cy="165" r="8" fill="#1f2937"/>
                  <circle cx="215" cy="165" r="8" fill="#1f2937"/>
                  <path d="M 180 195 Q 200 205 220 195" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round"/>

                  <rect x="140" y="200" width="40" height="50" rx="5" fill="#34d399"/>
                  <rect x="220" y="200" width="40" height="50" rx="5" fill="#34d399"/>

                  <g transform="translate(270, 160)">
                    <rect width="90" height="70" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
                    <rect x="10" y="10" width="70" height="8" rx="2" fill="#3b82f6"/>
                    <rect x="10" y="25" width="50" height="6" rx="2" fill="#10b981"/>
                    <rect x="10" y="36" width="60" height="6" rx="2" fill="#f59e0b"/>
                    <circle cx="75" cy="50" r="8" fill="#10b981" stroke="white" strokeWidth="2"/>
                    <path d="M 72 50 L 74 52 L 78 48" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>

                  <g transform="translate(50, 80)">
                    <circle cx="0" cy="0" r="25" fill="#fbbf24"/>
                    <text x="0" y="8" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">$</text>
                  </g>

                  <g transform="translate(320, 80)">
                    <circle cx="0" cy="0" r="20" fill="#fbbf24" opacity="0.7"/>
                    <text x="0" y="7" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">$</text>
                  </g>

                  <g transform="translate(40, 240)">
                    <rect width="60" height="50" rx="4" fill="#3b82f6" opacity="0.8"/>
                    <rect x="5" y="5" width="50" height="5" rx="2" fill="white"/>
                    <rect x="15" y="15" width="30" height="3" rx="1" fill="white" opacity="0.7"/>
                    <rect x="15" y="22" width="30" height="3" rx="1" fill="white" opacity="0.7"/>
                    <rect x="15" y="29" width="20" height="3" rx="1" fill="white" opacity="0.7"/>
                    <rect x="5" y="38" width="15" height="8" rx="2" fill="#fbbf24"/>
                  </g>

                  <g transform="translate(300, 240)">
                    <circle cx="0" cy="0" r="18" fill="#fbbf24" opacity="0.6"/>
                    <text x="0" y="6" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">$</text>
                  </g>

                  <g transform="translate(310, 100)">
                    <path d="M 0 20 L 10 10 L 20 20" stroke="#10b981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M 10 10 L 10 25" stroke="#10b981" strokeWidth="4" strokeLinecap="round"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

