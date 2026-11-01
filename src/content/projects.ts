/**
 * Add a new project by appending an object to `projects`.
 * The slug becomes the case-study URL: /projects/<slug>.
 *
 * Only state what is verifiable from the CV or the live product.
 * Never include confidential architecture, data or metrics.
 */
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
