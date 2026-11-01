import type { CSSProperties } from "react";
import { ArrowDownToLine, ArrowRight } from "lucide-react";
import { profile } from "@/content/profile";
import { StaticGlobe } from "@/components/world/StaticGlobe";

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
      <StaticGlobe className="pointer-events-none absolute right-[-10vw] top-1/2 hidden w-[44vw] max-w-[38rem] -translate-y-1/2 opacity-40 [[data-world=static]_&]:block" />

      {/* Portrait screens: the particle face fills the top, the text sits below it. */}
      <div className="container-page relative flex flex-1 flex-col justify-end pb-12 pt-[36svh] md:pb-16 landscape:justify-center landscape:py-16 lg:justify-center lg:py-20">
        <p className="eyebrow animate-fade text-cobalt" style={delay("500ms")}>
          {profile.title}
        </p>

        <h1
          id="hero-title"
          className="font-display mt-6 whitespace-nowrap text-[clamp(3.25rem,16.5vw,10.5rem)] leading-[0.95] md:mt-8 lg:text-[clamp(3.25rem,11.5vw,10.5rem)]"
        >
          <span className="reveal-line">
            <span style={delay("150ms")}>
              {profile.shortName} <span className="text-gradient italic">PK</span>
            </span>
          </span>
        </h1>

        <div className="animate-fade mt-8 max-w-[40rem] md:mt-10" style={delay("650ms")}>
          <p className="text-[clamp(1.375rem,2.4vw,2.125rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
            {lineOne} <span className="text-ink-soft">{lineTwo}</span>
          </p>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink-soft md:text-lg">{profile.intro}</p>

          <div className="mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center">
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
      </div>
    </section>
  );
}
