"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SceneErrorBoundary } from "./SceneErrorBoundary";
import { passThroughProgress, pinnedProgress } from "./hand-timeline";
import type { HandController } from "./HandScene";

// three.js + R3F live in their own chunk and are only fetched in "3d" mode.
// Nothing in this file may import them at runtime, or they join the initial bundle.
const HandScene = dynamic(() => import("./HandScene"), { ssr: false });

type Mode = "pending" | "3d" | "static";

const DESKTOP_QUERY = "(min-width: 1024px)";

function canRender3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Collapses the pinned scroll track and shows the headline fully revealed. */
function markStatic(section: HTMLElement | null) {
  if (!section) return;
  section.dataset.hand = "static";
  section.dataset.snapped = "true";
}

/**
 * Client island for the hero's 3D hand. Owns capability checks, lazy loading,
 * scroll/pointer input, visibility pausing and the static fallback.
 */
export function HeroHand() {
  const rootRef = useRef<HTMLDivElement>(null);
  const controller = useRef<HandController>({ progress: 0, pointerX: 0, pointerY: 0 });
  const requestFrame = useRef<(() => void) | null>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [compact, setCompact] = useState(false);
  const [snapCount, setSnapCount] = useState(0);

  const heroSection = useCallback(() => rootRef.current?.closest("section") ?? null, []);

  // Decide once the browser is idle — the 3D chunk never competes with first paint.
  // Reduced motion is also handled in CSS, so the layout is right before this runs.
  useEffect(() => {
    const start = () => {
      if (!canRender3D()) {
        markStatic(heroSection());
        setMode("static");
        return;
      }
      setCompact(!window.matchMedia(DESKTOP_QUERY).matches);
      setMode("3d");
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 1200);
    return () => clearTimeout(id);
  }, [heroSection]);

  // Scroll → progress. One passive listener, coalesced to one read per frame.
  useEffect(() => {
    if (mode !== "3d") return;
    const section = heroSection();
    const stage = rootRef.current;
    if (!section || !stage) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      if (desktop.matches) {
        const rect = section.getBoundingClientRect();
        controller.current.progress = pinnedProgress(rect.top, rect.height, vh);
      } else {
        controller.current.progress = passThroughProgress(stage.getBoundingClientRect().top, vh);
      }
      requestFrame.current?.();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      controller.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      controller.current.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      onScroll();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [mode, heroSection]);

  // Stop rendering entirely while the stage is off screen.
  useEffect(() => {
    if (mode !== "3d" || !rootRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "100px",
    });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [mode]);

  const onSnapChange = useCallback(
    (snapped: boolean) => {
      const section = heroSection();
      if (section) section.dataset.snapped = String(snapped);
      if (snapped) setSnapCount((n) => n + 1);
    },
    [heroSection],
  );

  const onReady = useCallback((request: () => void) => {
    requestFrame.current = request;
    request();
    setReady(true);
  }, []);

  const onError = useCallback(() => {
    markStatic(heroSection());
    setMode("static");
  }, [heroSection]);

  return (
    <div ref={rootRef} className="absolute inset-0" aria-hidden="true">
      {/* Static poster: shown until the first 3D frame, and as the permanent fallback. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative, sized by CSS, must not become LCP */}
      <img
        src="/images/hand-poster.webp"
        alt=""
        width={388}
        height={1100}
        decoding="async"
        fetchPriority="low"
        // 81% matches the hand's share of the canvas height (2.6 units in a 30° view at z=6).
        className={`absolute inset-0 m-auto h-[81%] w-auto object-contain transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {mode === "3d" ? (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <SceneErrorBoundary onError={onError}>
            <HandScene
              controller={controller}
              active={active}
              compact={compact}
              onReady={onReady}
              onSnapChange={onSnapChange}
            />
          </SceneErrorBoundary>
        </div>
      ) : null}

      {snapCount > 0 ? (
        <span key={snapCount} className="snap-ring pointer-events-none absolute left-1/2 top-1/2" />
      ) : null}
    </div>
  );
}
