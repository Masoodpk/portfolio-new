import { profile } from "@/content/profile";

/**
 * Absolute site URL used for canonical links, sitemap, Open Graph and JSON-LD.
 * Set SITE_URL once the custom domain is live (e.g. https://masoodpk.dev).
 * On Vercel it falls back to the production deployment URL automatically.
 */
export const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const absoluteUrl = (path = "/") => new URL(path, `${siteUrl}/`).toString();

export const seo = {
  siteName: `${profile.name} — Portfolio`,
  title: `${profile.name} — ${profile.title} | Vue.js, Nuxt.js, React & Next.js`,
  description: `${profile.title} with ${profile.experienceSummary} of experience building production web applications in Vue.js, Nuxt.js, React and Next.js.`,
  keywords: [
    "Masood PK",
    "Software Developer",
    "Frontend Developer",
    "Vue.js Developer",
    "Nuxt.js Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript",
    "Software Developer India",
    "Frontend Developer UAE",
    "Frontend Developer Dubai",
    "Software Developer Saudi Arabia",
    "Web Application Developer",
    "Portfolio",
  ],
  /** Stable, crawlable portrait used by structured data */
  portrait: "/images/masood-pk.jpg",
} as const;
