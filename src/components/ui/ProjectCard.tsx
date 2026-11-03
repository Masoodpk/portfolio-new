"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/content";
import { setProjectHover } from "@/lib/scenes";

/**
 * A project as a framed canvas on the page. Hovering or focusing it tilts
 * its twin canvas by the river in the 3D world and ripples the water.
 */
export function ProjectCard({ project }: { project: Project }) {
  const on = () => setProjectHover(project.slug);
  const off = () => setProjectHover(null);

  return (
    <li
      onPointerEnter={on}
      onPointerLeave={off}
      onFocus={on}
      onBlur={off}
      className="framed group transition-transform duration-700 ease-[var(--ease-film)] hover:-rotate-[0.6deg] hover:-translate-y-1 focus-within:-translate-y-1"
    >
      <p className="eyebrow text-muted">
        {project.context} · {project.year}
      </p>
      <h3 className="font-display mt-2 text-3xl">{project.name}</h3>
      <p className="mt-1 text-ink-soft">{project.tagline}</p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
        {project.stack.map((tech) => (
          <li key={tech} className="rounded-full border border-[#22301f]/20 px-2.5 py-0.5 text-xs">
            {tech}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Link href={`/projects/${project.slug}`} className="btn bg-[#22301f] text-[#f3efe4] hover:bg-[#2f5a3c]">
          Read case study<span className="sr-only">: {project.name}</span>
        </Link>
        {project.links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="link-line inline-flex items-center gap-1 text-sm">
            Live
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only">: {link.label} (opens in a new tab)</span>
          </a>
        ))}
      </div>
    </li>
  );
}
