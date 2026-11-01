import type { ReactNode } from "react";

/** Minimal browser chrome used to present project screenshots. */
export function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper-raised shadow-[0_40px_80px_-40px_var(--shadow)]">
      <div className="flex items-center gap-4 border-b border-line px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </div>
        <p className="flex-1 truncate text-center text-xs text-muted">
          {url}
        </p>
        <span className="w-[2.625rem]" aria-hidden="true" />
      </div>
      <div className="bg-paper-raised">{children}</div>
    </div>
  );
}
