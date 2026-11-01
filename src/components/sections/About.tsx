import type { CSSProperties } from "react";
import Image from "next/image";
import { about, profile } from "@/content/profile";
import portrait from "@/assets/masood-pk.png";

const NUMERALS = ["i.", "ii.", "iii.", "iv."];

/** Names worth catching the eye as the lead inks in. */
const HIGHLIGHTS = ["Easify", "IOCOD", "Infotech"];

/** Splits the lead into words that ink in one by one as it scrolls past. */
function InkWords({ text }: { text: string }) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <span
      key={`${word}-${i}`}
      className={HIGHLIGHTS.some((name) => word.includes(name)) ? "text-cobalt [--ink-from:0.68]" : undefined}
      style={{ "--p": i / (words.length - 1) } as CSSProperties}
    >
      {word}
      {i < words.length - 1 ? " " : ""}
    </span>
  ));
}

export function About() {
  const [firstParagraph, ...moreParagraphs] = about.body;

  return (
    <section id="about" data-world-stage="1" aria-labelledby="about-title" className="section-y relative">
      <div className="container-page">
        <div className="eyebrow flex items-center gap-4 text-ink">
          <span className="text-cobalt">01</span>
          <span>About</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          <span className="hidden text-muted sm:inline">{profile.location}</span>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 md:mt-16 lg:grid-cols-12">
          <h2 id="about-title" className="font-display text-[clamp(3.5rem,6.4vw,7.5rem)] lg:col-span-8">
            <span className="reveal-view">
              <span>{about.heading[0]}</span>
            </span>
            <span className="reveal-view">
              <span className="italic text-cobalt">{about.heading[1]}</span>
            </span>
          </h2>

          {/* Desktop: pinned beside the text, under the particle initials. */}
          <div className="lg:sticky lg:top-[var(--header-h)] lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:flex lg:h-[calc(100svh-var(--header-h))] lg:flex-col lg:justify-between lg:pb-10">
            {/* Static stand-in for the particle initials when 3D is off (pseudo-content: purely decorative). */}
            <span
              aria-hidden="true"
              data-initials={profile.initials}
              className="font-display hidden text-right text-[clamp(6rem,11vw,11rem)] italic text-cobalt/15 before:content-[attr(data-initials)] lg:[[data-world=static]_&]:block"
            />
            <figure className="reveal-clip ml-auto w-full max-w-sm lg:mt-auto lg:max-w-[17rem]">
              <div className="overflow-hidden rounded-[2px] bg-paper-deep">
                <Image
                  src={portrait}
                  alt={`Portrait of ${profile.name}, ${profile.title}`}
                  placeholder="blur"
                  sizes="(min-width: 1024px) 17rem, (min-width: 640px) 24rem, 100vw"
                  className="aspect-[4/5] w-full object-cover object-top contrast-[1.05] grayscale mix-blend-multiply"
                />
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-xs text-muted">
                <span>
                  <span className="font-display text-base italic text-ink">Fig. 01</span> — {profile.name}
                </span>
                <span>{profile.title}</span>
              </figcaption>
            </figure>
          </div>

          <div className="lg:col-span-6">
            <p className="ink-words font-display text-[clamp(1.75rem,2.7vw,2.625rem)] leading-[1.12] tracking-[-0.015em]">
              <InkWords text={about.lead} />
            </p>

            <div className="mt-12 max-w-[58ch] space-y-6 text-base leading-relaxed text-ink-soft md:text-[1.0625rem]">
              <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-[4.25rem] first-letter:leading-[0.8] first-letter:text-cobalt">
                {firstParagraph}
              </p>
              {moreParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <h3 className="eyebrow mt-20 text-muted">How I work</h3>
            <ol className="mt-6 grid grid-cols-1 border-t border-line-strong sm:grid-cols-2">
              {about.principles.map((principle, i) => (
                <li
                  key={principle.title}
                  className={`border-b border-line py-7 sm:pr-8 ${i % 2 === 1 ? "sm:border-l sm:pl-8 sm:pr-0" : ""}`}
                >
                  <h4 className="flex items-baseline gap-3">
                    <span className="font-display text-xl italic text-cobalt" aria-hidden="true">
                      {NUMERALS[i]}
                    </span>
                    <span className="font-display text-[1.75rem] leading-none">{principle.title}</span>
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{principle.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
