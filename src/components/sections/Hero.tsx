import type { CSSProperties } from "react";
import { ArrowDown, ArrowDownToLine, ArrowRight } from "lucide-react";
import { profile } from "@/content/profile";
import { ORIGIN } from "@/components/world/stages";
import { StaticGlobe } from "@/components/world/StaticGlobe";

const coordinate = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(2)}°${value >= 0 ? positive : negative}`;

const drift = (distance: string) => ({ "--drift": distance }) as CSSProperties;
/** Entrance delay; the loader adds its own length on top (see --intro in globals.css). */
const delay = (ms: string) => ({ "--d": ms }) as CSSProperties;

export function Hero() {
  const [lineOne, lineTwo] = profile.headline;

  return (
    <section
      id="home"
      data-world-stage="0"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh flex-col overflow-hidden pt-[var(--header-h)]"
    >
      {/* Shown only when the particle world can't run (reduced motion, no WebGL). */}
      <StaticGlobe className="pointer-events-none absolute right-[-6vw] top-[45%] hidden w-[46vw] max-w-[40rem] -translate-y-1/2 opacity-45 [[data-world=static]_&]:block" />

      <div className="container-page relative flex flex-1 flex-col justify-between gap-10 pb-8 pt-6 md:pt-10">
        <div className="animate-fade flex flex-wrap items-center justify-between gap-4" style={delay("600ms")}>
          <p className="eyebrow text-ink-soft">
            {profile.title} <span className="mx-2 text-line-strong">/</span> {profile.discipline}
          </p>
          <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-paper-raised/70 px-4 py-2 text-sm font-medium text-ink backdrop-blur-md">
            <span className="animate-pulse-ring size-2 rounded-full bg-cobalt" aria-hidden="true" />
            {profile.availability}
          </p>
        </div>

        <h1 id="hero-title" className="font-display text-[clamp(4.75rem,min(14vw,24svh),15rem)] leading-[0.8]">
          <span className="hero-drift block" style={drift("-8vw")}>
            <span className="reveal-line">
              <span style={delay("150ms")}>Masood</span>
            </span>
          </span>
          <span className="hero-drift block pl-[0.9em]" style={drift("10vw")}>
            <span className="reveal-line">
              <span style={delay("280ms")}>
                <span className="text-gradient italic">PK</span>
              </span>
            </span>
          </span>
          <span className="sr-only">, {profile.title}</span>
        </h1>

        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="animate-fade lg:col-span-6 xl:col-span-5" style={delay("700ms")}>
            <p className="text-[clamp(1.5rem,2.5vw,2.375rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
              {lineOne} <span className="text-ink-soft">{lineTwo}</span>
            </p>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink-soft md:text-lg">{profile.intro}</p>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center">
              <a
                href="#projects"
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-cobalt px-6 text-sm font-semibold text-paper transition-colors hover:bg-cobalt-deep"
              >
                Explore my work
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a
                href={profile.cv.href}
                download={profile.cv.fileName}
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-ink/80 bg-paper/50 px-6 text-sm font-semibold text-ink backdrop-blur-md transition-colors hover:bg-ink hover:text-paper"
              >
                <ArrowDownToLine className="size-4" aria-hidden="true" />
                Download résumé
              </a>
              <a
                href="#contact"
                className="inline-flex min-h-12 items-center justify-center px-3 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-[6px] transition-colors hover:text-cobalt hover:decoration-cobalt"
              >
                Let&apos;s connect
              </a>
            </div>
          </div>

          <div
            className="animate-fade flex items-end justify-between gap-6 border-t border-line pt-5 text-sm lg:col-span-4 lg:col-start-9 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0 lg:text-right"
            style={delay("900ms")}
          >
            <p className="flex flex-col gap-1">
              <span className="eyebrow text-muted">Point of origin</span>
              <span className="font-medium text-ink">
                {ORIGIN.name}, Kerala <span className="text-ink-soft">· India</span>
              </span>
              <span className="tabular-nums text-ink-soft">
                {coordinate(ORIGIN.lat, "N", "S")} {coordinate(ORIGIN.lon, "E", "W")}
              </span>
            </p>
            <a href="#about" className="group inline-flex items-center gap-2 font-semibold text-ink hover:text-cobalt">
              Begin the journey
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
