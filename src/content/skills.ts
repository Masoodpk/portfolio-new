/**
 * "professional" = used in paid work at IOCOD Infotech or Skepper (per CV).
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
