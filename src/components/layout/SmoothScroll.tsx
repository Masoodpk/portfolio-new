"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial smooth scrolling (the "weight" that award-style sites have).
 * Off for reduced motion and touch devices, where native scrolling is better.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: true });
    return () => lenis.destroy();
  }, []);

  return null;
}
