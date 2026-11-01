/**
 * First-visit loader: the site icon's arc draws from a home dot (Kozhikode)
 * out to a ring while a counter runs to 100, then the sheet lifts away.
 * Pure CSS; only shown when the inline script in layout.tsx sets
 * html[data-loader="on"] (once per session, never for reduced motion).
 */
export function Loader() {
  return (
    <div className="loader" aria-hidden="true">
      <div className="loader-stage">
        <svg viewBox="22 30 112 100" className="w-[min(10rem,36vw)] overflow-visible">
          <defs>
            <linearGradient id="loader-gradient" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="var(--color-cobalt)" />
              <stop offset="1" stopColor="var(--color-violet)" />
            </linearGradient>
          </defs>
          <path
            d="M45 115C45 65 70 42.5 106 48"
            pathLength={1}
            className="loader-arc"
            fill="none"
            stroke="url(#loader-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="45" cy="115" r="16" className="fill-cobalt" />
          <circle cx="117" cy="50" r="13" fill="none" strokeWidth="10" className="loader-ring stroke-violet" />
        </svg>
        <p className="font-display mt-8 text-[clamp(2.5rem,5vw,3.25rem)] leading-none">
          Masood <span className="text-gradient italic">PK</span>
        </p>
        <p className="eyebrow mt-4 flex items-center gap-2 text-muted">
          Kozhikode <span className="text-cobalt">→</span> the world
          <span className="ml-2 inline-flex min-w-[4ch] justify-end text-ink">
            <span className="loader-count" />%
          </span>
        </p>
      </div>
    </div>
  );
}
