"use client";

import { useEffect, useRef } from "react";
import { navItems } from "@/content/navigation";
import { useActiveSection } from "@/lib/use-active-section";

/** The journey's waypoints, in scroll order — a nod to a travel route. */
const WAYPOINTS: Record<string, string> = {
  home: "Kozhikode",
  about: "About",
  experience: "Career",
  skills: "Toolkit",
  projects: "Work",
  contact: "The world",
};

const ids = navItems.map((item) => item.id);

/**
 * Fixed progress rail on wide screens: how far along the journey you are.
 * Decorative — the header nav is the accessible navigation.
 */
export function JourneyRail() {
  const fillRef = useRef<HTMLSpanElement>(null);
  const active = useActiveSection(ids);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const activeIndex = Math.max(0, ids.indexOf(active));

  return (
    <div aria-hidden="true" className="pointer-events-none fixed right-[calc(var(--gutter)*0.6)] top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <div className="relative flex h-[46vh] flex-col justify-between">
        <span className="absolute right-[3px] top-0 h-full w-px bg-line-strong" />
        <span ref={fillRef} className="absolute right-[3px] top-0 h-full w-px origin-top scale-y-0 bg-cobalt" />
        {ids.map((id, i) => (
          <span key={id} className="relative flex items-center justify-end gap-3">
            <span
              className={`rounded-full bg-paper/85 px-2 py-0.5 text-xs font-semibold tracking-wide transition-all duration-500 ease-out-expo ${
                i === activeIndex ? "translate-x-0 text-ink opacity-100" : "translate-x-1 text-muted opacity-0"
              }`}
            >
              {WAYPOINTS[id]}
            </span>
            <span
              className={`size-[7px] rounded-full border transition-colors duration-500 ${
                i <= activeIndex ? "border-cobalt bg-cobalt" : "border-line-strong bg-paper"
              }`}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
