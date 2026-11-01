import { Hero } from "@/components/sections/Hero";
import { UpcomingSection } from "@/components/sections/UpcomingSection";
import { JourneyRail } from "@/components/world/JourneyRail";
import { JsonLd } from "@/components/seo/JsonLd";
import { about } from "@/content/profile";
import { homeJsonLd } from "@/lib/structured-data";

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <JourneyRail />
      <Hero />
      {/* Sections below are rebuilt one at a time in the new design. */}
      <UpcomingSection id="about" stage={1} index="01 — About" title={about.heading.join(" ")} summary={about.lead} />
      <UpcomingSection
        id="experience"
        stage={2}
        index="02 — Career"
        title="The road so far"
        summary="Software Developer at IOCOD Infotech since January 2025, after a web development traineeship at Skepper Creative Agency."
      />
      <UpcomingSection
        id="skills"
        stage={3}
        index="03 — Toolkit"
        title="Tools of the trade"
        summary="Vue.js, Nuxt.js, React.js, Next.js, TypeScript and the craft around them."
      />
      <UpcomingSection
        id="projects"
        stage={4}
        index="04 — Work"
        title="Things I've helped build"
        summary="Easify, a production business communication platform, and the Brew Your Brand website."
      />
      <UpcomingSection
        id="contact"
        stage={5}
        index="05 — The world"
        title="From Kerala to the world"
        summary="Open to frontend and software developer roles in the UAE, Saudi Arabia, Qatar, Oman, Bahrain and beyond."
      />
    </>
  );
}
