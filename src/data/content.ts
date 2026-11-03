/**
 * Everything the site says lives in this file: name, bio, skills, projects,
 * career, links and the journey's chapters. Edit here, not in the components.
 *
 * Every fact is taken from the latest CV (MASOOD-CV.pdf, Oct 2026).
 */

// ─── Profile ──────────────────────────────────────────────────────────────

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
  coreStack: ["Vue.js", "Nuxt.js", "React.js", "Next.js", "TypeScript"],

  headline: ["Building Digital Experiences.", "Engineering What Comes Next."],
  /** The hero's one line under the name */
  tagline: "Code, grown in the wild.",
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

// ─── The journey: one chapter per stop of the camera ─────────────────────

export type ChapterId = "home" | "flight" | "about" | "skills" | "projects" | "experience" | "contact";

export type Chapter = {
  id: ChapterId;
  /** Short label for the nav and the progress rail */
  label: string;
  /** The place in the forest the camera reaches */
  place: string;
  /** Shown in the top nav (the flight is a transition, not a destination) */
  nav: boolean;
};

/** Same order as on the page and along the camera path (src/lib/cameraPath.ts). */
export const chapters: Chapter[] = [
  { id: "home", label: "Home", place: "Above the canopy", nav: false },
  { id: "flight", label: "Flight", place: "The flight", nav: false },
  { id: "about", label: "About", place: "Under the canopy", nav: true },
  { id: "skills", label: "Skills", place: "The ancient tree", nav: true },
  { id: "projects", label: "Projects", place: "The river", nav: true },
  { id: "experience", label: "Journey", place: "The waterfall", nav: true },
  { id: "contact", label: "Contact", place: "Night in the forest", nav: true },
];

// ─── Career ───────────────────────────────────────────────────────────────

export type TimelineKind = "work" | "education" | "certification";

export type TimelineEntry = {
  id: string;
  kind: TimelineKind;
  role: string;
  organization: string;
  location?: string;
  /** Human-readable period exactly as it should appear */
  period: string;
  /** ISO month for machine-readable <time> and structured data */
  start?: string;
  end?: string | "present";
  summary: string;
  highlights: string[];
  stack: string[];
};

export const timeline: TimelineEntry[] = [
  {
    id: "iocod",
    kind: "work",
    role: "Software Developer",
    organization: "IOCOD Infotech",
    location: "Kozhikode, Kerala",
    period: "Jan 2025 — Present",
    start: "2025-01",
    end: "present",
    summary:
      "Building customer-facing features for Easify, a production business communication platform used by real businesses for messaging, campaigns and contact management.",
    highlights: [
      "Develop and maintain customer-facing features across messaging, campaigns and contact management.",
      "Build responsive, reusable dashboard and messaging UI components with Vue.js and Nuxt.js, reducing duplicate code across the product.",
      "Work on campaign management, messaging and inbox interfaces.",
      "Integrate frontend features with REST APIs in collaboration with backend, product and design teams.",
      "Drive UI bug fixes and performance improvements as part of regular product releases.",
      "Follow Git workflows, take part in code reviews and author documentation for team onboarding.",
    ],
    stack: ["Vue.js", "Nuxt.js", "JavaScript", "REST APIs", "Git"],
  },
  {
    id: "skepper",
    kind: "work",
    role: "Web Developer Trainee",
    organization: "Skepper Creative Agency",
    location: "Bangalore",
    period: "Sep 2024 — Dec 2024",
    start: "2024-09",
    end: "2024-12",
    summary:
      "Delivered web application interfaces and marketing pages as part of a small agency development team.",
    highlights: [
      "Built a dynamic web application with React.js, implementing responsive layouts and interactive components.",
      "Developed landing pages with HTML5 and CSS3, focusing on performance and cross-browser compatibility.",
      "Integrated frontend functionality with backend services to deliver complete website features.",
      "Improved code quality through peer reviews, documentation and accessibility considerations.",
    ],
    stack: ["React.js", "HTML5", "CSS3", "JavaScript"],
  },
  {
    id: "btech",
    kind: "education",
    role: "B.Tech, Computer Science",
    organization: "Dhaanish Ahmed Institute of Technology",
    location: "Coimbatore",
    // VERIFY: latest CV says "Jan 2023 – Dec 2023"; the 10 Oct 2026 CV says "Aug 2019 – Jun 2023".
    period: "2019 — 2023",
    start: "2019-08",
    end: "2023-06",
    summary: "Bachelor of Technology in Computer Science.",
    highlights: [],
    stack: [],
  },
  {
    id: "mern",
    kind: "certification",
    role: "MERN Stack Certification",
    organization: "Synnefo Solutions",
    period: "Certification",
    summary: "MongoDB, Express, React and Node.js full-stack development programme.",
    highlights: [],
    stack: ["MongoDB", "Express", "React", "Node.js"],
  },
];

