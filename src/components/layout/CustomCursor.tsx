"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, summary, input, textarea, select, label, [role='button']";

/**
 * A soft trailing ring for mouse users. The system cursor is never hidden,
 * so precision and accessibility are unaffected. Disabled for touch,
 * coarse pointers and reduced motion.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const query = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!query.matches) return;

    const target = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.22;
      current.y += (target.y - current.y) * 0.22;
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      const settled = Math.abs(target.x - current.x) < 0.1 && Math.abs(target.y - current.y) < 0.1;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      ring.dataset.visible = "true";
      ring.dataset.active = String(Boolean((event.target as Element | null)?.closest?.(INTERACTIVE)));
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      ring.dataset.visible = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      data-visible="false"
      data-active="false"
      className="pointer-events-none fixed left-0 top-0 z-[90] size-8 rounded-full border border-accent/70 opacity-0 transition-[width,height,opacity,background-color] duration-300 ease-out-expo data-[active=true]:size-12 data-[active=true]:bg-accent/10 data-[visible=true]:opacity-100"
    />
  );
}
