import Image from "next/image";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { about, profile, projects, skillCategories, skills, timeline } from "@/data/content";
import portrait from "@/assets/masood-pk.png";
import { JsonLd } from "@/components/seo/JsonLd";
import { homeJsonLd } from "@/lib/structured-data";
import { ChapterPanel } from "@/components/ui/ChapterPanel";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { ContactForm } from "@/components/sections/ContactForm";

/**
 * The journey. Each ChapterPanel is a stretch of scroll the camera flies
 * through; its `length` (in screen heights) sets how long that leg of the
 * flight takes. The camera's shots for each chapter are in src/lib/cameraPath.ts.
 */
/** Visually hidden, still read by search engines and screen readers. */
const HIDDEN = { position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap" } as const;

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />

      {/* 1 · The misty Ghats: the name itself is the 3D title in the scene (Name3D) */}
      <ChapterPanel id="home" length={2.6} align="center" labelledBy="hero-title" className="items-end! pb-[9vh]">
        <div className="on-scene mx-auto max-w-4xl text-center text-mist">
          {/* Hidden inline (not only by CSS), so the 3D title is never doubled; shown by CSS if WebGL is off. */}
          <h1 id="hero-title" className="hero-name font-display text-[clamp(3.75rem,12vw,10rem)]" style={HIDDEN}>
            {profile.name}
          </h1>
          <p className="eyebrow text-mist/90">
            {profile.title} <span aria-hidden="true">·</span> {profile.location.split(",").slice(0, 2).join(",")}
          </p>
          <p className="nudge eyebrow mt-5 inline-flex items-center gap-2 text-mist/85">
            Scroll to start <ArrowDown className="size-3.5" aria-hidden="true" />
          </p>
        </div>
      </ChapterPanel>

      {/* 2 · The flight (a transition: the camera flies over the name and follows the river into the gorge) */}
      <ChapterPanel id="flight" length={2.2} align="center">
        <p className="on-scene eyebrow text-center text-mist/80">Following the river north</p>
      </ChapterPanel>

      {/* 3 · Under the canopy: a sheet of painted paper in the clearing */}
      <ChapterPanel id="about" length={3} align="right" pin="large" labelledBy="about-title">
        <article className="paper max-w-xl p-7 sm:p-9 lg:ml-auto">
          <div className="flex items-center gap-4">
            <Image
              src={portrait}
              alt={`Portrait of ${profile.name}`}
              placeholder="blur"
              sizes="5rem"
              className="size-20 rounded-full object-cover object-top ring-2 ring-[#22301f]/15"
            />
            <div>
              <p className="eyebrow text-accent">Under the canopy</p>
              <h2 id="about-title" data-reveal className="font-display mt-2 text-4xl">
                About me
              </h2>
            </div>
          </div>
          <p data-reveal className="mt-6 text-lg leading-relaxed text-ink">
            {about.lead}
          </p>
          <p data-reveal className="mt-4 leading-relaxed text-ink-soft">
            {about.body[1]}
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted">
            <MapPin className="size-4" aria-hidden="true" />
            {profile.location}
          </p>
        </article>
      </ChapterPanel>

      {/* 4 · The ancient tree */}
      <ChapterPanel id="skills" length={3.4} pin="large" labelledBy="skills-title">
        <article className="glass max-w-xl rounded-[2rem] p-6 sm:p-7">
          <p className="eyebrow text-gold">The ancient tree</p>
          <h2 id="skills-title" data-reveal className="font-display mt-2 text-4xl">
            What I work with
          </h2>
          <dl className="mt-6 space-y-4">
            {skillCategories.map((category) => (
              <div key={category.id} className="grid gap-2 sm:grid-cols-[9rem_1fr]">
                <dt className="text-sm text-muted">{category.label}</dt>
                <dd className="flex flex-wrap gap-2">
                  {skills
                    .filter((skill) => skill.category === category.id)
                    .map((skill) => (
                      <span
                        key={skill.id}
                        className={`rounded-full px-3 py-1 text-sm ${
                          skill.usage === "professional" ? "bg-leaf/20 text-mist" : "border border-mist/25 text-ink-soft"
                        }`}
                      >
                        {skill.name}
                        <span className="sr-only">, {skill.usage === "professional" ? "used at work" : "studied & personal projects"}</span>
                      </span>
                    ))}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-muted">Filled: used at work. Outlined: studied and personal projects.</p>
        </article>
      </ChapterPanel>

      {/* 5 · The river */}
      <ChapterPanel id="projects" length={3.4} pin="large" labelledBy="projects-title">
        <p className="on-scene eyebrow text-gold">The river</p>
        <h2 id="projects-title" data-reveal className="on-scene font-display mt-2 text-[clamp(2.5rem,5vw,4rem)]">
          Selected work
        </h2>
        {/* The pictures hang on the canvases by the river (ProjectCanvases); the cards carry the words. */}
        <ul className="mt-8 grid max-w-md gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </ul>
      </ChapterPanel>

      {/* 6 · The waterfall */}
      <ChapterPanel id="experience" length={3} align="right" pin="large" labelledBy="experience-title">
        <article className="glass max-w-sm rounded-[2rem] p-7 sm:p-8 lg:ml-auto">
          <p className="eyebrow text-gold">The waterfall</p>
          <h2 id="experience-title" data-reveal className="font-display mt-2 text-4xl">
            The journey so far
          </h2>
          <ol className="mt-6 space-y-5 border-l border-mist/20 pl-5">
            {timeline.map((entry) => (
              <li key={entry.id} className="relative">
                <span aria-hidden="true" className={`absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full ${entry.end === "present" ? "bg-gold" : "bg-leaf"}`} />
                <p className="text-xs text-muted">{entry.period}</p>
                <h3 className="font-display mt-1 text-xl">{entry.role}</h3>
                <p className="text-sm text-ink-soft">
                  {entry.organization}
                  {entry.location ? ` · ${entry.location}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </article>
      </ChapterPanel>

      {/* 7 · Night in the forest */}
      <ChapterPanel id="contact" length={2.8} pin="large" stay labelledBy="contact-title">
        <div className="glass glass--night grid gap-10 rounded-[2rem] p-7 sm:p-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-gold">Night in the forest</p>
            <h2 id="contact-title" data-reveal className="font-display mt-2 text-[clamp(2.5rem,5vw,4rem)]">
              Let&apos;s build something together.
            </h2>
            <p className="mt-5 max-w-[42ch] leading-relaxed text-ink-soft">
              Tell me about the role, the team or the challenge you have in mind. I&apos;ll reply by email.
            </p>
            <div className="mt-8">
              <CopyEmail email={profile.email} />
            </div>
            <ul className="mt-6 flex gap-5 text-sm" aria-label="Elsewhere">
              {profile.socials.map((social) => (
                <li key={social.label}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className="link-line inline-flex items-center gap-1">
                    {social.label}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-10 text-xs text-muted">© 2026 {profile.name} · Kozhikode, Kerala</p>
          </div>
          <ContactForm />
        </div>
      </ChapterPanel>
    </>
  );
}
