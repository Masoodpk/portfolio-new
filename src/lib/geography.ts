import { CatmullRomCurve3, Vector3 } from "three";

/**
 * The shape of the world, shared by the terrain, river, trees and camera.
 *
 * Units are roughly metres. North is −z. The river rises on a plateau in the
 * north, drops over a tall cliff as the waterfall (z ≈ −312) and winds south
 * through lowland rainforest to where the camera starts (z ≈ +560). Beyond
 * the plateau, forest-covered peaks of the Western Ghats rise out of the
 * mist; ridges close the world to the east and west.
 */

export const WORLD = {
  /** Terrain plane size and centre */
  size: 2300,
  centerZ: -260,
  /** Height of the plateau above the waterfall */
  plateau: 95,
  /** z of the cliff edge the waterfall drops over */
  cliffZ: -312,
  /** River half-width in the lowlands */
  riverHalfWidth: 16,
} as const;

/* ─── Noise (deterministic, so every device builds the same world) ───────── */

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Fractal noise in 0…1 */
export function fbm(x: number, y: number, octaves = 4) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* ─── The river ──────────────────────────────────────────────────────────── */

/** The river's course from its source (north, on the plateau) to the south. */
export const river = new CatmullRomCurve3(
  [
    [10, -560],
    [30, -460],
    [-5, -380],
    [-12, -312], // the cliff: the waterfall
    [-40, -240],
    [0, -160],
    [58, -60],
    [40, 40],
    [-30, 130],
    [-50, 230],
    [20, 320],
    [70, 420],
    [30, 520],
    [-10, 660],
  ].map(([x, z]) => new Vector3(x, 0, z)),
  false,
  "centripetal",
);

/** Dense polyline of the river for distance lookups. The river runs from
 *  north to south, so the samples are already ordered by z. */
const RIVER_SAMPLES = river.getSpacedPoints(600).map((p) => [p.x, p.z] as const);

function segmentDistanceSq(i: number, x: number, z: number) {
  const [ax, az] = RIVER_SAMPLES[i];
  const [bx, bz] = RIVER_SAMPLES[i + 1];
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
  const px = ax + dx * t - x;
  const pz = az + dz * t - z;
  return px * px + pz * pz;
}

/** Horizontal distance from (x, z) to the river's centre line. */
export function riverDistance(x: number, z: number) {
  // Start at the sample nearest in z, then walk outwards until no closer
  // segment is possible (|Δz| alone already exceeds the best distance).
  let lo = 0;
  let hi = RIVER_SAMPLES.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (RIVER_SAMPLES[mid][1] < z) lo = mid;
    else hi = mid;
  }
  let best = Infinity;
  for (let i = Math.min(lo, RIVER_SAMPLES.length - 2); i >= 0; i--) {
    const dz = z - RIVER_SAMPLES[i + 1][1];
    if (dz * dz > best) break;
    best = Math.min(best, segmentDistanceSq(i, x, z));
  }
  for (let i = lo + 1; i < RIVER_SAMPLES.length - 1; i++) {
    const dz = RIVER_SAMPLES[i][1] - z;
    if (dz * dz > best) break;
    best = Math.min(best, segmentDistanceSq(i, x, z));
  }
  return Math.sqrt(best);
}

/** A point on the river at fraction t (0 = source, 1 = south end), at water level. */
export function riverAt(t: number) {
  const p = river.getPointAt(t);
  p.y = waterLevel(p.z);
  return p;
}

/** Fraction along the river nearest to a given z (the river runs mostly along z). */
export function riverTAtZ(z: number) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const d = Math.abs(river.getPointAt(t).z - z);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}

/** Water surface height: on the plateau above the falls, near zero below. */
export function waterLevel(z: number) {
  return plateauLift(z) - 1.6;
}

/**
 * Where the escarpment edge runs at a given x: it wanders in and out like a
 * real cliff line, but crosses the river exactly at WORLD.cliffZ (x ≈ −12),
 * where the waterfall is.
 */
function edgeZ(x: number) {
  const wander = (fbm(x * 0.006 + 40, 3.3, 3) - fbm(-12 * 0.006 + 40, 3.3, 3)) * 160;
  return WORLD.cliffZ + wander + Math.max(0, Math.abs(x + 12) - 120) * 0.12;
}

/** 0 below the cliff, 1 on the plateau; the cliff face is steep. */
function plateauShape(z: number, x = -12) {
  const edge = edgeZ(x);
  return smoothstep(edge + 6, edge - 12, z);
}

function plateauLift(z: number, x = -12) {
  return plateauShape(z, x) * WORLD.plateau;
}

/* ─── The Ghats ──────────────────────────────────────────────────────────── */

/**
 * Ridged noise (0…1): sharp crests and V-shaped valleys, like eroded
 * mountains, instead of round blobs.
 */
function ridged(x: number, z: number, octaves = 5) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let weight = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    let n = 1 - Math.abs(fbm(x * freq, z * freq, 1) * 2 - 1);
    n *= n * weight;
    weight = Math.min(1, n * 1.6);
    sum += n * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return sum / norm;
}

/** The main massif behind the falls, used for framing and mist. */
export const MASSIF = { x: 30, z: -900, rx: 420, rz: 320, height: 300 } as const;

/**
 * The Western Ghats north of the plateau: long ridgelines that rise
 * northwards out of the plateau, carved by ridged noise into crests and
 * valleys, with a main massif behind the falls. Returns metres above the
 * plateau.
 */
