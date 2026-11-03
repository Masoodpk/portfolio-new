import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { getAdjacentProject, getProject, profile, projects } from "@/data/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { projectJsonLd } from "@/lib/structured-data";

/** Soft tints for the approach steps, one per step. */
const STEP_TINTS = ["bg-leaf/15", "bg-gold/12", "bg-moss/30", "bg-mist/10"];

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
  const title = `${project.name} — Case Study`;
  const description = `${project.description} ${profile.name}'s role: ${project.role}.`;
  const url = `/projects/${project.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const next = getAdjacentProject(project.slug);
  const [cover, ...gallery] = project.visuals;

  return (
    <article className="relative pt-[var(--header-h)]">
      <JsonLd data={projectJsonLd(project)} />
      <div>
        <header className="container-page relative pt-10 md:pt-16">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <li>
                <Link href="/" className="link-line">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/#projects" className="link-line">
                  Projects
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {project.name}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-12">
              <p className="eyebrow mt-14 text-muted">
                Case study {project.index} · {project.context}
              </p>
              <h1 className="font-display mt-5 text-[clamp(3.5rem,11vw,9rem)] text-ink">{project.name}</h1>
              <p className="mt-4 max-w-[30ch] font-serif text-[clamp(1.4rem,2.6vw,2rem)] italic leading-snug text-accent">
                {project.tagline}
              </p>
            </div>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] bg-line ring-1 ring-line md:grid-cols-4">
            <Meta term="Company">{project.context}</Meta>
            <Meta term="Period">{project.year}</Meta>
            <Meta term="Role">{project.role.split(" — ")[0]}</Meta>
            <Meta term="Live">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="link-line inline-flex items-center gap-1 self-start">
                  {link.label}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
            </Meta>
          </dl>
        </header>

        <figure className="container-page mt-12 md:mt-16">
          <ProjectVisual project={project} visual={cover} sizes="(min-width: 1200px) 1100px, 100vw" preload />
          {cover.kind === "schematic" ? (
            <figcaption className="mt-4 text-xs text-muted">
              {cover.title} — {cover.caption}
            </figcaption>
          ) : null}
        </figure>

        <div className="container-page py-24 grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-10">
          <section aria-labelledby="product-title" className="lg:col-span-5">
            <h2 id="product-title" className="eyebrow text-muted">
              The product
            </h2>
            <p className="font-display mt-6 text-[clamp(1.5rem,2.4vw,2.1rem)] leading-snug text-ink">{project.caseStudy.product}</p>
          </section>
          <section aria-labelledby="role-title" className="lg:col-span-6 lg:col-start-7">
            <h2 id="role-title" className="eyebrow text-muted">
              My role
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">{project.caseStudy.myRole}</p>
            <h3 className="font-serif mt-12 text-xl italic text-ink">What I worked on</h3>
            <ul className="mt-5 space-y-3">
              {project.contributions.map((item) => (
                <li key={item} className="relative pl-7 leading-relaxed text-ink">
                  <svg viewBox="0 0 20 12" aria-hidden="true" className="absolute left-0 top-[0.45em] h-3 w-5 -rotate-[24deg]">
                    <path d="M1 6C5 0 14 0 19 6C14 12 5 12 1 6Z" fill="#8fae86" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <h3 className="font-serif mt-12 text-xl italic text-ink">Technology</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li key={tech} className="rounded-full bg-sage/30 px-3 py-1 text-xs text-ink">
                  {tech}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="approach-title" className="container-page pb-28">
          <h2 id="approach-title" className="font-display max-w-[18ch] text-[clamp(2.5rem,5vw,4rem)] text-ink">
            How I <em className="text-accent">approached</em> it
          </h2>
          <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {project.caseStudy.approach.map((step, i) => (
              <li key={step.title} className={`rounded-[1.75rem] p-7 ${STEP_TINTS[i % STEP_TINTS.length]}`}>
                <p className="font-serif text-sm italic text-ink-soft" aria-hidden="true">
                  Step {i + 1}
                </p>
                <h3 className="font-display mt-2 text-[1.75rem] text-ink">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {gallery.length > 0 ? (
          <section aria-labelledby="gallery-title" className="container-page pb-28">
            <h2 id="gallery-title" className="eyebrow text-muted">
              Interface previews
            </h2>
            <ul className="mt-10 grid grid-cols-1 items-start gap-12 md:grid-cols-12 md:gap-8">
              {gallery.map((visual, i) => (
                <li key={i} className={visual.kind === "image" && visual.device === "mobile" ? "md:col-span-4" : "md:col-span-8"}>
                  <figure>
                    <ProjectVisual project={project} visual={visual} sizes="(min-width: 768px) 66vw, 100vw" />
                    <figcaption className="mt-4 text-xs text-muted">
                      {visual.kind === "schematic" ? `${visual.title} — ${visual.caption}` : visual.caption}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <aside className="container-page pb-16">
          <p className="max-w-[70ch] rounded-2xl border border-dashed border-line-strong p-5 text-sm leading-relaxed text-ink-soft">
            {project.caseStudy.note}
          </p>
        </aside>

        <nav aria-label="More projects" className="container-page flex flex-col gap-8 pb-28 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <Link href="/#projects" className="btn btn--glass self-start">
            <ArrowLeft className="size-4" aria-hidden="true" />
            All projects
          </Link>
          {next && next.slug !== project.slug ? (
            <Link href={`/projects/${next.slug}`} className="group text-right">
              <span className="eyebrow block text-muted">Next case study</span>
              <span className="font-display mt-3 inline-flex items-center gap-3 text-[clamp(2.25rem,5vw,4rem)] text-ink transition-colors group-hover:text-accent">
                {next.name}
                <ArrowRight className="size-[0.6em] transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ) : null}
        </nav>
      </div>
    </article>
  );
}

function Meta({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="bg-paper-raised/85 px-5 py-5">
      <dt className="eyebrow text-muted">{term}</dt>
      <dd className="mt-2 flex flex-col gap-1 text-ink">{children}</dd>
    </div>
  );
}
