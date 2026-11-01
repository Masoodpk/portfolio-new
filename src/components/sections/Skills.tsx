import { SectionHeading } from "@/components/ui/SectionHeading";
import { skillCategories, skills } from "@/content/skills";

/**
 * Server-rendered skills index. Stage 5 layers the interactive
 * ecosystem view on top of this crawlable list.
 */
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="section-y">
      <div className="container-page">
        <SectionHeading index="03" label="Technical Skills" id="skills-title">
          A focused toolkit for <span className="text-subtle">modern web applications.</span>
        </SectionHeading>

        <div className="mb-10 flex flex-wrap gap-6">
          <p className="label-mono flex items-center gap-2 text-muted">
            <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
            Used professionally
          </p>
          <p className="label-mono flex items-center gap-2 text-muted">
            <span aria-hidden="true" className="size-2 rounded-full border border-muted" />
            Studied &amp; personal projects
          </p>
        </div>

        <div className="grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:grid-cols-5">
          {skillCategories.map((category, i) => (
            <div
              key={category.id}
              className={`border-b border-line py-8 sm:px-6 ${i % 2 === 1 ? "sm:border-l" : ""} ${
                i % 2 === 0 ? "sm:pl-0" : ""
              } lg:border-b-0 lg:px-6 ${i > 0 ? "lg:border-l" : "lg:pl-0"}`}
            >
              <h3 className="label-mono text-subtle">{category.label}</h3>
              <ul className="mt-6 space-y-4">
                {skills
                  .filter((skill) => skill.category === category.id)
                  .map((skill) => (
                    <li key={skill.id} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-2 size-2 shrink-0 rounded-full ${
                          skill.usage === "professional" ? "bg-accent" : "border border-muted"
                        }`}
                      />
                      <span>
                        <span className="block text-fg">{skill.name}</span>
                        <span className="sr-only">
                          {skill.usage === "professional" ? "(used professionally)" : "(studied or personal projects)"}
                        </span>
                        <span className="mt-1 block text-sm leading-snug text-subtle">{skill.note}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
