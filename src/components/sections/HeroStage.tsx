/**
 * Stage that hosts the 3D hand. Until the WebGL scene is mounted (Stage 4)
 * this renders the static, lightweight backdrop that also serves as the
 * fallback for reduced motion and devices without WebGL.
 */
export function HeroStage() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <div className="relative aspect-square h-full max-h-[42rem] w-auto max-w-full">
        <svg viewBox="0 0 600 600" className="absolute inset-0 size-full" fill="none">
          <defs>
            <radialGradient id="stage-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff5f1f" stopOpacity="0.16" />
              <stop offset="60%" stopColor="#ff5f1f" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#ff5f1f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="300" cy="300" r="290" fill="url(#stage-glow)" />
          {[280, 210, 140].map((r) => (
            <circle key={r} cx="300" cy="300" r={r} stroke="#26262a" strokeWidth="1" />
          ))}
          {/* Crosshair ticks */}
          <path d="M300 0v28M300 572v28M0 300h28M572 300h28" stroke="#3a3a40" strokeWidth="1" />
          <path d="M292 300h16M300 292v16" stroke="#ff5f1f" strokeWidth="1" />
        </svg>
        <svg
          viewBox="0 0 600 600"
          className="animate-slow-spin absolute inset-0 size-full motion-reduce:animate-none"
          fill="none"
        >
          <circle
            cx="300"
            cy="300"
            r="245"
            stroke="#3a3a40"
            strokeWidth="1"
            strokeDasharray="2 10"
          />
          <circle cx="300" cy="55" r="3" fill="#ff5f1f" />
        </svg>
        <p className="label-mono absolute left-[6%] top-[8%] text-subtle">Fig. 01 — The Snap</p>
        <p className="label-mono absolute bottom-[8%] right-[6%] text-line-strong">
          X 0.00 / Y 0.00 / Z 0.00
        </p>
      </div>
    </div>
  );
}
