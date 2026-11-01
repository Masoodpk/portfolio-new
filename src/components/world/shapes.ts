/**
 * Target shapes for the particle world. Every generator returns exactly
 * `count` xyz positions so the shader can blend between any two of them.
 * All shapes fit roughly inside a radius of 1.
 */

export type Shape = Float32Array;

/** Deterministic PRNG so shapes are identical on every load (no hydration surprises). */
export function random(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gaussian = (rand: () => number) => {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
};

/** 0 — Hero: a soft, slightly irregular planet "seed". */
export function seedSphere(count: number): Shape {
  const out = new Float32Array(count * 3);
  const rand = random(11);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    // Most points on the surface, some drifting inside for depth.
    const shell = rand() < 0.82 ? 1 : 0.55 + rand() * 0.4;
    const wobble = 1 + 0.04 * Math.sin(theta * 3 + y * 5);
    out[i * 3] = Math.cos(theta) * r * shell * wobble;
    out[i * 3 + 1] = y * shell * wobble;
    out[i * 3 + 2] = Math.sin(theta) * r * shell * wobble;
  }
  return out;
}

/**
 * 0 — Hero: the portrait as particles (see scripts/build-portrait-points.mjs).
 * `data` holds one theme's pool of (x, y, shade) triples; returns positions
 * plus a per-point shade (0…1) that the shader turns into dot size.
 */
export function portrait(count: number, data: Int16Array): { positions: Shape; shade: Float32Array } {
  const positions = new Float32Array(count * 3);
  const shade = new Float32Array(count);
  const available = data.length / 3;
  const rand = random(5);
  for (let i = 0; i < count; i++) {
    const k = i % available; // pools are pre-shuffled, so the first N are a fair sample
    positions[i * 3] = data[k * 3] / 10000;
    positions[i * 3 + 1] = data[k * 3 + 1] / 10000;
    positions[i * 3 + 2] = (rand() - 0.5) * 0.06;
    shade[i] = data[k * 3 + 2] / 10000;
  }
  return { positions, shade };
}

/** Splits portrait-points.bin into its light-theme and dark-theme pools. */
export function portraitPools(file: Int16Array) {
  const count = file[0];
  return { paper: file.subarray(1, 1 + count * 3), dark: file.subarray(1 + count * 3, 1 + count * 6) };
}

/** 1 — About: the initials, sampled from rendered type. */
export function typeShape(count: number, text: string, font: string): Shape {
  const out = new Float32Array(count * 3);
  const rand = random(23);
  const w = 900;
  const h = 360;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return seedSphere(count);
  ctx.fillStyle = "#000";
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 10);
  const data = ctx.getImageData(0, 0, w, h).data;

  // Edge pixels define the letterforms; fill pixels give them body.
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] > 128;
  const edges: number[] = [];
  const fill: number[] = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (!inside(x, y)) continue;
      const isEdge = !inside(x - 3, y) || !inside(x + 3, y) || !inside(x, y - 3) || !inside(x, y + 3);
      (isEdge ? edges : fill).push(x, y);
    }
  }
  if (edges.length === 0) return seedSphere(count);

  for (let i = 0; i < count; i++) {
    const source = fill.length > 0 && rand() > 0.68 ? fill : edges;
    const p = Math.floor(rand() * (source.length / 2)) * 2;
    out[i * 3] = ((source[p] + rand() * 1.5) / w - 0.5) * 2.4;
    out[i * 3 + 1] = -((source[p + 1] + rand() * 1.5) / h - 0.5) * 0.96;
    out[i * 3 + 2] = (rand() - 0.5) * 0.05;
  }
  return out;
}

/** 2 — Experience: a road running across the screen, winding gently into depth. */
export function journeyRoad(count: number): Shape {
  const out = new Float32Array(count * 3);
  const rand = random(37);
  for (let i = 0; i < count; i++) {
    const t = rand();
    const kind = rand();
    // Dense kerbs, a sparse surface and a dashed centre line.
    let across: number;
    if (kind < 0.62) across = (rand() < 0.5 ? -1 : 1) * (0.085 + gaussian(rand) * 0.005);
    else if (kind < 0.9 || Math.floor(t * 46) % 2 === 1) across = (rand() - 0.5) * 0.17;
    else across = gaussian(rand) * 0.004;
    out[i * 3] = (t - 0.5) * 2.4;
    out[i * 3 + 1] = Math.sin(t * Math.PI * 3) * 0.05 + gaussian(rand) * 0.004;
    out[i * 3 + 2] = Math.cos(t * Math.PI * 3) * 0.22 + across;
  }
  return out;
}

/** 3 — Skills: five clusters (one per skill category) orbiting a centre. */
export function clusters(count: number, groups = 5): Shape {
  const out = new Float32Array(count * 3);
  const rand = random(53);
  for (let i = 0; i < count; i++) {
    const g = i % groups;
    const angle = (g / groups) * Math.PI * 2 - Math.PI / 2;
    const cx = Math.cos(angle) * 0.72;
    const cy = Math.sin(angle) * 0.72;
    const spread = 0.13 + (g % 2) * 0.03;
    out[i * 3] = cx + gaussian(rand) * spread;
    out[i * 3 + 1] = cy + gaussian(rand) * spread;
    out[i * 3 + 2] = gaussian(rand) * spread;
  }
  return out;
}

/** 4 — Projects: a gently waving field, like a surface being built on. */
export function waveField(count: number): Shape {
  const out = new Float32Array(count * 3);
  const side = Math.ceil(Math.sqrt(count));
  for (let i = 0; i < count; i++) {
    const gx = (i % side) / (side - 1) - 0.5;
    const gz = Math.floor(i / side) / (side - 1) - 0.5;
    const x = gx * 2.6;
    const z = gz * 2.6;
    out[i * 3] = x;
    out[i * 3 + 1] = Math.sin(x * 2.4) * 0.12 + Math.cos(z * 3.1) * 0.1 - 0.35;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** Converts latitude/longitude (degrees) to a point on a sphere of radius r. */
export function latLonToVec(lat: number, lon: number, r = 1): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}

/** 5 — Contact: the Earth's land masses as dots. Input is [lat*100, lon*100] pairs. */
export function globe(count: number, land: Int16Array): Shape {
  const out = new Float32Array(count * 3);
  const available = land.length / 2;
  const rand = random(71);
  for (let i = 0; i < count; i++) {
    // Spread the available points evenly across the requested count.
    const k = Math.floor((i / count) * available);
    const [x, y, z] = latLonToVec(land[k * 2] / 100, land[k * 2 + 1] / 100, 1 + (rand() - 0.5) * 0.006);
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}
