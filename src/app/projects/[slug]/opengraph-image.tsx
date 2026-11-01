import { getProject, projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { ogSize, renderOgCard } from "@/lib/og";

export const alt = "Case study";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug) ?? projects[0];
  return renderOgCard({
    eyebrow: `Case study ${project.index} · ${project.context}`,
    title: project.name,
    subtitle: project.tagline,
    footer: `${profile.name} · ${project.stack.join(" · ")}`,
  });
}
