import type { ReactNode } from "react";

type SectionHeadingProps = {
  index: string;
  label: string;
  id: string;
  children: ReactNode;
  aside?: ReactNode;
};

/**
 * Section opener: a hairline rule with an index + label, then a large title.
 * `id` is applied to the <h2> so the section can use aria-labelledby.
 */
export function SectionHeading({ index, label, id, children, aside }: SectionHeadingProps) {
  return (
    <header className="mb-14 md:mb-20">
      <div className="hairline flex items-center justify-between border-t pt-4 text-subtle">
        <p className="label-mono">
          <span className="text-accent">{index}</span>
          <span className="mx-3 text-line-strong">/</span>
          {label}
        </p>
        {aside ? <div className="label-mono hidden sm:block">{aside}</div> : null}
      </div>
      <h2
        id={id}
        className="reveal font-display-regular mt-8 max-w-[20ch] text-[clamp(2.25rem,6vw,5rem)] text-fg"
      >
        {children}
      </h2>
    </header>
  );
}
