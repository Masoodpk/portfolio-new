import { ArrowUpRight, Download } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { profile } from "@/content/profile";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="grain section-y relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_100%,rgb(255_95_31/0.12),transparent_70%)]"
      />
      <div className="container-page">
        <div className="hairline flex items-center justify-between border-t pt-4 text-subtle">
          <p className="label-mono">
            <span className="text-accent">05</span>
            <span className="mx-3 text-line-strong">/</span>
            Contact
          </p>
          <p className="label-mono hidden items-center gap-3 sm:flex">
            <span className="animate-pulse-dot size-2 rounded-full bg-accent" aria-hidden="true" />
            {profile.availability}
          </p>
        </div>

        <h2
          id="contact-title"
          className="font-display-regular mt-12 max-w-[16ch] text-[clamp(2.5rem,7vw,6.5rem)]"
        >
          Have an Opportunity or an <span className="text-accent">Interesting Challenge?</span>
        </h2>
        <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-muted">
          I&apos;m open to connecting with teams looking for a developer who enjoys building
          reliable, user-focused web applications.
        </p>

        <a
          href={`mailto:${profile.email}`}
          className="font-display-regular group mt-14 inline-flex max-w-full items-center gap-4 break-all border-b border-line-strong pb-3 text-[clamp(1.25rem,4vw,3rem)] transition-colors hover:border-accent hover:text-accent"
        >
          {profile.email}
          <ArrowUpRight
            className="size-[0.8em] shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </a>

        <div className="mt-14 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
          <ButtonLink
            href={profile.cv.href}
            download={profile.cv.fileName}
            icon={<Download className="size-4" />}
          >
            Download Resume
          </ButtonLink>
          {profile.socials.map((social) => (
            <ButtonLink
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              icon={<ArrowUpRight className="size-4" />}
            >
              {social.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </ButtonLink>
          ))}
        </div>
      </div>
    </section>
  );
}
