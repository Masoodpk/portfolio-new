"use client";

import { useEffect, useState } from "react";
import { skillCategories, skills, type SkillCategory, type SkillUsage } from "@/content/skills";
import { WORLD_FOCUS_EVENT } from "@/components/world/stages";

const NUMERALS = ["i.", "ii.", "iii.", "iv.", "v."];

const usageLabel: Record<SkillUsage, string> = {
  professional: "Used at work",
  learning: "Studied & personal projects",
};

/** Spotlights the matching particle cluster (clusters follow category order). */
function spotlight(category: SkillCategory | null) {
  const index = category ? skillCategories.findIndex((c) => c.id === category) : null;
  window.dispatchEvent(new CustomEvent(WORLD_FOCUS_EVENT, { detail: index }));
}

function UsageDot({ usage }: { usage: SkillUsage }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-[0.45em] size-2 shrink-0 rounded-full border border-cobalt ${usage === "professional" ? "bg-cobalt" : ""}`}
    />
  );
}

export function Skills() {
  const [active, setActive] = useState<SkillCategory | null>(null);

  useEffect(() => {
    spotlight(active);
    return () => spotlight(null);
  }, [active]);

  return (
    <section id="skills" data-world-stage="3" aria-labelledby="skills-title" className="section-y relative">
      <div className="container-page">
        <div className="eyebrow flex items-center gap-4 text-ink">
          <span className="text-cobalt">03</span>
          <span>Toolkit</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <div className="mt-12 lg:w-7/12">
          <h2 id="skills-title" className="font-display text-[clamp(3.5rem,7vw,7.5rem)]">
            Tools of the <span className="text-gradient italic">trade</span>
          </h2>
          <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            What I use day to day at work, and what I&apos;m exploring alongside it. No percentages — just where each
            skill has actually been used.
          </p>

          <div className="mt-10 flex flex-col gap-6 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Highlight a category" className="flex flex-wrap gap-2">
              <FilterButton pressed={active === null} onClick={() => setActive(null)}>
                All
              </FilterButton>
              {skillCategories.map((category) => (
                <FilterButton
                  key={category.id}
                  pressed={active === category.id}
                  onClick={() => setActive(active === category.id ? null : category.id)}
                >
                  {category.label}
                </FilterButton>
              ))}
            </div>
            <ul aria-label="Legend" className="flex shrink-0 flex-col gap-1.5 text-xs text-muted">
              {(["professional", "learning"] as const).map((usage) => (
                <li key={usage} className="flex gap-2">
                  <UsageDot usage={usage} />
                  {usageLabel[usage]}
                </li>
              ))}
            </ul>
          </div>

          <ol className="mt-4 grid grid-cols-1 gap-x-8 md:grid-cols-2">
            {skillCategories.map((category, i) => {
              const selected = active === category.id;
              return (
                <li
                  key={category.id}
                  onPointerEnter={(event) => event.pointerType === "mouse" && spotlight(category.id)}
                  onPointerLeave={(event) => event.pointerType === "mouse" && spotlight(active)}
                  className={`-mx-4 rounded-2xl px-4 py-7 transition-colors duration-500 ${
                    selected ? "bg-cobalt-soft" : ""
                  }`}
                >
                  <h3 className="flex items-baseline gap-3">
                    <span className="font-display text-xl italic text-cobalt" aria-hidden="true">
                      {NUMERALS[i]}
                    </span>
                    <span className="font-display text-[2rem] leading-none">{category.label}</span>
                  </h3>
                  <ul className="mt-5 space-y-4">
                    {skills
                      .filter((skill) => skill.category === category.id)
                      .map((skill) => (
                        <li key={skill.id} className="flex gap-3">
                          <UsageDot usage={skill.usage} />
                          <div>
                            <p className="font-semibold text-ink">
                              {skill.name}
                              <span className="sr-only">, {usageLabel[skill.usage]}</span>
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{skill.note}</p>
                          </div>
                        </li>
                      ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

function FilterButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
        pressed ? "border-ink bg-ink text-paper" : "border-line-strong text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
