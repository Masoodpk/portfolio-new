import { Color, MathUtils, Vector3 } from "three";
import { chapterScroll } from "@/lib/journey";
import { SUN_DIR, world } from "./shaders";

/**
 * TIME OF DAY: the light moves with the scroll, through four moods.
 *
 *   0 · misty morning     (the Ghats, the flight, under the canopy)
 *   1 · golden afternoon  (the ancient tree, the river)
 *   2 · sunset            (the waterfall)
 *   3 · monsoon night     (contact): deep teal sky, a moon behind clouds, rain
 *
 * Each mood is a full palette (sky, sun, ambient light, fog, water, mist).
 * `updateDaylight` blends the two moods either side of the current moment
 * and writes the result into shared objects that the sky, lights, fog and
 * water shaders hold by reference, so nothing needs re-rendering.
 */

type Mood = {
  horizon: string;
  zenith: string;
  /** Glow around the sun (or, at night, nothing: the moon has its own) */
  glow: string;
  clouds: string;
  sun: string;
  sunIntensity: number;
  sunDir: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  fogNear: string;
  fogFar: string;
  fogDensity: number;
  /** What the water reflects, and its glints */
  waterSky: string;
  waterSun: string;
  /** Brightness of shaders that aren't lit by the scene lights (water, falls, mist) */
  light: string;
  mist: string;
};

const MOODS: Mood[] = [
  {
    horizon: "#bfd9de",
    zenith: "#6fa3c8",
    glow: "#f6e3b4",
    clouds: "#f2f4f0",
    sun: "#ffe6bd",
    sunIntensity: 2.2,
    sunDir: [SUN_DIR.x, SUN_DIR.y, SUN_DIR.z],
    hemiSky: "#dce9e4",
    hemiGround: "#6b8a4a",
    hemiIntensity: 1.45,
    fogNear: "#9fbfb0",
    fogFar: "#b5d3da",
    fogDensity: 0.00042,
    waterSky: "#cfe3e4",
    waterSun: "#fff1c4",
    light: "#ffffff",
    mist: "#ffffff",
  },
  {
    horizon: "#e6dcb6",
    zenith: "#6c9cc6",
    glow: "#ffd98f",
    clouds: "#fbeed4",
    sun: "#ffd697",
    sunIntensity: 2.5,
    sunDir: [-0.86, 0.36, -0.08],
    hemiSky: "#ebe0c0",
    hemiGround: "#6f8240",
    hemiIntensity: 1.35,
    fogNear: "#b6b98e",
    fogFar: "#d3d8c2",
    fogDensity: 0.00034,
    waterSky: "#e2dcbc",
    waterSun: "#ffe0a0",
    light: "#fff6e4",
    mist: "#fff4dc",
  },
  {
    horizon: "#f1b588",
    zenith: "#56689a",
    glow: "#ffac66",
    clouds: "#f4bf9c",
    sun: "#ffa765",
    sunIntensity: 2.0,
    sunDir: [-0.82, 0.2, 0.54], // low in the west, raking across the cliff and the falls
    hemiSky: "#d9b4a6",
    hemiGround: "#4f5136",
    hemiIntensity: 1.15,
    fogNear: "#bd9a8a",
    fogFar: "#e2b294",
    fogDensity: 0.0004,
    waterSky: "#e6b99b",
    waterSun: "#ffbf80",
    light: "#f6d6c0",
    mist: "#f7cdb4",
  },
  {
    horizon: "#21434c",
    zenith: "#08182a",
    glow: "#000000",
    clouds: "#2f4b58",
    sun: "#a9c4e2",
    sunIntensity: 0.9,
    sunDir: [0.32, 0.55, -0.77],
    hemiSky: "#5a83a3",
    hemiGround: "#1a2622",
    hemiIntensity: 0.85,
    fogNear: "#1b3536",
    fogFar: "#22414b",
    fogDensity: 0.00052,
    waterSky: "#38606e",
    waterSun: "#d6e6f4",
    light: "#5b7480",
    mist: "#4a6672",
  },
];

/** Where the painted moon hangs: low in the north, over the Ghats, in the final wide shot. */
export const MOON_DIR = new Vector3(0.24, 0.215, -0.95).normalize();

