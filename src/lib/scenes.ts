import { Vector3 } from "three";
import { projects } from "@/data/content";
import { riverAt, riverTAtZ, terrainHeight, WORLD } from "./geography";

/**
 * Where the set pieces of chapters 4 and 5 stand, shared by the 3D world,
 * the camera and the page.
 */

/* ─── Chapter 4 · The ancient tree ───────────────────────────────────────── */

/** The giant banyan the camera circles (cameraPath's Skills shots look at it). */
export const GIANT_TREE = { x: -150, z: -10, height: 58, glade: 46 } as const;

/** True inside the glade around the giant tree, where no other tree grows. */
export function inGlade(x: number, z: number, radius: number = GIANT_TREE.glade) {
  return Math.hypot(x - GIANT_TREE.x, z - GIANT_TREE.z) < radius;
}

/* ─── Chapter 5 · The river ──────────────────────────────────────────────── */

export type ProjectFrame = {
  slug: string;
  /** Where the canvas stands (its foot), on a rock by the water */
  position: Vector3;
  /** Rotation about y, so it faces the camera coming upstream */
  rotationY: number;
  /** Where its ripples start, in the water in front of it */
  ripple: Vector3;
};

/**
 * One framed canvas per project, on the right bank, spaced up the stretch
 * of river the camera skims in the Projects chapter.
 */
export const PROJECT_FRAMES: ProjectFrame[] = projects.map((project, i) => {
  const n = projects.length;
  const z = -62 - (i + 0.5) * (110 / n);
  const centre = riverAt(riverTAtZ(z));
  // All on the right bank, so the project cards (left of the screen) never hide them
  const side = 1;
  const x = centre.x + side * (WORLD.riverHalfWidth + 9);
  const position = new Vector3(x, terrainHeight(x, z), z);
  // Face downstream (towards +z, where the camera comes from), turned a little towards the river
  const facing = new Vector3(centre.x - x, 0, 0).multiplyScalar(0.035).add(new Vector3(0, 0, 1)).normalize();
  const ripple = new Vector3(centre.x + side * WORLD.riverHalfWidth * 0.55, centre.y, z + 4);
  return { slug: project.slug, position, rotationY: Math.atan2(facing.x, facing.z), ripple };
});

/** Rocks in the river: around the canvases and scattered upstream. Foam gathers around them. */
export const RIVER_ROCKS: Vector3[] = [
  ...PROJECT_FRAMES.flatMap((f) => [f.ripple.clone().setY(0), f.ripple.clone().add(new Vector3(3, 0, -7)).setY(0)]),
  ...[-48, -95, -150, -182].map((z, i) => {
    const c = riverAt(riverTAtZ(z));
    return new Vector3(c.x + (i % 2 ? 1 : -1) * WORLD.riverHalfWidth * 0.5, 0, z);
  }),
].map((p) => p.setY(riverAt(riverTAtZ(p.z)).y));

/* ─── Hovering a project card ────────────────────────────────────────────── */

/**
 * The project currently hovered on the page. The page writes it; the 3D
 * world reads it each frame (to tilt that canvas and ripple the water).
 */
export const projectHover = { slug: null as string | null, changedAt: 0 };

export function setProjectHover(slug: string | null) {
  if (projectHover.slug === slug) return;
  projectHover.slug = slug;
  projectHover.changedAt = performance.now();
}
