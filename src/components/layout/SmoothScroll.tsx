"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reducedMotion, setSmoothScroller } from "@/lib/journey";

/**
 * Lenis smooth scrolling (lerp 0.06), driven by GSAP's ticker so the scroll,
 * every ScrollTrigger and the camera all update in the same frame.
 * Native scrolling for reduced motion; touch keeps its native momentum.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;

    // A slow, weighty glide: low lerp, and each wheel notch moves a little less.
    const lenis = new Lenis({ lerp: 0.06, wheelMultiplier: 0.8, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setSmoothScroller(lenis);

    return () => {
      gsap.ticker.remove(raf);
      setSmoothScroller(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
