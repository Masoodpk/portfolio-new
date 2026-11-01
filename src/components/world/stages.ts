/**
 * The journey: one particle world, six stages. Each page section declares its
 * stage with data-world-stage; scrolling blends between neighbouring stages.
 */
export type StageLayout = {
  x: number;
  y: number;
  scale: number;
  tiltX: number;
  spinSpeed: number;
  /** Multiplies the base particle opacity, so text-heavy stages can quieten the dots */
  opacity: number;
  /** Fixed y-rotation (radians) to turn towards instead of spinning */
  face?: number;
  /** Overrides for portrait / phone screens */
  mobile?: Partial<Omit<StageLayout, "mobile" | "face">>;
};

/** Globe rotation that faces the Arabian Sea, between Kerala and the Gulf */
const GULF = -((62 + 90) * Math.PI) / 180;

export const STAGES: StageLayout[] = [
  // 0 Hero — the portrait in particles, right of the name (above it on phones)
  { x: 1.06, y: -0.16, scale: 1.05, tiltX: 0, spinSpeed: 0, opacity: 1, face: 0, mobile: { x: 0, y: 0.6, scale: 0.46, opacity: 0.9 } },
  // 1 About — initials above the portrait, beside the text
  { x: 0.98, y: 0.28, scale: 0.66, tiltX: 0, spinSpeed: 0, opacity: 1, face: 0, mobile: { x: 0, y: 0.62, scale: 0.44, opacity: 0.5 } },
  // 2 Experience — a road along the bottom of the screen, under the stops
  { x: 0, y: -1.0, scale: 1.55, tiltX: 0.32, spinSpeed: 0, opacity: 0.75, face: 0, mobile: { x: 0, y: -1.02, scale: 0.5, opacity: 0.6 } },
  // 3 Skills — five clusters
  { x: 1.0, y: 0, scale: 0.72, tiltX: 0.2, spinSpeed: 0.1, opacity: 1, mobile: { x: 0, y: 0.55, scale: 0.42, opacity: 0.5 } },
  // 4 Projects — a field under construction
  { x: 0, y: -0.8, scale: 0.9, tiltX: 0.42, spinSpeed: 0.05, opacity: 0.7, mobile: { x: 0, y: -0.9, scale: 0.6, opacity: 0.5 } },
  // 5 Contact — the globe, Kerala to the Gulf
  { x: 0.78, y: -0.02, scale: 0.82, tiltX: 0.35, spinSpeed: 0, opacity: 1, face: GULF, mobile: { x: 0.1, y: -0.78, scale: 0.6, opacity: 0.6 } },
];

/** Window event (detail: cluster index or null) that spotlights a skills cluster. */
export const WORLD_FOCUS_EVENT = "world:focus";

export const ORIGIN = { name: "Kozhikode", lat: 11.2588, lon: 75.7804 };

/** Target markets from the brief — places, not claims of work authorisation. */
export const DESTINATIONS = [
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Abu Dhabi", lat: 24.4539, lon: 54.3773 },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753 },
  { name: "Jeddah", lat: 21.4858, lon: 39.1925 },
  { name: "Doha", lat: 25.2854, lon: 51.531 },
  { name: "Muscat", lat: 23.588, lon: 58.3829 },
  { name: "Manama", lat: 26.2285, lon: 50.586 },
];
