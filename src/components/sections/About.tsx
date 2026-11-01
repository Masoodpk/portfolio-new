import Image from "next/image";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { about, profile } from "@/content/profile";
import portrait from "@/assets/masood-pk.png";

export function About() {
  const [firstParagraph, ...moreParagraphs] = about.body;

  return (
    <section id="about" aria-labelledby="about-title" className="section-y">
      <div className="container-page">
        <SectionHeading index="01" label="About" id="about-title" aside={profile.location}>
          {about.heading[0]} <span className="text-subtle">{about.heading[1]}</span>
        </SectionHeading>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <figure className="lg:col-span-4">
            <div className="relative overflow-hidden bg-panel">
              <Image
                src={portrait}
                alt={`Portrait of ${profile.name}, ${profile.title}`}
                placeholder="blur"
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 60vw, 100vw"
                className="aspect-[4/5] w-full object-cover object-top grayscale-[35%]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent"
              />
            </div>
            <figcaption className="label-mono mt-4 flex justify-between text-subtle">
              <span>{profile.name}</span>
              <span>{profile.title}</span>
            </figcaption>
          </figure>

          <div className="lg:col-span-7 lg:col-start-6">
            <p className="font-display-regular text-[clamp(1.375rem,2.4vw,2rem)] leading-tight text-fg">
              {about.lead}
            </p>
            <p className="mt-8 max-w-[62ch] leading-relaxed text-muted">{firstParagraph}</p>

            <details className="group mt-6 max-w-[62ch]">
              <summary className="label-mono inline-flex cursor-pointer list-none items-center gap-2 text-fg transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                <Plus
                  className="size-3.5 transition-transform duration-300 group-open:rotate-45"
                  aria-hidden="true"
                />
                <span className="group-open:hidden">Read more</span>
                <span className="hidden group-open:inline">Show less</span>
              </summary>
              <div className="mt-6 space-y-6 leading-relaxed text-muted">
                {moreParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </details>

            <ul className="mt-14 grid grid-cols-1 border-t border-line sm:grid-cols-2">
              {about.principles.map((principle, i) => (
                <li
                  key={principle.title}
                  className={`border-b border-line py-6 sm:pr-6 ${i % 2 === 1 ? "sm:border-l sm:pl-6 sm:pr-0" : ""}`}
                >
                  <h3 className="text-base font-medium text-fg">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{principle.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