const colour = (key: keyof Mood) => MOODS.map((m) => new Color(m[key] as string));
const PALETTE = {
  horizon: colour("horizon"),
  zenith: colour("zenith"),
  glow: colour("glow"),
  clouds: colour("clouds"),
  sun: colour("sun"),
  hemiSky: colour("hemiSky"),
  hemiGround: colour("hemiGround"),
  waterSky: colour("waterSky"),
  waterSun: colour("waterSun"),
  light: colour("light"),
  mist: colour("mist"),
};
const FOG = { near: colour("fogNear"), far: colour("fogFar") };
const SUN_DIRS = MOODS.map((m) => new Vector3(...m.sunDir).normalize());

/** The current light. Shaders and lights hold these objects by reference. */
export const daylight = {
  /** 0 morning … 3 night (fractional between moods) */
  phase: 0,
  /** 0 by day, 1 at full night: moon, stars, fireflies, glowing fungi */
  night: 0,
  /** 0 dry, 1 full monsoon rain */
  rain: 0,
  horizon: PALETTE.horizon[0].clone(),
  zenith: PALETTE.zenith[0].clone(),
  glow: PALETTE.glow[0].clone(),
  clouds: PALETTE.clouds[0].clone(),
  sun: PALETTE.sun[0].clone(),
  sunIntensity: MOODS[0].sunIntensity,
  sunDir: SUN_DIRS[0].clone(),
  hemiSky: PALETTE.hemiSky[0].clone(),
  hemiGround: PALETTE.hemiGround[0].clone(),
  hemiIntensity: MOODS[0].hemiIntensity,
  waterSky: PALETTE.waterSky[0].clone(),
  waterSun: PALETTE.waterSun[0].clone(),
  light: PALETTE.light[0].clone(),
  mist: PALETTE.mist[0].clone(),
  uNight: { value: 0 },
  uRain: { value: 0 },
};

/**
 * Where on the page each mood is reached, in scroll px. Between two of these
 * the light blends; before the first it is morning, after the last, night.
 */
function moodScrolls() {
  return [chapterScroll("about", 0.6), chapterScroll("projects", 0.3), chapterScroll("experience", 0.65), chapterScroll("contact", 0.22)];
}

/** Phase (0…3) for the current scroll position. */
function phaseAt(scrollY: number) {
  const marks = moodScrolls();
  if (scrollY <= marks[0]) return 0;
  for (let i = 0; i < marks.length - 1; i++) {
    if (scrollY < marks[i + 1]) return i + (scrollY - marks[i]) / Math.max(1, marks[i + 1] - marks[i]);
  }
  return 3;
}

/** Blend the palette for this frame. Eases towards the scroll's phase, so fly-tos don't flash. */
export function updateDaylight(delta: number) {
  const target = phaseAt(window.scrollY);
  daylight.phase += (target - daylight.phase) * (1 - Math.exp(-delta * 3));
  const phase = MathUtils.clamp(daylight.phase, 0, 3);
  const i = Math.min(2, Math.floor(phase));
  // Hold each mood a little before moving on to the next
  const t = MathUtils.smootherstep(phase - i, 0, 1);

  for (const key of Object.keys(PALETTE) as (keyof typeof PALETTE)[]) {
    daylight[key].copy(PALETTE[key][i]).lerp(PALETTE[key][i + 1], t);
  }
  daylight.sunIntensity = MathUtils.lerp(MOODS[i].sunIntensity, MOODS[i + 1].sunIntensity, t);
  daylight.hemiIntensity = MathUtils.lerp(MOODS[i].hemiIntensity, MOODS[i + 1].hemiIntensity, t);
  daylight.sunDir.copy(SUN_DIRS[i]).lerp(SUN_DIRS[i + 1], t).normalize();

  world.uFogNear.value.copy(FOG.near[i]).lerp(FOG.near[i + 1], t);
  world.uFogFar.value.copy(FOG.far[i]).lerp(FOG.far[i + 1], t);
  world.uFogDensity.value = MathUtils.lerp(MOODS[i].fogDensity, MOODS[i + 1].fogDensity, t);

  daylight.night = MathUtils.smoothstep(phase, 2.15, 3);
  daylight.rain = MathUtils.smoothstep(phase, 2.55, 3);
  daylight.uNight.value = daylight.night;
  daylight.uRain.value = daylight.rain;
}
