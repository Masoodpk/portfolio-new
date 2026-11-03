"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { capturing, loadingProgress, serverLoadingProgress, subscribeProgress, type WorldMode } from "@/lib/worldState";

/** Longest the loader will wait for the forest before stepping aside anyway. */
const MAX_WAIT = 15000;

/**
 * The painted-leaf loader: while the forest grows (scene code, shaders,
 * the 3D name's font, the first frames), a leaf is drawn stroke by stroke
 * with the progress, its veins fill in, and then it opens out and fades to
 * reveal the forest. Without JavaScript a CSS timer fades it out anyway
 * (see .loader in globals.css), so the page is never held hostage.
 */
export function Loader({ mode }: { mode: WorldMode }) {
  const progress = useSyncExternalStore(subscribeProgress, loadingProgress, serverLoadingProgress);
  const [timedOut, setTimedOut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), MAX_WAIT);
    return () => window.clearTimeout(timer);
  }, []);

  const done = mode === "stills" || progress >= 1 || timedOut || (mode === "live" && capturing());

  // Unmount once the fade has finished.
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setGone(true), 1600);
    return () => window.clearTimeout(timer);
  }, [done]);

  if (gone) return null;
  const shown = Math.round(Math.min(1, progress) * 100);

  return (
    <div
      aria-hidden="true"
      data-state={done ? "done" : "loading"}
      // Hydrated: JavaScript is in charge of the fade, so cancel the no-JS timer.
      className={`loader ${mode === "unknown" ? "" : "loader--hydrated"} fixed inset-0 z-[70] grid place-items-center`}
    >
      <div className="loader__leaf flex flex-col items-center gap-6">
        <svg viewBox="0 0 120 160" className="h-36 w-28 overflow-visible">
          {/* The leaf's body fills in at the end */}
          <path
            className="loader__fill"
            d="M60 152C60 152 14 120 12 74C10 36 38 12 60 6C82 12 110 36 108 74C106 120 60 152 60 152Z"
            fill="#4f7f3f"
          />
          {/* The outline, drawn as the forest loads */}
          <path
            d="M60 152C60 152 14 120 12 74C10 36 38 12 60 6C82 12 110 36 108 74C106 120 60 152 60 152Z"
            fill="none"
            stroke="#c5d86d"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={1000}
            strokeDasharray="1000"
            style={{ strokeDashoffset: 1000 * (1 - Math.min(1, progress)), transition: "stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1)" }}
          />
          {/* Midrib and veins, drawn just behind the outline */}
          <path
            d="M60 158V20M60 52L36 36M60 52L84 36M60 80L28 62M60 80L92 62M60 108L32 94M60 108L88 94M60 132L42 122M60 132L78 122"
            fill="none"
            stroke="#e8efe6"
            strokeOpacity="0.7"
            strokeWidth="1.6"
            strokeLinecap="round"
            pathLength={1000}
            strokeDasharray="1000"
            style={{ strokeDashoffset: 1000 * (1 - Math.max(0, Math.min(1, (progress - 0.25) / 0.75))), transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div className="text-center">
          <p className="font-display text-2xl italic text-mist">Growing the forest</p>
          <p className="eyebrow mt-2 text-[0.65rem] tabular-nums text-firefly/80">{shown}%</p>
        </div>
      </div>
    </div>
  );
}
