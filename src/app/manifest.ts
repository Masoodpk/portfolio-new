import type { MetadataRoute } from "next";
import { profile } from "@/data/content";
import { seo } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seo.siteName,
    short_name: profile.name,
    description: seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0f2a1d",
    theme_color: "#0f2a1d",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
