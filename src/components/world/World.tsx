"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { capturing, serverWorldMode, subscribeWorldMode, worldMode } from "@/lib/worldState";
import { Loader } from "./Loader";
import { Stills } from "./Stills";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * The fixed layer behind the page.
 * - Live: the painted 3D forest, with the painted-leaf loader over it until
 *   its first frames are drawn.
 * - Stills: without WebGL, or with reduced motion, a painted still of each
 *   chapter crossfades in as you scroll (pre-rendered by `npm run stills`).
 * A painted gradient sits underneath both while anything loads.
 */
export function World() {
  const mode = useSyncExternalStore(subscribeWorldMode, worldMode, serverWorldMode);
  // The world is the home page; case studies sit on the painted backdrop.
  const home = usePathname() === "/";

  // The hero shows its HTML title unless the 3D one is drawn.
  useEffect(() => {
    if (mode === "unknown") return;
    document.documentElement.dataset.webgl = mode === "live" && home ? "on" : "off";
    if (capturing()) document.documentElement.dataset.capture = "";
  }, [mode, home]);

  return (
    <>
      <div aria-hidden="true" className="world-layer fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#6fa3c8_0%,#bfd9de_38%,#7fa650_62%,#2f5a3c_80%,#1e3b2c_100%)]" />
        {home && mode === "live" ? <Scene /> : null}
        {home && mode === "stills" ? <Stills /> : null}
      </div>
      {home ? <Loader mode={mode} /> : null}
    </>
  );
}
