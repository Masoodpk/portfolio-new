"use client";

import { chapters } from "@/data/content";
import { useActiveSection } from "@/lib/use-active-section";

const IDS = chapters.map((c) => c.id);

/**
 * The forest without WebGL or motion: one painted still per chapter,
 * rendered from the live scene (`npm run stills`), crossfading as each
 * chapter reaches the middle of the screen. Only the current chapter and
 * its neighbours are in the page, so the rest never download early.
 */
export function Stills() {
  const active = useActiveSection(IDS);
  const index = Math.max(0, IDS.findIndex((id) => id === active));

  return (
    <div className="absolute inset-0">
      {IDS.map((id, i) =>
        Math.abs(i - index) <= 1 ? (
          <picture key={id}>
            <source media="(orientation: portrait)" srcSet={`/stills/${id}-portrait.webp`} />
            <img
              src={`/stills/${id}.webp`}
              alt=""
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-opacity duration-[1400ms] ease-in-out"
              style={{ opacity: i === index ? 1 : 0 }}
            />
          </picture>
        ) : null,
      )}
    </div>
  );
}
