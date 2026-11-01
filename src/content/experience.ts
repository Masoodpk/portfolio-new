export type TimelineKind = "work" | "education" | "certification";

export type TimelineEntry = {
  id: string;
  kind: TimelineKind;
  role: string;
  organization: string;
  location?: string;
  /** City centre, for the distance between stops on the road */
  coordinates?: { lat: number; lon: number };
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
    coordinates: { lat: 11.2588, lon: 75.7804 },
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
    coordinates: { lat: 12.9716, lon: 77.5946 },
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
    coordinates: { lat: 11.0168, lon: 76.9558 },
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
