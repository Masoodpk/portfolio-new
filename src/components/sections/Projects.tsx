import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { projects } from "@/content/projects";

export function Projects() {
  return (
    <section id="projects" data-world-stage="4" aria-labelledby="projects-title" className="section-y relative">
      <div className="container-page">
        <div className="eyebrow flex items-center gap-4 text-ink">
          <span className="text-cobalt">04</span>
          <span>Work</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <div className="mt-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <h2 id="projects-title" className="font-display text-[clamp(3.5rem,7vw,7.5rem)] lg:col-span-8">
            Things I&apos;ve helped <span className="text-gradient italic">build</span>
          </h2>
          <p className="max-w-[40ch] text-lg leading-relaxed text-ink-soft lg:col-span-4">
            Production features for a live business platform, and a marketing site for a growing brand — described
            only as far as I can share.
          </p>
        </div>

        <ol className="mt-16 md:mt-24">
          {projects.map((project, i) => {
            const [cover] = project.visuals;
            const flip = i % 2 === 1;
            return (
              <li key={project.slug} className="border-t border-line-strong py-14 md:py-20">
                <article
                  aria-labelledby={`project-${project.slug}`}
                  className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8"
                >
                  <div className={`lg:col-span-5 ${flip ? "lg:col-start-8" : ""}`}>
                    <p className="eyebrow flex flex-wrap gap-x-3 gap-y-1">
                      <span className="text-cobalt">{project.index}</span>
                      <span className="text-ink">{project.context}</span>
                      <span className="text-muted">{project.year}</span>
                    </p>
                    <h3
                      id={`project-${project.slug}`}
                      className="font-display mt-6 text-[clamp(3.5rem,6.5vw,6.5rem)]"
                    >
                      {project.name}
                    </h3>
                    <p className="font-display mt-4 text-[clamp(1.5rem,2.2vw,2rem)] italic leading-tight text-ink-soft">
                      {project.tagline}
                    </p>
                    <p className="mt-6 max-w-[48ch] leading-relaxed text-ink-soft">{project.description}</p>

                    <dl className="mt-8 grid grid-cols-1 gap-4 border-t border-line pt-6 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="eyebrow text-muted">Role</dt>
                        <dd className="mt-2 text-ink">{project.role.split(" — ")[0]}</dd>
                      </div>
                      <div>
                        <dt className="eyebrow text-muted">Built with</dt>
                        <dd className="mt-2 text-ink">{project.stack.join(" · ")}</dd>
                      </div>
                    </dl>

                    <div className="mt-10 flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-cobalt"
                      >
                        Read case study<span className="sr-only">: {project.name}</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                      {project.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-12 items-center justify-center gap-2 px-3 text-sm font-semibold text-ink underline decoration-line-strong underline-offset-[6px] transition-colors hover:text-cobalt hover:decoration-cobalt"
                        >
                          {link.label}
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <figure className={`lg:col-span-7 ${flip ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-6"}`}>
                    <div className="parallax-y [--parallax:3vh]">
                      <ProjectVisual project={project} visual={cover} sizes="(min-width: 1024px) 55vw, 100vw" />
                    </div>
                    <figcaption className="mt-4 text-xs text-muted">
                      {cover.kind === "schematic"
                        ? `${cover.title} — simplified schematic, not a production screenshot.`
                        : `${project.links[0]?.label ?? project.name}, captured from the live site.`}
                    </figcaption>
                  </figure>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
