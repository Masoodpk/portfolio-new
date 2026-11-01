import { Hero } from "@/components/sections/Hero";
import { QuickFacts } from "@/components/sections/QuickFacts";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { ConsoleSection } from "@/components/sections/ConsoleSection";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickFacts />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <ConsoleSection />
      <Contact />
    </>
  );
}
