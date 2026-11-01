/**
 * Temporary stand-in while each section is redesigned one at a time.
 * Keeps the anchor, heading and world stage so navigation and the
 * particle journey work end to end during the rebuild.
 */
type Props = {
  id: string;
  stage: number;
  index: string;
  title: string;
  summary: string;
};

export function UpcomingSection({ id, stage, index, title, summary }: Props) {
  return (
    <section
      id={id}
      data-world-stage={stage}
      aria-labelledby={`${id}-title`}
      className="relative flex min-h-[120svh] items-center"
    >
      <div className="container-page">
        <p className="eyebrow text-cobalt">{index}</p>
        <h2 id={`${id}-title`} className="font-display mt-6 max-w-[12ch] text-[clamp(3.5rem,10vw,9rem)]">
          {title}
        </h2>
        <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-ink-soft">{summary}</p>
        <p className="mt-6 inline-flex rounded-full border border-dashed border-line-strong px-4 py-2 text-sm text-muted">
          Being redesigned next
        </p>
      </div>
    </section>
  );
}
