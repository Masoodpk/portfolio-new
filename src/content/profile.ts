/**
 * Single source of truth for personal details.
 * Every fact here is taken from the latest CV (MASOOD-CV.pdf, Oct 2026).
 * Update this file — not the components — when details change.
 */

export type SocialLink = {
  label: string;
  href: string;
  handle: string;
};

export const profile = {
  name: "Masood PK",
  shortName: "Masood",
  initials: "MPK",
  title: "Software Developer",
  discipline: "Web Application Engineering",
  location: "Kozhikode, Kerala, India",
  email: "masoodpk555@gmail.com",
  experienceSummary: "2+ years",
  availability: "Open to International Opportunities",
  targetMarkets: ["UAE", "Saudi Arabia", "Qatar", "Oman", "Bahrain"],
  coreStack: ["Vue.js", "Nuxt.js", "React.js", "Next.js", "TypeScript"],

  headline: ["Building Digital Experiences.", "Engineering What Comes Next."],
  intro:
    "I build responsive, scalable and user-focused web applications, transforming ideas into reliable digital experiences.",

  cv: {
    href: "/cv/Masood-PK-Software-Developer-CV.pdf",
    fileName: "Masood-PK-Software-Developer-CV.pdf",
  },

  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/masood-pk-076bb4297",
      handle: "in/masood-pk-076bb4297",
    },
    {
      label: "GitHub",
      href: "https://github.com/masoodpk",
      handle: "@masoodpk",
    },
  ] satisfies SocialLink[],
} as const;

export const about = {
  heading: ["Beyond Writing Code.", "Building Solutions."],
  lead: "I'm a software developer with over two years of hands-on experience building production web applications — currently shipping customer-facing features for Easify, a business communication platform, at IOCOD Infotech.",
  body: [
    "My day-to-day work sits where product, design and engineering meet: turning requirements into responsive dashboards, campaign tools and messaging interfaces, and wiring them to REST APIs so that real businesses can rely on them every day.",
    "I think in components. Building reusable, well-structured UI pieces keeps a growing product consistent, cuts duplicate code and makes the next feature faster to ship. I care about the details that users feel but rarely notice — load times, responsive behaviour, accessibility and interfaces that simply make sense.",
    "I work closely with backend, product and design teams, follow Git workflows and code reviews, and write documentation that helps the next developer. I'm continuously learning — currently going deeper into TypeScript, Next.js and modern frontend architecture.",
  ],
  principles: [
    {
      title: "Component-driven",
      text: "Reusable, maintainable UI building blocks that keep products consistent as they grow.",
    },
    {
      title: "Production-minded",
      text: "Features that integrate cleanly with APIs, survive real usage and ship through reviewed releases.",
    },
    {
      title: "Performance & access",
      text: "Responsive layouts, fast interfaces and accessibility treated as part of the job, not an extra.",
    },
    {
      title: "Team-first",
      text: "Clear communication with backend, product and design, plus documentation that outlives the sprint.",
    },
  ],
} as const;
