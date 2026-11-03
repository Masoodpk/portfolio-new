"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** The email address as a mailto link, with a button that copies it. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address is still a link and selectable.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href={`mailto:${email}`} className="link-line font-display break-all text-[clamp(1.5rem,3vw,2.4rem)] text-mist">
        {email}
      </a>
      <button type="button" onClick={copy} className="btn btn--glass min-h-10 px-3.5 text-xs">
        {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
