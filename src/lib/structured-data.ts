import { profile } from "@/content/profile";
import { timeline } from "@/content/experience";
import { skills } from "@/content/skills";
import type { Project } from "@/content/projects";
import { absoluteUrl, seo, siteUrl } from "@/lib/site";

/**
 * Schema.org JSON-LD built only from verified profile data.
 * No ratings, reviews or endorsements — by design.
 */
const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;

export function personJsonLd() {
  const current = timeline.find((entry) => entry.kind === "work" && entry.end === "present");
  const education = timeline.find((entry) => entry.kind === "education");
  const certification = timeline.find((entry) => entry.kind === "certification");

  return {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    jobTitle: profile.title,
    description: seo.description,
    url: siteUrl,
    image: absoluteUrl(seo.portrait),
    email: `mailto:${profile.email}`,
    sameAs: profile.socials.map((social) => social.href),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kozhikode",
      addressRegion: "Kerala",
      addressCountry: "IN",
    },
    ...(current ? { worksFor: { "@type": "Organization", name: current.organization } } : {}),
    ...(education ? { alumniOf: { "@type": "CollegeOrUniversity", name: education.organization } } : {}),
    ...(certification
      ? {
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            name: certification.role,
            credentialCategory: "certificate",
            recognizedBy: { "@type": "Organization", name: certification.organization },
          },
        }
      : {}),
    knowsAbout: skills.map((skill) => skill.name),
  };
}

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: seo.siteName,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profile`,
        url: siteUrl,
        name: seo.title,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
      },
      personJsonLd(),
    ],
  };
}

export function projectJsonLd(project: Project) {
  const url = absoluteUrl(`/projects/${project.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          // Fragment URLs (/#projects) aren't distinct pages, so the trail is Home → project.
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: project.name, item: url },
        ],
      },
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: `${project.name} — Case Study`,
        url,
        description: project.description,
        keywords: project.stack.join(", "),
        // A contributor, not the sole creator: these are team products.
        contributor: { "@id": personId, "@type": "Person", name: profile.name },
        sourceOrganization: { "@type": "Organization", name: project.context },
        isPartOf: { "@id": websiteId },
        ...(project.links[0] ? { mainEntityOfPage: url, sameAs: project.links[0].href } : {}),
      },
    ],
  };
}

/** Serialises JSON-LD safely for a <script> tag (no "</script>" breakout). */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
