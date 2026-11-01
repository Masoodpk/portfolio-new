import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TagList } from "@/components/ui/Tag";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { projects } from "@/content/projects";

export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="section-y bg-ink-raised">
      <div className="container-page">
        <SectionHeading
          index="04"
          label="Selected Work"
          id="projects-title"
          aside={`${projects.length.toString().padStart(2, "0")} Projects`}
        >
          Real products, <span className="text-subtle">real users.</span>
        </SectionHeading>

        <ul className="flex flex-col gap-24 md:gap-32">
          {projects.map((project, i) => (
            <li key={project.slug}>
              <article
                aria-labelledby={`project-${project.slug}`}
                className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8"
              >
                <div className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-last lg:col-start-6" : ""}`}>
                  <BrowserFrame url={project.links[0]?.label ?? project.slug}>
                    <div className="flex aspect-[16/10] flex-col justify-between bg-[radial-gradient(80%_80%_at_70%_20%,rgb(255_95_31/0.14),transparent_60%)] p-6 md:p-10">
                      <p className="label-mono text-subtle">{project.context}</p>
                      <p className="font-display-wide text-[clamp(2.5rem,7vw,6rem)] uppercase text-fg/90">
                        {project.name}
                      </p>
                    </div>
                  </BrowserFrame>
                </div>

                <div className={`flex flex-col lg:col-span-5 ${i % 2 === 1 ? "" : "lg:pl-8"}`}>
                  <p className="label-mono flex gap-3 text-subtle">
                    <span className="text-accent">{project.index}</span>
                    <span>{project.year}</span>
                  </p>
                  <h3
                    id={`project-${project.slug}`}
                    className="font-display-regular mt-4 text-[clamp(2rem,4vw,3rem)] text-fg"
                  >
                    {project.name}
                  </h3>
                  <p className="mt-1 text-muted">{project.tagline}</p>
                  <p className="mt-6 leading-relaxed text-muted">{project.description}</p>

                  <h4 className="label-mono mt-8 text-subtle">My contributions</h4>
                  <ul className="mt-4 space-y-2">
                    {project.contributions.map((item) => (
                      <li key={item} className="relative pl-5 text-sm leading-relaxed text-muted">
                        <span aria-hidden="true" className="absolute left-0 top-2.5 h-px w-2.5 bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <TagList items={project.stack} label={`${project.name} technology stack`} />
                  </div>

                  <div className="mt-8 flex flex-wrap gap-6">
                    {project.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-b border-line-strong pb-1 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
                      >
                        Visit {link.label}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