// ─── Skills ───────────────────────────────────────────────────────────────

/**
 * Skills. "professional" = used in paid work at IOCOD Infotech or Skepper (per CV).
 * "learning"     = studied, certified or used in personal projects.
 * VERIFY the "learning" items — move any you have used at work to "professional".
 */
export type SkillUsage = "professional" | "learning";

export type SkillCategory = "frontend" | "languages" | "styling" | "apis" | "tools";

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  usage: SkillUsage;
  /** One sentence on how the skill is actually used */
  note: string;
  /** ids of related skills, used to draw connections */
  related: string[];
};

export const skillCategories: { id: SkillCategory; label: string }[] = [
  { id: "frontend", label: "Frontend" },
  { id: "languages", label: "Languages" },
  { id: "styling", label: "Styling" },
  { id: "apis", label: "APIs" },
  { id: "tools", label: "Tools & Practice" },
];

export const skills: Skill[] = [
  {
    id: "vue",
    name: "Vue.js",
    category: "frontend",
    usage: "professional",
    note: "Primary framework for Easify's dashboard, campaign and messaging interfaces.",
    related: ["nuxt", "javascript", "rest"],
  },
  {
    id: "nuxt",
    name: "Nuxt.js",
    category: "frontend",
    usage: "professional",
    note: "Application framework behind Easify's customer-facing product.",
    related: ["vue", "rest"],
  },
  {
    id: "react",
    name: "React.js",
    category: "frontend",
    usage: "professional",
    note: "Built a dynamic web application and the Brew Your Brand website at Skepper.",
    related: ["next", "javascript", "css"],
  },
  {
    id: "next",
    name: "Next.js",
    category: "frontend",
    usage: "learning",
    note: "React framework with server rendering — this portfolio is built with it.",
    related: ["react", "typescript", "tailwind"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "languages",
    usage: "professional",
    note: "The everyday language across both roles.",
    related: ["typescript", "vue", "react"],
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "languages",
    usage: "professional",
    note: "Adding type safety to frontend features and components.",
    related: ["javascript", "next"],
  },
  {
    id: "html",
    name: "HTML5",
    category: "languages",
    usage: "professional",
    note: "Semantic, accessible markup for landing pages and applications.",
    related: ["css"],
  },
  {
    id: "css",
    name: "CSS3",
    category: "languages",
    usage: "professional",
    note: "Responsive layouts and cross-browser styling for production pages.",
    related: ["html", "tailwind", "bootstrap"],
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "styling",
    usage: "learning",
    note: "Utility-first styling with design tokens — used to build this portfolio.",
    related: ["css", "next"],
  },
  {
    id: "bootstrap",
    name: "Bootstrap",
    category: "styling",
    usage: "learning",
    note: "Component framework for fast, responsive layouts.",
    related: ["css"],
  },
  {
    id: "rest",
    name: "REST APIs",
    category: "apis",
    usage: "professional",
    note: "Connecting Easify's frontend features to backend services with the backend team.",
    related: ["vue", "nuxt", "graphql"],
  },
  {
    id: "graphql",
    name: "GraphQL",
    category: "apis",
    usage: "learning",
    note: "Query-based API integration, studied alongside REST.",
    related: ["rest", "typescript"],
  },
  {
    id: "git",
    name: "Git & GitHub",
    category: "tools",
    usage: "professional",
    note: "Branching workflows, pull requests and release collaboration.",
    related: ["reviews"],
  },
  {
    id: "reviews",
    name: "Code Reviews",
    category: "tools",
    usage: "professional",
    note: "Reviewing and receiving reviews as part of every release.",
    related: ["git", "docs"],
  },
  {
    id: "docs",
    name: "Documentation",
    category: "tools",
    usage: "professional",
    note: "Writing docs that support team knowledge sharing and onboarding.",
    related: ["reviews"],
  },
];

// ─── Projects ─────────────────────────────────────────────────────────────

export type ProjectLink = {
  label: string;
  href: string;
};

export type SchematicKind = "dashboard" | "campaigns" | "inbox";

export type ProjectVisual =
  | {
      kind: "image";
      device: "desktop" | "mobile" | "long";
      src: string;
      width: number;
      height: number;
      alt: string;
      caption?: string;
    }
  | {
      kind: "schematic";
      schematic: SchematicKind;
      title: string;
      caption: string;
    };

export type Project = {
  slug: string;
  index: string;
  name: string;
  context: string;
  year: string;
  /** One line for cards */
  tagline: string;
  description: string;
  stack: string[];
  role: string;
  contributions: string[];
  links: ProjectLink[];
  features: string[];
  caseStudy: {
    product: string;
    myRole: string;
    approach: { title: string; text: string }[];
    /** Shown at the end of the case study, e.g. confidentiality or screenshot provenance */
    note: string;
  };
  /** First visual is the cover used on cards and the case-study hero */
  visuals: ProjectVisual[];
};

export const projects: Project[] = [
  {
    slug: "easify",
    index: "01",
    name: "Easify",
    context: "IOCOD Infotech",
    year: "2025 — Present",
    tagline: "Production business communication platform",
    description:
      "A business communication platform supporting bulk SMS, calling, ringless voicemail, email outreach and contact management. I contribute customer-facing features as part of the product team.",
    stack: ["Vue.js", "Nuxt.js", "JavaScript", "REST APIs"],
    role: "Software Developer — frontend features within a cross-functional product team",
    contributions: [
      "Developed responsive dashboard interfaces.",
      "Built reusable UI components that reduced duplicate code.",
      "Worked on campaign management, messaging and inbox interfaces.",
      "Integrated frontend features with REST APIs.",
      "Contributed to usability improvements, bug fixes and performance work in regular releases.",
    ],
    links: [{ label: "easify.app", href: "https://easify.app/" }],
    features: ["Bulk SMS", "Calling", "Ringless voicemail", "Email outreach", "Contact management"],
    caseStudy: {
      product:
        "Easify helps businesses reach and manage their contacts across several channels — bulk SMS, calling, ringless voicemail and email — from one web application. It is used in production by real businesses, so every release has to keep their day-to-day workflows running.",
      myRole:
        "Since January 2025 I have worked on Easify's customer-facing web application at IOCOD Infotech, building and maintaining features with Vue.js and Nuxt.js alongside backend, product and design colleagues. My work covers dashboards, campaign management, messaging and the inbox.",
      approach: [
        {
          title: "Components before pages",
          text: "Dashboard and messaging screens share a lot of patterns. Building them from reusable, responsive components improved maintainability and reduced duplicate code across the product.",
        },
        {
          title: "Built against real APIs",
          text: "Features are integrated with REST APIs in close collaboration with the backend, product and design teams, so data flows stay reliable and interactions stay smooth.",
        },
        {
          title: "Shipped in steady releases",
          text: "UI bug fixes and performance work go out as part of regular releases, improving load times and the everyday user experience without disrupting production.",
        },
        {
          title: "Reviewed and documented",
          text: "Git workflows, code reviews and written documentation keep the codebase consistent and make onboarding easier for the next developer.",
        },
      ],
      note: "Easify is a commercial product owned by IOCOD Infotech. Internal architecture, customer data and metrics are confidential, so the interface previews on this page are simplified schematics I drew to illustrate the feature areas I work on — not screenshots of the production UI.",
    },
    visuals: [
      {
        kind: "schematic",
        schematic: "dashboard",
        title: "Dashboard",
        caption: "Responsive dashboard layout built from reusable components.",
      },
      {
        kind: "schematic",
        schematic: "campaigns",
        title: "Campaign management",
        caption: "Campaign list and set-up flow across SMS, voicemail and email.",
      },
      {
        kind: "schematic",
        schematic: "inbox",
        title: "Messaging inbox",
        caption: "Two-pane inbox for conversations and replies.",
      },
    ],
  },
  {
    slug: "brew-your-brand",
    index: "02",
    name: "Brew Your Brand",
    context: "Skepper Creative Agency",
    year: "2024",
    tagline: "Live marketing website",
    description:
      "A marketing website featuring responsive layouts and interactive components, built with React.js, HTML and CSS.",
    stack: ["React.js", "HTML5", "CSS3"],
    role: "Web Developer Trainee — frontend components and responsive sections",
    contributions: [
      "Developed frontend components.",
      "Created responsive website sections.",
      "Improved visual consistency across pages.",
      "Worked on cross-browser compatibility, accessibility and usability.",
    ],
    links: [{ label: "brewyourbrand.in", href: "https://brewyourbrand.in/" }],
    features: ["Responsive layouts", "Interactive components", "Cross-browser support"],
    caseStudy: {
      product:
        "Brew Your Brand is the marketing website for a brand-building business, presenting its workshops, video series and brand assessment tools to prospective customers on desktop and mobile.",
      myRole:
        "As a Web Developer Trainee at Skepper Creative Agency (September–December 2024) I worked on the site's frontend in a small team, building React.js components and responsive sections with HTML and CSS.",
      approach: [
        {
          title: "Responsive from the start",
          text: "Sections were built to adapt cleanly from large desktop screens down to phones, keeping long marketing pages easy to read.",
        },
        {
          title: "Interactive, reusable components",
          text: "Frontend components were built with React.js so repeated patterns behave and look the same across pages.",
        },
        {
          title: "Consistent and compatible",
          text: "Improved visual consistency and tested across browsers to keep the experience reliable for every visitor.",
        },
        {
          title: "Accessible and reviewed",
          text: "Applied accessibility considerations and peer reviews to keep the code clear and the site usable.",
        },
      ],
      note: "Screenshots were captured from the live website in November 2026. The site may have been updated by others since my involvement ended in December 2024.",
    },
    visuals: [
      {
        kind: "image",
        device: "desktop",
        src: "/images/projects/brew-your-brand/desktop.webp",
        width: 2160,
        height: 1350,
        alt: "Brew Your Brand homepage on desktop: navigation, headline about building a brand properly and calls to action.",
      },
      {
        kind: "image",
        device: "mobile",
        src: "/images/projects/brew-your-brand/mobile.webp",
        width: 1170,
        height: 1992,
        alt: "Brew Your Brand homepage on a phone with the responsive headline and stacked buttons.",
        caption: "Responsive layout on mobile.",
      },
      {
        kind: "image",
        device: "long",
        src: "/images/projects/brew-your-brand/desktop-long.webp",
        width: 1440,
        height: 5200,
        alt: "Long scroll of the Brew Your Brand homepage showing its marketing sections.",
        caption: "Scroll through the long-form homepage.",
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getAdjacentProject(slug: string) {
  const i = projects.findIndex((project) => project.slug === slug);
  return projects[(i + 1) % projects.length];
}
