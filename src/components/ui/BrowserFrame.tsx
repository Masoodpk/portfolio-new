import type { ReactNode } from "react";

/** A soft, window-like frame for project screenshots. */
export function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-paper-raised shadow-[0_24px_50px_-28px_rgb(47_74_58/0.5)] ring-1 ring-line">
      <div className="flex items-center gap-4 border-b border-line bg-paper-deep/70 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-coral/70" />
          <span className="size-2.5 rounded-full bg-butter" />
          <span className="size-2.5 rounded-full bg-sage" />
        </div>
        <p className="flex-1 truncate text-center text-xs text-muted">{url}</p>
        <span className="w-[2.6rem]" aria-hidden="true" />
      </div>
      <div className="bg-paper-raised">{children}</div>
    </div>
  );
}
