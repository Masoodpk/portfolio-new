import { positionCurve } from "./cameraPath";
import { riverDistance, terrainHeight, WORLD } from "./geography";
import { inGlade } from "./scenes";

/**
 * Keeping the camera out of the trees, and planting the understory around
 * where it flies low. (Lianas hang from the trees themselves; see Canopy.)
 *
 * The camera's whole flight path is sampled once. Anything whose volume
 * reaches the path (within a margin) is not planted, so wherever the camera
 * goes there is a natural clearing or gap in the canopy around it. The
 * camera damps slightly behind the path, so the margins are generous.
 */

type PathPoint = { x: number; y: number; z: number; ground: number };

const PATH: PathPoint[] = positionCurve.getSpacedPoints(1400).map((p) => ({ x: p.x, y: p.y, z: p.z, ground: terrainHeight(p.x, p.z) }));

/**
 * True if anything reaching up to `top` (world y) at (x, z) within `radius`
 * would touch the camera's path, or come within `headroom` metres below it.
 */
export function blocksPath(x: number, z: number, radius: number, top: number, headroom = 2) {
  const r2 = radius * radius;
  for (const p of PATH) {
    if (p.y > top + headroom) continue;
    const dx = p.x - x;
    const dz = p.z - z;
    if (dx * dx + dz * dz < r2) return true;
  }
  return false;
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export type Plant = { x: number; z: number; ground: number; size: number; rot: number; hue: number };

export type Understory = {
  ferns: Plant[];
  broadleaves: Plant[];
  rocks: Plant[];
  logs: Plant[];
  mushrooms: Plant[];
  flowers: Plant[];
};

/**
 * The forest floor around the low stretches of the flight: wherever the
 * camera is within ~40 m of the ground, plants are scattered in a band
 * either side of its path (never in the corridor itself).
 */
export function plantUnderstory(density: number): Understory {
  const out: Understory = { ferns: [], broadleaves: [], rocks: [], logs: [], mushrooms: [], flowers: [] };
  const low = PATH.filter((p, i) => i % 3 === 0 && p.y - p.ground < 42);
  let n = 0;
  for (const p of low) {
    const count = Math.round(18 * density);
    for (let k = 0; k < count; k++) {
      n++;
      const angle = hash(n, 1) * Math.PI * 2;
      const dist = 7 + hash(n, 2) * 55;
      const x = p.x + Math.cos(angle) * dist;
      const z = p.z + Math.sin(angle) * dist;
      if (riverDistance(x, z) < WORLD.riverHalfWidth * 1.15) continue;
      if (inGlade(x, z, 12)) continue; // the giant tree's own roots
      const ground = terrainHeight(x, z);
      const roll = hash(n, 3);
      const plant: Plant = { x, z, ground, size: hash(n, 4), rot: hash(n, 5) * Math.PI * 2, hue: hash(n, 6) };
      if (roll < 0.38) {
        if (!blocksPath(x, z, 3.5, ground + 2.5)) out.ferns.push(plant);
      } else if (roll < 0.5) {
        if (!blocksPath(x, z, 5, ground + 4)) out.broadleaves.push(plant);
      } else if (roll < 0.58) {
        if (!blocksPath(x, z, 4, ground + 2)) out.rocks.push(plant);
      } else if (roll < 0.61) {
        if (!blocksPath(x, z, 9, ground + 2)) out.logs.push(plant);
      } else if (roll < 0.72) {
        if (!blocksPath(x, z, 2, ground + 1)) out.mushrooms.push(plant);
      } else if (!blocksPath(x, z, 2.5, ground + 1.5)) {
        out.flowers.push(plant);
      }
    }
  }
  return out;
}

/**
 * Places for animals to live: near the low stretches of the flight, where
 * the camera can see them, but never in its corridor.
 */
export function wildlifeSpots(count: number, seed: number, minDist = 8, maxDist = 34) {
  const low = PATH.filter((p) => p.y - p.ground < 36);
  const spots: { x: number; z: number; ground: number; r: number }[] = [];
  for (let i = 0; spots.length < count && i < count * 20 && low.length > 0; i++) {
    const p = low[Math.floor(hash(i, seed) * low.length)];
    const angle = hash(i, seed + 1) * Math.PI * 2;
    const dist = minDist + hash(i, seed + 2) * (maxDist - minDist);
    const x = p.x + Math.cos(angle) * dist;
    const z = p.z + Math.sin(angle) * dist;
    if (riverDistance(x, z) < WORLD.riverHalfWidth * 1.3 || blocksPath(x, z, 3, terrainHeight(x, z) + 2)) continue;
    spots.push({ x, z, ground: terrainHeight(x, z), r: hash(i, seed + 3) });
  }
  return spots;
}
