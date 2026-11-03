import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/content";
import { ChapterMarkers } from "./ChapterMarkers";
import { SoundToggle } from "./SoundToggle";

/** A small leaf mark for the logo. */
export function LeafMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 20C4 10 10 4 20 4C20 14 14 20 4 20Z" fill="#c5d86d" />
      <path d="M4 20L14 10" stroke="#1e3b2c" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Minimal chrome over the painting: logo top left, the tagline in serif top
 * centre, the forest's sound and the CV top right. The chapter markers (left edge) are the way
 * around the journey.
 */
export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="container-page grid h-[var(--header-h)] grid-cols-[1fr_auto] items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="on-scene pointer-events-auto flex items-center gap-2.5 justify-self-start text-mist">
          <LeafMark />
          <span className="font-display whitespace-nowrap text-2xl">{profile.name}</span>
        </Link>
        <p className="on-scene font-display hidden text-xl italic text-mist/90 md:block">{profile.tagline}</p>
        <div className="flex items-center gap-2 justify-self-end">
          <SoundToggle />
          <a href={profile.cv.href} download={profile.cv.fileName} aria-label="Download CV" className="btn btn--glass pointer-events-auto">
            <span className="sm:hidden">CV</span>
            <span className="hidden sm:inline">Download CV</span>
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="pointer-events-auto">
        <ChapterMarkers />
      </div>
    </header>
  );
}
