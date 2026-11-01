import { ArrowRight, Download } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { HeroStage } from "@/components/sections/HeroStage";
import { profile } from "@/content/profile";

export function Hero() {
  const [lineOne, lineTwo] = profile.headline;

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden pt-[var(--header-h)]"
    >
      {/* Warm key light from the right, where the hand sits */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_78%_42%,rgb(255_95_31/0.10),transparent_70%)]"
      />

      <div className="container-page relative flex flex-1 flex-col">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-4 pt-6 md:pt-10">
          <p className="label-mono inline-flex items-center gap-3 text-muted">
            <span className="animate-pulse-dot size-2 rounded-full bg-accent" aria-hidden="true" />
            {profile.availability}
          </p>
          <p className="label-mono hidden text-subtle md:block">{profile.location}</p>
        </div>

        <div className="relative grid flex-1 grid-cols-1 gap-y-10 py-10 lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-y-6 lg:py-0">
          {/* Name — first in the document for screen readers, last visually on large screens */}
          <h1
            id="hero-title"
            className="animate-rise lg:order-last lg:col-span-12 lg:self-end lg:pb-6"
            style={{ animationDelay: "0ms" }}
          >
            <span className="font-display-wide block text-[14vw] uppercase sm:text-[min(11vw,15svh,12rem)] sm:whitespace-nowrap">
              <span className="block sm:inline">Masood</span> <span className="block sm:inline">PK</span>
            </span>
            <span className="label-mono mt-5 block text-muted lg:hidden">
              {profile.title} <span className="text-line-strong">|</span> {profile.discipline}
            </span>
          </h1>

          {/* Pitch */}
          <div className="relative z-10 flex flex-col justify-center lg:col-span-6 lg:py-6">
            <p className="label-mono hidden text-muted lg:block">
              {profile.title} <span className="mx-1 text-line-strong">|</span> {profile.discipline}
            </p>
            <p
              className="font-display-regular animate-rise mt-0 text-[clamp(1.875rem,4.2vw,3.5rem)] lg:mt-5 lg:text-[clamp(2rem,3.4vw,3.5rem)]"
              style={{ animationDelay: "80ms" }}
            >
              <span className="block text-balance">{lineOne}</span>
              <span className="block text-balance text-subtle">{lineTwo}</span>
            </p>
            <p
              className="animate-rise mt-5 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg lg:text-base xl:text-lg"
              style={{ animationDelay: "160ms" }}
            >
              {profile.intro}
            </p>
            <div
              className="animate-rise mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center"
              style={{ animationDelay: "240ms" }}
            >
              <ButtonLink href="#projects" icon={<ArrowRight className="size-4" />}>
                Explore My Work
              </ButtonLink>
              <ButtonLink
                href={profile.cv.href}
                download={profile.cv.fileName}
                variant="secondary"
                icon={<Download className="size-4" />}
              >
                Download Resume
              </ButtonLink>
              <ButtonLink href="#contact" variant="ghost" className="xs:px-3" icon={<ArrowRight className="size-4" />}>
                Let&apos;s Connect
              </ButtonLink>
            </div>
          </div>

          {/* 3D stage */}
          <div className="relative min-h-[22rem] lg:col-span-6 lg:col-start-7">
            <HeroStage />
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#about"
          className="label-mono absolute bottom-8 right-[var(--gutter)] hidden items-center gap-3 text-subtle transition-colors hover:text-fg lg:flex"
        >
          Scroll
          <span className="relative h-10 w-px overflow-hidden bg-line" aria-hidden="true">
            <span className="animate-scroll-cue absolute inset-0 bg-accent" />
          </span>
        </a>
      </div>
    </section>
  );
}
