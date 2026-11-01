import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