function ghats(x: number, z: number) {
  const north = smoothstep(-360, -820, z);
  // Broad ridgelines (low frequency), with finer ridges only on their flanks
  const r = ridged(x * 0.0024 + 3.1, z * 0.0024 + 7.7, 4);
  const detail = ridged(x * 0.009 + 1.3, z * 0.009 + 4.1, 3);
  const dx = (x - MASSIF.x) / MASSIF.rx;
  const dz = (z - MASSIF.z) / MASSIF.rz;
  const massif = Math.exp(-(dx * dx + dz * dz)) * MASSIF.height * (0.6 + 0.4 * r);
  // Erosion: V-shaped gullies carved down the flanks, deeper the higher the ridge
  const gully = Math.pow(1 - Math.abs(fbm(x * 0.007 + 21, z * 0.007 + 4, 3) * 2 - 1), 5);
  return north * (50 + r * 300 + detail * 45 - gully * r * 70) + massif * (1 - gully * 0.12);
}

/** Where the gorge runs (along the river, between these z values). */
export const GORGE = { from: 290, to: 105, wall: 85 } as const;

/**
 * A narrow gorge the camera follows the river into: two steep walls rising
 * either side of the river, fading out at both ends.
 */
function gorge(x: number, z: number, riverD: number) {
  const along = smoothstep(GORGE.from + 20, GORGE.from - 25, z) * smoothstep(GORGE.to - 25, GORGE.to + 20, z);
  if (along === 0) return 0;
  const wall = smoothstep(24, 46, riverD) * (1 - smoothstep(110, 190, riverD));
  return along * wall * GORGE.wall * (0.75 + fbm(x * 0.02 + 9, z * 0.02 + 2, 3) * 0.5);
}

/* ─── The terrain ────────────────────────────────────────────────────────── */

/**
 * Ground height at (x, z). Gentle forest hills, a carved river channel,
 * the plateau and its cliff, and high ridges around the edges.
 */
export function terrainHeight(x: number, z: number, riverD = riverDistance(x, z)) {
  // Rolling lowland hills
  let h = (fbm(x * 0.0045 + 7, z * 0.0045 - 3) - 0.45) * 26 + (fbm(x * 0.02, z * 0.02) - 0.5) * 4;

  // The plateau and its escarpment
  h += plateauLift(z, x);

  // The Ghats rising north of the plateau, and ridges along the east and west edges
  const sides = smoothstep(380, 760, Math.abs(x)) * (90 + ridged(x * 0.004 + 17, z * 0.004 + 5) * 260);
  h += Math.max(ghats(x, z), sides);

  // The gorge: forested walls close in on the river for a stretch downstream
  h += gorge(x, z, riverD);

  // The river channel: banks slope down to a bed below the water line
  const half = WORLD.riverHalfWidth * (1 - plateauShape(z) * 0.25);
  const bed = waterLevel(z) - 3.2;
  const bank = smoothstep(half * 0.55, half * 2.4, riverD);
  h = bed + (h - bed) * bank;

  return h;
}

/* ─── Trees ──────────────────────────────────────────────────────────────── */

/** A tree: where it stands, how tall, crown radius, colour pick (0…1) and turn. */
export type TreeSpot = { x: number; z: number; ground: number; height: number; crown: number; hue: number; rot: number };

/** Rough slope (rise over run) at (x, z). */
function slope(x: number, z: number, h: number) {
  const e = 4;
  return Math.max(Math.abs(terrainHeight(x + e, z) - h), Math.abs(terrainHeight(x, z + e) - h)) / e;
}

/**
 * Scatter trees on a jittered grid: dense over the lowlands the camera flies
 * through (`near`), sparser up the slopes of the peaks (`near: false`, drawn
 * with simpler crowns). Not in the river, not on cliffs, thinning near summits.
 */
export function scatterTrees(maxNear: number, maxFar: number) {
  const near: TreeSpot[] = [];
  const far: TreeSpot[] = [];
  const half = WORLD.size / 2 - 40;
  const lowland = (x: number, z: number) => Math.abs(x) < 460 && z > -450;
  for (const [spacing, list, inside] of [
    [11, near, true],
    [20, far, false],
  ] as const) {
    for (let gz = -half; gz < half; gz += spacing) {
      for (let gx = -half; gx < half; gx += spacing) {
        const x = gx + (hash(gx, gz) - 0.5) * spacing * 0.9;
        const z = WORLD.centerZ + gz + (hash(gz, gx) - 0.5) * spacing * 0.9;
        if (lowland(x, z) !== inside) continue;
        const d = riverDistance(x, z);
        if (d < WORLD.riverHalfWidth * 1.7) continue;
        if (Math.abs(z - WORLD.cliffZ) < 14) continue;
        const ground = terrainHeight(x, z, d);
        if (slope(x, z, ground) > 1.25) continue; // bare cliffs
        const altitude = ground - (z < WORLD.cliffZ ? WORLD.plateau : 0);
        if (altitude > 430 || hash(x * 3, z * 3) < smoothstep(220, 430, altitude)) continue;
        const n = hash(x, z);
        list.push({
          x,
          z,
          ground,
          height: inside ? 14 + n * 12 : 4 + n * 4,
          crown: (5.5 + hash(z, x) * 4.5) * (inside ? 1 : 2.1),
          hue: hash(x + 9, z - 4),
          rot: n * Math.PI * 2,
        });
      }
    }
  }
  const thin = (list: TreeSpot[], max: number) =>
    list.length <= max ? list : Array.from({ length: max }, (_, i) => list[Math.floor((i * list.length) / max)]);
  return { near: thin(near, maxNear), far: thin(far, maxFar) };
}
