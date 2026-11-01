import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { getAdjacentProject, getProject, projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { JsonLd } from "@/components/seo/JsonLd";
import { projectJsonLd } from "@/lib/structured-data";

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
    <article data-world-stage="4" className="relative pt-[var(--header-h)]">
      <JsonLd data={projectJsonLd(project)} />
      <header className="container-page pt-10 md:pt-16">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-line-strong">/</li>
            <li>
              <Link href="/#projects" className="transition-colors hover:text-ink">
                Projects
              </Link>
            </li>
            <li aria-hidden="true" className="text-line-strong">/</li>
            <li aria-current="page" className="text-ink">
              {project.name}
            </li>
          </ol>
        </nav>

        <p className="eyebrow mt-14 flex gap-3 text-ink">
          <span className="text-cobalt">{project.index}</span>
          <span>Case study</span>
          <span className="text-muted">{project.context}</span>
        </p>
        <h1 className="font-display mt-6 text-[clamp(4rem,13vw,12rem)] leading-[0.85]">{project.name}</h1>
        <p className="font-display mt-6 max-w-[28ch] text-[clamp(1.75rem,3vw,2.75rem)] italic leading-tight text-cobalt">
          {project.tagline}
        </p>

        <dl className="mt-14 grid grid-cols-2 border-t border-line-strong md:grid-cols-4">
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
                className="inline-flex items-center gap-1 underline decoration-line-strong underline-offset-4 hover:text-cobalt hover:decoration-cobalt"
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
          <figcaption className="mt-4 text-xs text-muted">
            {cover.title} — {cover.caption}
          </figcaption>
        ) : null}
      </figure>

      <div className="container-page section-y grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
        <section aria-labelledby="product-title" className="lg:col-span-5">
          <h2 id="product-title" className="eyebrow text-cobalt">
            The product
          </h2>
          <p className="font-display mt-6 text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.1] tracking-[-0.015em]">
            {project.caseStudy.product}
          </p>
        </section>
        <section aria-labelledby="role-title" className="lg:col-span-6 lg:col-start-7">
          <h2 id="role-title" className="eyebrow text-cobalt">
            My role
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">{project.caseStudy.myRole}</p>
          <h3 className="eyebrow mt-12 text-muted">What I worked on</h3>
          <ul className="mt-5 space-y-3">
            {project.contributions.map((item) => (
              <li key={item} className="relative pl-5 leading-relaxed text-ink">
                <span aria-hidden="true" className="absolute left-0 top-3 h-px w-2.5 bg-cobalt" />
                {item}
              </li>
            ))}
          </ul>
          <h3 className="eyebrow mt-12 text-muted">Technology</h3>
          <p className="mt-4 text-ink">{project.stack.join(" · ")}</p>
        </section>
      </div>

      <section aria-labelledby="approach-title" className="relative border-y border-line bg-paper-raised">
        <div className="container-page section-y">
          <h2 id="approach-title" className="font-display max-w-[18ch] text-[clamp(3rem,6vw,5.5rem)]">
            How I <span className="italic text-cobalt">approached</span> it
          </h2>
          <ol className="mt-14 grid grid-cols-1 border-t border-line-strong md:grid-cols-2 xl:grid-cols-4">
            {project.caseStudy.approach.map((step, i) => (
              <li
                key={step.title}
                className={`border-b border-line py-8 md:px-6 xl:border-b-0 ${
                  i % 2 === 1 ? "md:border-l" : "md:pl-0"
                } ${i > 0 ? "xl:border-l xl:pl-6" : "xl:pl-0"}`}
              >
                <p className="font-display text-2xl italic text-cobalt" aria-hidden="true">{["i.", "ii.", "iii.", "iv."][i] ?? i + 1}</p>
                <h3 className="font-display mt-4 text-[1.875rem] leading-none">{step.title}</h3>
                <p className="mt-4 leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {gallery.length > 0 ? (
        <section aria-labelledby="gallery-title" className="container-page section-y">
          <h2 id="gallery-title" className="eyebrow text-muted">
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
        <p className="max-w-[70ch] border-l-2 border-cobalt pl-5 text-sm leading-relaxed text-ink-soft">
          {project.caseStudy.note}
        </p>
      </aside>

      <nav aria-label="More projects" className="relative border-t border-line bg-paper">
        <div className="container-page flex flex-col gap-8 py-14 sm:flex-row sm:items-end sm:justify-between">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-cobalt"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All projects
          </Link>
          {next && next.slug !== project.slug ? (
            <Link href={`/projects/${next.slug}`} className="group text-right">
              <span className="eyebrow block text-muted">Next case study</span>
              <span className="font-display mt-3 inline-flex items-center gap-3 text-[clamp(2.5rem,6vw,5rem)] transition-colors group-hover:text-cobalt">
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
      <dt className="eyebrow text-muted">{term}</dt>
      <dd className="mt-2 flex flex-col gap-1 text-ink">{children}</dd>
    </div>
  );
}
