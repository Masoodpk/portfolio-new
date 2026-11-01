/**
 * Lightweight dotted-sphere illustration used when the WebGL world can't run.
 * Pure SVG, rendered on the server, no JavaScript.
 */
export function StaticGlobe({ className = "" }: { className?: string }) {
  const dots: { x: number; y: number; r: number; o: number }[] = [];
  const count = 520;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const z = Math.sin(theta) * radius;
    if (z < -0.15) continue; // back of the sphere
    dots.push({
      x: 200 + Math.cos(theta) * radius * 180,
      y: 200 + y * 180,
      r: 1.2 + (z + 1) * 0.9,
      o: 0.25 + (z + 1) * 0.35,
    });
  }

  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} className="fill-cobalt" opacity={d.o.toFixed(2)} />
      ))}
    </svg>
  );
}
