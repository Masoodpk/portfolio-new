import { CatmullRomCurve3, Vector3 } from "three";
import type { ChapterId } from "@/data/content";
import { riverAt, riverTAtZ, terrainHeight } from "./geography";

/**
 * THE CAMERA PATH
 *
 * The whole site is one drone shot. Each `Shot` below is a place the camera
 * passes through (`position`) and where it looks while there (`target`).
 * Two smooth Catmull-Rom curves run through all the positions and all the
 * targets; scroll progress picks a point on them (see CameraRig).
 *
 * Timing: every shot is pinned to a moment of its chapter's section on the
 * page (`at`: 0 = the section's top reaches the top of the screen, 1 = its
 * bottom reaches the bottom). Between two shots the camera eases out of one
 * and into the next, so it lingers a little at each.
 *
 * To adjust the film:
 * - move a shot: change its position / target (world units ≈ metres;
 *   north is −z, up is +y; the river and terrain helpers keep shots on the map)
 * - change when it happens: change `at`, or the section's height in
 *   src/app/page.tsx (taller section = slower camera)
 * - add a shot: add an entry; order matters (it is the order of the flight)
 */

export type Shot = {
  chapter: ChapterId;
  /** When in the chapter's section the camera is exactly here (0…1) */
  at: number;
  position: Vector3;
  target: Vector3;
  /** Lens (vertical field of view, degrees) */
  fov: number;
};

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** A point on the river, `lift` metres above the water. */
const overRiver = (z: number, lift: number, sideways = 0) => {
  const p = riverAt(riverTAtZ(z));
  return v(p.x + sideways, p.y + lift, p.z);
};

/** A point `lift` metres above the ground at (x, z). */
const overGround = (x: number, z: number, lift: number) => v(x, terrainHeight(x, z) + lift, z);

/**
 * The giant 3D name (Name3D) stands here, above the canopy in front of the
 * main peak, facing south towards the opening shot.
 */
export const NAME = {
  position: v(0, 96, 300),
  rotationY: 0,
  /** Cap height of the letters, in world units */
  size: 44,
};

export const SHOTS: Shot[] = [
  // ── 1 · The misty Ghats ─────────────────────────────────────────────────
  // A wide painted view north over the forest to the peaks rising out of the
  // mist, the falls on the plateau cliff. The name faces the camera squarely,
  // so at first it reads like flat type laid over the painting.
  { chapter: "home", at: 0, position: v(0, 100, 600), target: v(0, 175, 0), fov: 40 },
  // The push: forward and up towards the name, looking down on it.
  { chapter: "home", at: 1, position: v(40, 150, 430), target: v(0, 100, 270), fov: 44 },

  // ── 2 · The flight ──────────────────────────────────────────────────────
  // The camera flies on over the top of the name (it slides out of the
  // bottom of the frame) and goes on down towards the river, then
  // into the gorge between forested walls.
  { chapter: "flight", at: 0.3, position: v(8, 165, 288), target: overRiver(170, 40), fov: 50 },
  { chapter: "flight", at: 0.85, position: overRiver(215, 30, 0), target: overRiver(130, 24), fov: 52 },

  // ── 3 · Through the canopy (About) ──────────────────────────────────────
  // On along the river to the mouth of the gorge, then curving left around
  // the end of the left wall (never over it), down along the left bank and
  // in under the trees west of the river.
  { chapter: "about", at: 0.05, position: overRiver(130, 24, -4), target: overRiver(80, 14, -10), fov: 52 },
  { chapter: "about", at: 0.3, position: v(-42, 26, 90), target: overGround(-112, 76, 10), fov: 54 },
  { chapter: "about", at: 0.6, position: overGround(-118, 88, 9), target: overGround(-150, 52, 14), fov: 56 },

  // ── 4 · The ancient tree (Skills) ───────────────────────────────────────
  // Spiralling up around the giant tree (it is planted in Stage 3).
  { chapter: "skills", at: 0.2, position: overGround(-170, 30, 12), target: overGround(-150, -10, 22), fov: 54 },
  { chapter: "skills", at: 0.55, position: overGround(-118, -22, 26), target: overGround(-150, -10, 30), fov: 54 },
  { chapter: "skills", at: 0.9, position: overGround(-160, -52, 42), target: overGround(-150, -10, 34), fov: 52 },

  // ── 5 · The river (Projects) ────────────────────────────────────────────
  // Low over the water, flying upstream.
  { chapter: "projects", at: 0.15, position: overRiver(-40, 6, 4), target: overRiver(-110, 3), fov: 50 },
  { chapter: "projects", at: 0.85, position: overRiver(-170, 5, -4), target: overRiver(-250, 6), fov: 50 },

  // ── 6 · The waterfall (Journey) ─────────────────────────────────────────
  // The whole falls from downstream, then closer, rising up the cliff with them. The milestone ledges are carved into the
  // cliff on the left of the falls (JourneyLedges), the panel sits right.
  { chapter: "experience", at: 0.15, position: overRiver(-215, 12, 22), target: v(-16, 40, -312), fov: 48 },
  { chapter: "experience", at: 0.85, position: v(-12, 62, -262), target: v(-12, 66, -312), fov: 48 },

  // ── 7 · Night in the forest (Contact) ───────────────────────────────────
  // On the forest floor by the river, then the final pull back, rising out of
  // the canopy to a wide view of the whole forest under the moon.
  { chapter: "contact", at: 0.25, position: overGround(-60, -200, 10), target: overGround(-90, -235, 12), fov: 52 },
  { chapter: "contact", at: 1, position: v(0, 280, 900), target: v(0, 190, -300), fov: 42 },
];

export const positionCurve = new CatmullRomCurve3(
  SHOTS.map((s) => s.position),
  false,
  "centripetal",
);
export const targetCurve = new CatmullRomCurve3(
  SHOTS.map((s) => s.target),
  false,
  "centripetal",
);

/** Gentle ease in and out between two shots, so the camera lingers at each. */
export const easeBetweenShots = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

/**
 * Where the camera is at `progress` (0…1) through a chapter's section, with
 * the same easing as the camera rig (pass `targetCurve` for where it looks). Lets set pieces (skill pods, journey
 * ledges) stand exactly where the camera will be looking at their moment.
 */
export function cameraAt(chapter: ChapterId, progress: number, out = new Vector3(), curve = positionCurve) {
  const indices = SHOTS.map((s, i) => (s.chapter === chapter ? i : -1)).filter((i) => i >= 0);
  if (indices.length === 1) return out.copy(curve === positionCurve ? SHOTS[indices[0]].position : SHOTS[indices[0]].target);
  const ats = indices.map((i) => SHOTS[i].at);
  let k = 0;
  while (k < indices.length - 2 && progress > ats[k + 1]) k++;
  const local = Math.min(1, Math.max(0, (progress - ats[k]) / (ats[k + 1] - ats[k])));
  return curve.getPoint((indices[k] + easeBetweenShots(local)) / (SHOTS.length - 1), out);
}
