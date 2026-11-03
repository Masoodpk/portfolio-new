"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ChapterId } from "@/data/content";
import { gsap, reducedMotion, SplitText } from "@/lib/journey";

type Props = {
  id: ChapterId;
  /** Section height in viewport heights. Taller = the camera moves slower here. */
  length: number;
  labelledBy?: string;
  /** Where the content sits on screen */
  align?: "left" | "right" | "center";
  /** Keep the content on screen until the very end (the last chapter) */
  stay?: boolean;
  /**
   * Pin the content while the camera flies (default). Long content pins on
   * large screens only: on phones it scrolls through the middle of its
   * chapter instead, so the forest has the screen before and after it.
   */
  pin?: "always" | "large";
  children?: ReactNode;
  className?: string;
};

/**
 * One chapter of the journey: a tall section the camera flies through, with
 * its content pinned (sticky) on screen while the camera reaches the place.
 * Content fades and rises in as the chapter begins and fades out as it ends,
 * scrubbed to scroll. Text marked `data-reveal` slides up line by line from
 * behind a mask as the camera arrives (and back down if you scroll back).
 */
export function ChapterPanel({ id, length, labelledBy, align = "left", stay = false, pin = "always", children, className = "" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!content.current || reducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 75%", end: "bottom bottom", scrub: 1 },
        defaults: { ease: "none" },
      });
      tl.fromTo(content.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.18 });
      tl.to(content.current, { opacity: 1, duration: stay ? 0.82 : 0.62 });
      if (!stay) tl.to(content.current, { opacity: 0, y: -30, duration: 0.2 });

      // Masked line reveals, re-split when fonts load or the width changes
      for (const el of content.current!.querySelectorAll<HTMLElement>("[data-reveal]")) {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.07,
              scrollTrigger: { trigger: ref.current, start: "top 55%", toggleActions: "play none none reverse" },
            }),
        });
      }
    }, ref);
    return () => ctx.revert();
  }, [stay]);

  const place = align === "right" ? "lg:justify-end" : align === "center" ? "justify-center" : "";

  return (
    <section ref={ref} id={id} data-chapter={id} aria-labelledby={labelledBy} className="relative flex flex-col" style={{ minHeight: `${length * 100}vh` }}>
      <div
        className={`${pin === "always" ? "sticky" : "flex-1 py-[12vh] lg:sticky lg:flex-none lg:py-0"} top-0 flex min-h-svh items-center pt-[var(--header-h)] ${className}`}
      >
        <div className={`container-page flex ${place}`}>
          <div ref={content} className="w-full">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
