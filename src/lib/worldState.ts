"use client";

/**
 * How the world behind the page is drawn, and how far it has loaded.
 *
 * - "live": the 3D scene (WebGL available, motion welcome)
 * - "stills": painted stills of each chapter, crossfading as you scroll
 *   (no WebGL, or the visitor prefers reduced motion)
 * - "unknown": on the server and during hydration, before we can tell
 *
 * `?capture` in the URL renders the scene alone, without the page or the
 * loader: `npm run stills` uses it to paint the stills.
 */

export type WorldMode = "unknown" | "live" | "stills";

let webgl: boolean | undefined;

function hasWebGL() {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const motionQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");

export const capturing = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("capture");

export const worldMode = (): WorldMode => (hasWebGL() && (!motionQuery().matches || capturing()) ? "live" : "stills");
export const serverWorldMode = (): WorldMode => "unknown";

export function subscribeWorldMode(onChange: () => void) {
  const query = motionQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/* ─── Loading progress (0…1) of the live scene ───────────────────────────── */

let progress = 0.12;
const listeners = new Set<() => void>();

/** Report a loading milestone; progress only ever moves forward. */
export function reportProgress(value: number) {
  if (value <= progress) return;
  progress = value;
  listeners.forEach((l) => l());
}

export const loadingProgress = () => progress;
export const serverLoadingProgress = () => 0.12;

export function subscribeProgress(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}
