"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { ChapterId } from "@/data/content";
import { SHOTS } from "./cameraPath";

/**
 * Scroll ↔ journey bookkeeping shared by the camera, the nav and the
 * progress rail: where on the page each shot happens, smooth scrolling, and
 * reduced motion.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // Mobile address bars resize the viewport while scrolling; don't refresh for that.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText };

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Scroller = {
  scrollTo: (target: number | HTMLElement, options?: { duration?: number; immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
};

/** The page's Lenis instance while smooth scrolling is on (set by SmoothScroll). */
export let smoothScroller: Scroller | null = null;
export const setSmoothScroller = (scroller: Scroller | null) => {
  smoothScroller = scroller;
};

const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

/** Scroll position (px) at which a chapter's section is at `at` (0…1, see Shot). */
export function chapterScroll(id: ChapterId, at = 0.5) {
  const section = document.querySelector<HTMLElement>(`[data-chapter="${id}"]`);
  if (!section) return 0;
  const top = section.getBoundingClientRect().top + window.scrollY;
  return top + at * Math.max(0, section.offsetHeight - window.innerHeight);
}

/** Every shot's moment as a fraction of the whole page (0…1), in path order. */
export function measureShotMoments() {
  const max = maxScroll();
  return SHOTS.map((shot) => Math.min(1, Math.max(0, chapterScroll(shot.chapter, shot.at) / max)));
}

/**
 * Progress through one chapter's section, 0 when its top reaches the top of
 * the screen and 1 when its bottom reaches the bottom (can run outside 0…1).
 */
export function chapterProgress(id: ChapterId) {
  const start = chapterScroll(id, 0);
  const end = chapterScroll(id, 1);
  return (window.scrollY - start) / Math.max(1, end - start);
}

/** Overall journey progress, 0 at the top of the page and 1 at the bottom. */
export const scrollProgress = () => Math.min(1, Math.max(0, window.scrollY / maxScroll()));

/** Fly the camera to a chapter: glide the scroll to the moment of its first shot. */
export function flyTo(id: ChapterId) {
  const shot = SHOTS.find((s) => s.chapter === id);
  const y = chapterScroll(id, shot?.at ?? 0);
  if (smoothScroller) smoothScroller.scrollTo(y, { duration: 2.4 });
  else window.scrollTo({ top: y, behavior: reducedMotion() ? "auto" : "smooth" });
}
