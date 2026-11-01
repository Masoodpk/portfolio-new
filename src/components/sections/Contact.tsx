import { ArrowDownToLine, ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/sections/ContactForm";
import { profile } from "@/content/profile";
import { DESTINATIONS, ORIGIN } from "@/components/world/stages";

export function Contact() {
  return (
    <section id="contact" data-world-stage="5" aria-labelledby="contact-title" className="relative pb-[var(--section-y)]">
      <div className="container-page flex min-h-svh flex-col justify-center py-[var(--section-y)]">
        <div className="eyebrow flex items-center gap-4 text-ink lg:w-7/12">
          <span className="text-cobalt">05</span>
          <span>Contact</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <div className="mt-12 lg:w-7/12">
          <h2 id="contact-title" className="font-display text-[clamp(3.5rem,8vw,8.5rem)]">
            From Kerala <span className="block"><span className="text-gradient italic">to the world.</span></span>
          </h2>
          <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            I&apos;m open to connecting with teams looking for a developer who enjoys building reliable, user-focused
            web applications.
          </p>

          <p className="eyebrow mt-12 text-muted">Email me directly</p>
          <a
            href={`mailto:${profile.email}`}
            className="font-display group mt-3 inline-flex max-w-full items-center gap-3 break-all border-b border-line-strong pb-2 text-[clamp(1.75rem,3.6vw,3rem)] leading-tight transition-colors hover:border-cobalt hover:text-cobalt"
          >
            {profile.email}
            <ArrowUpRight
              className="size-[0.7em] shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>

          <div className="mt-10 flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center">
            <a
              href={profile.cv.href}
              download={profile.cv.fileName}
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-cobalt px-6 text-sm font-semibold text-paper transition-colors hover:bg-cobalt-deep"
            >
              <ArrowDownToLine className="size-4" aria-hidden="true" />
              Download résumé
            </a>
            {profile.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink/80 bg-paper/50 px-6 text-sm font-semibold text-ink backdrop-blur-md transition-colors hover:bg-ink hover:text-paper"
              >
                {social.label}
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
          </div>

          <dl className="mt-14 border-t border-line pt-6 text-sm">
            <dt className="eyebrow text-muted">Based in</dt>
            <dd className="mt-2 text-ink">{profile.location}</dd>
          </dl>
          {/* Names the arcs drawn on the globe for people who can't see it. */}
          <p className="sr-only">
            The globe beside this text draws arcs from {ORIGIN.name} to{" "}
            {DESTINATIONS.map((city) => city.name).join(", ")}.
          </p>
        </div>
      </div>

      <div className="container-page">
        <div className="grid grid-cols-1 gap-12 rounded-[2rem] border border-line bg-paper-raised p-6 shadow-[0_40px_80px_-50px_var(--shadow)] sm:p-10 lg:grid-cols-12 lg:gap-8 lg:p-14">
          <div className="lg:col-span-4">
            <h3 className="font-display text-[clamp(2.5rem,4vw,3.75rem)]">
              Or send a <span className="text-gradient italic">message</span>
            </h3>
            <p className="mt-5 max-w-[34ch] leading-relaxed text-ink-soft">
              Tell me about the role, the team or the challenge you have in mind. I&apos;ll reply by email.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
