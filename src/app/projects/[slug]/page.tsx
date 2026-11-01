import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { TagList } from "@/components/ui/Tag";
import { getAdjacentProject, getProject, projects } from "@/content/projects";
import { profile } from "@/content/profile";

// Every case study is prerendered from generateStaticParams, so reading `params`
// never blocks a real navigation; opt out of the dev-only instant validation.
export const instant = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.name} — Case Study`,
    description: `${project.description} ${profile.name}'s role: ${project.role}.`,
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getAdjacentProject(project.slug);
  const [cover, ...gallery] = project.visuals;

  return (
    <article className="pt-[var(--header-h)]">
      <header className="container-page pt-10 md:pt-16">
        <nav aria-label="Breadcrumb">
          <ol className="label-mono flex flex-wrap items-center gap-2 text-subtle">
            <li>
              <Link href="/" className="transition-colors hover:text-fg">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-line-strong">/</li>
            <li>
              <Link href="/#projects" className="transition-colors hover:text-fg">
                Projects
              </Link>
            </li>
            <li aria-hidden="true" className="text-line-strong">/</li>
            <li aria-current="page" className="text-fg">
              {project.name}
            </li>
          </ol>
        </nav>

        <p className="label-mono mt-14 flex gap-3 text-subtle">
          <span className="text-accent">{project.index}</span>
          <span>Case Study</span>
        </p>
        <h1 className="font-display-wide mt-5 text-[clamp(3rem,11vw,10rem)] uppercase">{project.name}</h1>
        <p className="font-display-regular mt-6 max-w-[28ch] text-[clamp(1.375rem,2.6vw,2.25rem)] text-muted">
          {project.tagline}
        </p>

        <dl className="mt-14 grid grid-cols-2 border-t border-line md:grid-cols-4">
          <Meta term="Company">{project.context}</Meta>
          <Meta term="Period">{project.year}</Meta>
          <Meta term="Role">{project.role.split(" — ")[0]}</Meta>
          <Meta term="Live">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline-offset-4 hover:text-accent hover:underline"
              >
                {link.label}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
          </Meta>
        </dl>
      </header>

      <figure className="container-page mt-12 md:mt-20">
        <ProjectVisual project={project} visual={cover} sizes="(min-width: 1440px) 1344px, 100vw" preload />
        {cover.kind === "schematic" ? (
          <figcaption className="label-mono mt-4 text-subtle">
            {cover.title} — {cover.caption}
          </figcaption>
        ) : null}
      </figure>

      <div className="container-page section-y grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
        <section aria-labelledby="product-title" className="lg:col-span-5">
          <h2 id="product-title" className="label-mono text-accent">
            The product
          </h2>
          <p className="font-display-regular mt-6 text-[clamp(1.375rem,2.2vw,1.875rem)] leading-snug">
            {project.caseStudy.product}
          </p>
        </section>
        <section aria-labelledby="role-title" className="lg:col-span-6 lg:col-start-7">
          <h2 id="role-title" className="label-mono text-accent">
            My role
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">{project.caseStudy.myRole}</p>
          <h3 className="label-mono mt-12 text-subtle">What I worked on</h3>
          <ul className="mt-5 space-y-3">
            {project.contributions.map((item) => (
              <li key={item} className="relative pl-5 leading-relaxed text-fg">
                <span aria-hidden="true" className="absolute left-0 top-3 h-px w-2.5 bg-accent" />
                {item}
              </li>
            ))}
          </ul>
          <h3 className="label-mono mt-12 text-subtle">Technology</h3>
          <div className="mt-5">
            <TagList items={project.stack} label={`${project.name} technology stack`} />
          </div>
        </section>
      </div>

      <section aria-labelledby="approach-title" className="border-y border-line bg-ink-raised">
        <div className="container-page section-y">
          <h2 id="approach-title" className="font-display-regular max-w-[18ch] text-[clamp(2rem,5vw,4rem)]">
            How I approached it
          </h2>
          <ol className="mt-14 grid grid-cols-1 border-t border-line md:grid-cols-2 xl:grid-cols-4">
            {project.caseStudy.approach.map((step, i) => (
              <li
                key={step.title}
                className={`border-b border-line py-8 md:px-6 xl:border-b-0 ${
                  i % 2 === 1 ? "md:border-l" : "md:pl-0"
                } ${i > 0 ? "xl:border-l xl:pl-6" : "xl:pl-0"}`}
              >
                <p className="label-mono text-accent">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-xl font-medium text-fg">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {gallery.length > 0 ? (
        <section aria-labelledby="gallery-title" className="container-page section-y">
          <h2 id="gallery-title" className="label-mono text-subtle">
            Interface previews
          </h2>
          <ul className="mt-10 grid grid-cols-1 items-start gap-12 md:grid-cols-12 md:gap-8">
            {gallery.map((visual, i) => (
              <li
                key={i}
                className={visual.kind === "image" && visual.device === "mobile" ? "md:col-span-4" : "md:col-span-8"}
              >
                <figure>
                  <ProjectVisual
                    project={project}
                    visual={visual}
                    sizes="(min-width: 768px) 66vw, 100vw"
                  />
                  <figcaption className="label-mono mt-4 text-subtle">
                    {visual.kind === "schematic" ? `${visual.title} — ${visual.caption}` : visual.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <aside className="container-page pb-16">
        <p className="max-w-[70ch] border-l-2 border-accent pl-5 text-sm leading-relaxed text-subtle">
          {project.caseStudy.note}
        </p>
      </aside>

      <nav aria-label="More projects" className="border-t border-line">
        <div className="container-page flex flex-col gap-8 py-14 sm:flex-row sm:items-end sm:justify-between">
          <Link
            href="/#projects"
            className="label-mono inline-flex items-center gap-2 text-subtle transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All projects
          </Link>
          {next && next.slug !== project.slug ? (
            <Link href={`/projects/${next.slug}`} className="group text-right">
              <span className="label-mono block text-subtle">Next case study</span>
              <span className="font-display-regular mt-2 inline-flex items-center gap-3 text-[clamp(1.75rem,4vw,3rem)] transition-colors group-hover:text-accent">
                {next.name}
                <ArrowRight className="size-[0.7em]" aria-hidden="true" />
              </span>
            </Link>
          ) : null}
        </div>
      </nav>
    </article>
  );
}

function Meta({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-5 pr-4 md:border-b-0">
      <dt className="label-mono text-subtle">{term}</dt>
      <dd className="mt-2 flex flex-col gap-1 text-fg">{children}</dd>
    </div>
  );
}
