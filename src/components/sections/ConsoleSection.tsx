import { Terminal } from "@/components/sections/Terminal";

export function ConsoleSection() {
  return (
    <section aria-labelledby="console-title" className="section-y border-t border-line">
      <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="label-mono text-subtle">
            <span className="text-accent">&gt;_</span>
            <span className="mx-3 text-line-strong">/</span>
            Console
          </p>
          <h2 id="console-title" className="reveal font-display-regular mt-8 text-[clamp(2rem,4.5vw,3.75rem)]">
            Prefer the <span className="text-subtle">command line?</span>
          </h2>
          <p className="mt-6 max-w-[40ch] leading-relaxed text-muted">
            The same portfolio, one command at a time. Try <code className="font-mono text-fg">help</code>,{" "}
            <code className="font-mono text-fg">projects</code> or <code className="font-mono text-fg">cv</code>.
            Use Tab to complete and the arrow keys for history.
          </p>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <Terminal />
        </div>
      </div>
    </section>
  );
}
