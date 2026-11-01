/**
 * Add a new project by appending an object to `projects`.
 * The slug becomes the case-study URL: /projects/<slug>.
 */
export type ProjectLink = {
  label: string;
  href: string;
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
  /** Short labels describing the product's feature areas */
  features: string[];
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
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
