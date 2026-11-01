import { profile } from "@/content/profile";
import { timeline } from "@/content/experience";

/**
 * The 10-second recruiter summary, directly under the hero.
 */
export function QuickFacts() {
  const current = timeline.find((entry) => entry.kind === "work" && entry.end === "present");

  const facts = [
    { term: "Experience", detail: `${profile.experienceSummary} building production web applications` },
    {
      term: "Currently",
      detail: current ? `${current.role} at ${current.organization}` : profile.title,
    },
    { term: "Core stack", detail: profile.coreStack.join(" · ") },
    { term: "Open to", detail: `Roles in ${profile.targetMarkets.join(", ")} and beyond` },
  ];

  return (
    <section aria-label="At a glance" className="border-y border-line bg-ink-raised">
      <dl className="container-page grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact, i) => (
          <div
            key={fact.term}
            className={`flex flex-col gap-2 border-line py-6 sm:px-6 lg:py-8 ${
              i > 0 ? "border-t sm:border-t-0" : ""
            } ${i % 2 === 1 ? "sm:border-l" : ""} ${i >= 2 ? "sm:border-t lg:border-t-0" : ""} ${
              i > 0 ? "lg:border-l" : ""
            } ${i % 2 === 0 ? "sm:pl-0 lg:pl-6" : ""} ${i === 0 ? "lg:pl-0" : ""}`}
          >
            <dt className="label-mono text-subtle">{fact.term}</dt>
            <dd className="text-[0.9375rem] leading-snug text-fg">{fact.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
