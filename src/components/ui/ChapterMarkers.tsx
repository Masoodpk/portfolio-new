"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { chapters, type ChapterId } from "@/data/content";
import { flyTo } from "@/lib/journey";
import { useActiveSection } from "@/lib/use-active-section";

const ids = chapters.map((c) => c.id);

/**
 * The journey's chapters as a column of small diamonds on the left. The
 * active chapter's marker grows into a leaf and shows its name; clicking a
 * marker flies the camera there. On other pages the markers lead home.
 */
export function ChapterMarkers() {
  const home = usePathname() === "/";
  const active = useActiveSection(ids);
  // Briefly show the chapter's name whenever the camera arrives somewhere new.
  const [faded, setFaded] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setFaded(active), 2200);
    return () => clearTimeout(timer);
  }, [active]);
  const shown = faded === active ? null : active;

  const go = (event: MouseEvent<HTMLAnchorElement>, id: ChapterId) => {
    if (!home) return;
    event.preventDefault();
    flyTo(id);
    history.replaceState(null, "", id === "home" ? "/" : `#${id}`);
  };

  return (
    <nav aria-label="Chapters" className="fixed left-3 top-1/2 z-50 -translate-y-1/2 sm:left-6">
      <ol className="flex flex-col gap-3.5">
        {chapters.map((chapter) => {
          const current = home && active === chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={chapter.id === "home" ? "/" : `/#${chapter.id}`}
                onClick={(event) => go(event, chapter.id)}
                aria-current={current ? "true" : undefined}
                className="group flex h-6 items-center gap-3"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" className={`shrink-0 transition-[width,height] duration-500 ${current ? "size-4" : "size-2.5"}`}>
                  {current ? (
                    <path d="M3 13C3 7 7 3 13 3C13 9 9 13 3 13Z" fill="#c5d86d" stroke="#f3efe4" strokeWidth="0.8" />
                  ) : (
                    <path d="M8 1L15 8L8 15L1 8Z" fill="rgb(243 239 228 / 0.55)" className="transition-[fill] group-hover:fill-[#f3efe4]" />
                  )}
                </svg>
                <span
                  className={`on-scene whitespace-nowrap font-display text-lg italic text-mist transition-[opacity,translate] duration-500 ${
                    current && shown === chapter.id
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                >
                  {chapter.place}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
