import { ArrowRight } from "lucide-react";
import { profile } from "@/content/profile";
import { timeline, type TimelineEntry, type TimelineKind } from "@/content/experience";

const kindLabel: Record<TimelineKind, string> = {
  work: "Experience",
  education: "Education",
  certification: "Certification",
};

const coordinate = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(2)}°${value >= 0 ? positive : negative}`;

/** Straight-line distance in km between two stops, rounded to the nearest 10. */
function distanceKm(a: NonNullable<TimelineEntry["coordinates"]>, b: NonNullable<TimelineEntry["coordinates"]>) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round((2 * 6371 * Math.asin(Math.sqrt(h))) / 10) * 10;
}

function Stop({ entry }: { entry: TimelineEntry }) {
  const current = entry.end === "present";
  const place = entry.location?.split(",")[0];

  return (
    <article
      className={`road-stop shrink-0 border-t border-line-strong pt-6 ${current ? "lg:w-[min(56rem,80vw)]" : "lg:w-[min(30rem,70vw)]"}`}
    >
      <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={current ? "text-cobalt" : "text-ink"}>{current ? "Now" : kindLabel[entry.kind]}</span>
        {entry.period !== kindLabel[entry.kind] ? <span className="text-muted">{entry.period}</span> : null}
      </p>

      <p className="font-display mt-5 text-[clamp(3.25rem,5.5vw,5.5rem)]">
        {place ?? <span className="italic">{entry.organization}</span>}
      </p>
      {entry.coordinates ? (
        <p className="mt-2 text-sm tabular-nums text-muted">
          {coordinate(entry.coordinates.lat, "N", "S")} {coordinate(entry.coordinates.lon, "E", "W")}
        </p>
      ) : null}

      <h3 className="font-display mt-7 text-[2rem] leading-none">{entry.role}</h3>
      {place ? <p className="mt-2 font-semibold text-ink">{entry.organization}</p> : null}
      <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-soft">{entry.summary}</p>

      {entry.highlights.length > 0 ? (
        <ul className={`mt-6 grid gap-x-8 gap-y-3 ${current ? "md:grid-cols-2" : ""}`}>
          {entry.highlights.map((item) => (
            <li key={item} className="relative pl-5 text-sm leading-relaxed text-ink-soft">
              <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-px w-2.5 bg-cobalt" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {entry.stack.length > 0 ? (
        <p className="mt-6 text-sm text-muted">
          <span className="sr-only">Technologies: </span>
          {entry.stack.join(" · ")}
        </p>
      ) : null}
    </article>
  );
}

export function Experience() {
  return (
    <section
      id="experience"
      data-world-stage="2"
      data-world-hold="0.89"
      aria-labelledby="experience-title"
      className="road section-y relative"
    >
      <div className="road-pin">
        <div className="road-track container-page flex flex-col gap-16">
          <header className="road-intro shrink-0 lg:w-[min(38rem,80vw)]">
            <div className="eyebrow flex items-center gap-4 text-ink">
              <span className="text-cobalt">02</span>
              <span>Career</span>
              <span className="h-px flex-1 bg-line" aria-hidden="true" />
            </div>
            <h2 id="experience-title" className="font-display mt-10 text-[clamp(3.5rem,7vw,7.5rem)]">
              The road <span className="italic text-cobalt">so far</span>
            </h2>
            <p className="mt-8 max-w-[40ch] text-lg leading-relaxed text-ink-soft">
              From a B.Tech in Coimbatore to a traineeship in Bangalore and production work in Kozhikode — over two
              years of shipping web applications along the way.
            </p>
            <p className="road-hint mt-10 hidden items-center gap-3 text-sm font-semibold text-ink" aria-hidden="true">
              Keep scrolling to travel
              <ArrowRight className="size-4 text-cobalt" />
            </p>
          </header>

          {timeline.map((entry, i) => {
            const next = timeline[i + 1];
            const km = entry.coordinates && next?.coordinates ? distanceKm(entry.coordinates, next.coordinates) : null;
            return (
              <div key={entry.id} className="contents">
                <Stop entry={entry} />
                {km ? (
                  <p className="road-gap flex shrink-0 items-center gap-3 text-sm text-muted">
                    <span aria-hidden="true" className="w-12 border-t border-dashed border-line-strong" />
                    <span className="tabular-nums">
                      ≈ {km} km <span className="sr-only">between {entry.location?.split(",")[0]} and {next.location?.split(",")[0]}</span>
                    </span>
                    <span aria-hidden="true" className="w-12 border-t border-dashed border-line-strong" />
                  </p>
                ) : null}
              </div>
            );
          })}

          <div className="road-end shrink-0 border-t border-line-strong pt-6 lg:w-[min(26rem,70vw)]">
            <p className="eyebrow text-cobalt">Next</p>
            <p className="font-display mt-5 text-[clamp(3.25rem,5.5vw,5.5rem)] italic">The road continues.</p>
            <p className="mt-6 max-w-[38ch] leading-relaxed text-ink-soft">
              {profile.availability} — especially the {profile.targetMarkets.slice(0, -1).join(", ")} and{" "}
              {profile.targetMarkets.at(-1)}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
