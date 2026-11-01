import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TagList } from "@/components/ui/Tag";
import { timeline, type TimelineKind } from "@/content/experience";

const kindLabel: Record<TimelineKind, string> = {
  work: "Experience",
  education: "Education",
  certification: "Certification",
};

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y bg-ink-raised">
      <div className="container-page">
        <SectionHeading index="02" label="Career Journey" id="experience-title" aside="2019 → Now">
          Shipping production features, <span className="text-subtle">one release at a time.</span>
        </SectionHeading>

        <div className="relative lg:ml-[calc(100%/12*3)]">
          <span aria-hidden="true" className="timeline-progress absolute left-0 top-0 h-full w-px bg-accent" />
          <ol className="border-l border-line">
            {timeline.map((entry) => {
              const expandable = entry.highlights.length > 0;
              const header = (
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="label-mono text-accent">{kindLabel[entry.kind]}</p>
                    <h3 className="font-display-regular mt-3 text-2xl text-fg md:text-3xl">{entry.role}</h3>
                    <p className="mt-1 text-muted">
                      {entry.organization}
                      {entry.location ? <span className="text-subtle"> · {entry.location}</span> : null}
                    </p>
                  </div>
                  <p className="label-mono text-subtle md:pt-1 md:text-right">{entry.period}</p>
                </div>
              );

              return (
                <li key={entry.id} className="relative pb-12 pl-8 last:pb-0 md:pl-12">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[5px] top-1 size-[9px] rounded-full border ${
                      entry.end === "present" ? "border-accent bg-accent" : "border-line-strong bg-ink"
                    }`}
                  />
                  {expandable ? (
                    <details className="group" open={entry.end === "present"}>
                      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        {header}
                        <span className="label-mono mt-4 inline-flex items-center gap-2 text-subtle transition-colors group-hover:text-fg">
                          <Plus className="size-3.5 transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
                          <span className="group-open:hidden">Responsibilities</span>
                          <span className="hidden group-open:inline">Hide details</span>
                        </span>
                      </summary>
                      <div className="mt-6 max-w-[68ch]">
                        <p className="leading-relaxed text-fg">{entry.summary}</p>
                        <ul className="mt-5 space-y-3">
                          {entry.highlights.map((item) => (
                            <li key={item} className="relative pl-5 text-sm leading-relaxed text-muted">
                              <span aria-hidden="true" className="absolute left-0 top-2.5 h-px w-2.5 bg-accent" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        {entry.stack.length > 0 ? (
                          <div className="mt-6">
                            <TagList items={entry.stack} label={`Technologies used at ${entry.organization}`} />
                          </div>
                        ) : null}
                      </div>
                    </details>
                  ) : (
                    <div>
                      {header}
                      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">{entry.summary}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
