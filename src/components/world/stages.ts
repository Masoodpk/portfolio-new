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
  /** Overrides for portrait / phone screens */
  mobile?: Partial<Omit<StageLayout, "mobile">>;
};

export const STAGES: StageLayout[] = [
  // 0 Hero — a seed planet sitting right of the headline
  { x: 0.82, y: 0.08, scale: 0.68, tiltX: 0.25, spinSpeed: 0.12, opacity: 1, mobile: { x: 0.42, y: 0.62, scale: 0.42 } },
  // 1 About — initials above the portrait, beside the text
  { x: 0.98, y: 0.14, scale: 0.66, tiltX: 0, spinSpeed: 0, opacity: 1, mobile: { x: 0, y: 0.62, scale: 0.44, opacity: 0.5 } },
  // 2 Experience — the road travelled
  { x: 0.9, y: 0, scale: 0.85, tiltX: 0.15, spinSpeed: 0.08, opacity: 1, mobile: { x: 0, y: 0, scale: 0.6 } },
  // 3 Skills — five clusters
  { x: 0.8, y: 0, scale: 0.8, tiltX: 0.2, spinSpeed: 0.1, opacity: 1, mobile: { x: 0, y: 0, scale: 0.55 } },
  // 4 Projects — a field under construction
  { x: 0, y: -0.55, scale: 0.9, tiltX: 0.42, spinSpeed: 0.05, opacity: 1, mobile: { x: 0, y: -0.7, scale: 0.6 } },
  // 5 Contact — the globe, Kerala to the Gulf
  { x: 0.78, y: -0.02, scale: 0.82, tiltX: 0.35, spinSpeed: 0, opacity: 1, mobile: { x: 0.1, y: -0.78, scale: 0.6 } },
];

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
