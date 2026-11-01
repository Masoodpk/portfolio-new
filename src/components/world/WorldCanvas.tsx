"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { profile } from "@/content/profile";
import type { ParticleWorld } from "./ParticleWorld";
import { WORLD_FOCUS_EVENT } from "./stages";

const COMPACT_QUERY = "(max-width: 1023px)";

/**
 * Fixed, full-screen particle world behind the page. three.js is imported
 * only after the browser is idle, never for reduced motion or Data Saver,
 * and the page is fully usable without it (html[data-world="static"]).
 */
export function WorldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();

  // A client-side navigation swaps the sections; re-read the stage for the new page.
  useEffect(() => {
    const frame = requestAnimationFrame(() => window.dispatchEvent(new Event("scroll")));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = document.documentElement;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || connection?.saveData) {
      root.dataset.world = "static";
      return;
    }

    let world: ParticleWorld | null = null;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    const start = async () => {
      try {
        const compact = window.matchMedia(COMPACT_QUERY).matches;
        const [{ ParticleWorld }, land] = await Promise.all([
          import("./ParticleWorld"),
          fetch("/data/land-points.bin").then((r) => {
            if (!r.ok) throw new Error(`land points ${r.status}`);
            return r.arrayBuffer();
          }),
          document.fonts.ready,
        ]);
        if (disposed) return;
        // Heavy sans survives as particles; the serif's hairlines don't.
        const sans = getComputedStyle(root).getPropertyValue("--font-manrope").trim() || "sans-serif";
        world = new ParticleWorld(canvas, {
          compact,
          land: new Int16Array(land),
          initials: profile.initials,
          fontFamily: sans,
        });
        root.dataset.world = "3d";
        cleanups.push(...wire(world, canvas));
        world.play();
      } catch (error) {
        console.warn("Particle world unavailable, using static layout.", error);
        root.dataset.world = "static";
      }
    };

    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle
      ? window.requestIdleCallback(() => void start(), { timeout: 2000 })
      : globalThis.setTimeout(() => void start(), 900);

    return () => {
      disposed = true;
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else globalThis.clearTimeout(idle);
      cleanups.forEach((fn) => fn());
      world?.dispose();
      delete root.dataset.world;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-[100lvh] w-full"
    />
  );
}

/** Connects scroll, pointer, resize and visibility to the world. Returns cleanups. */
function wire(world: ParticleWorld, canvas: HTMLCanvasElement) {
  let frame = 0;

  // Stage = index of the section crossing the viewport centre, plus how far
  // the next section has advanced, so shapes morph as sections hand over.
  const updateStage = () => {
    frame = 0;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-world-stage]"));
    if (sections.length === 0) return;
    const probe = window.innerHeight * 0.55;
    let stage = Number(sections[0].dataset.worldStage);
    for (let i = 0; i < sections.length; i++) {
      const rect = sections[i].getBoundingClientRect();
      const index = Number(sections[i].dataset.worldStage);
      if (rect.top <= probe) {
        stage = index;
        const next = sections[i + 1];
        if (next) {
          const nextTop = next.getBoundingClientRect().top;
          const span = Math.max(1, nextTop - rect.top);
          const progress = (probe - rect.top) / span;
          // Hold the shape for most of the section (data-world-hold, default
          // 62%), then morph over the rest.
          const hold = Number(sections[i].dataset.worldHold ?? 0.62);
          const t = Math.min(1, Math.max(0, (progress - hold) / (1 - hold)));
          stage = index + (Number(next.dataset.worldStage) - index) * t * t * (3 - 2 * t);
        }
      }
    }
    world.setStage(stage);
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(updateStage);
  };
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    world.setPointer((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
  };
  const onLeave = () => world.setPointer(null);
  const onVisibility = () => (document.hidden ? world.pause() : world.play());
  // Sections can spotlight part of the world, e.g. a skills cluster.
  const onFocus = (event: Event) => world.setFocus((event as CustomEvent<number | null>).detail);
  const observer = new ResizeObserver(() => {
    world.resize();
    onScroll();
  });

  updateStage();
  observer.observe(canvas);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener(WORLD_FOCUS_EVENT, onFocus);

  return [
    () => cancelAnimationFrame(frame),
    () => observer.disconnect(),
    () => window.removeEventListener("scroll", onScroll),
    () => window.removeEventListener("pointermove", onPointer),
    () => document.documentElement.removeEventListener("pointerleave", onLeave),
    () => document.removeEventListener("visibilitychange", onVisibility),
    () => window.removeEventListener(WORLD_FOCUS_EVENT, onFocus),
  ];
}
