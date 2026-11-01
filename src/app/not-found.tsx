import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[80svh] flex-col justify-center pt-[var(--header-h)]">
      <p className="label-mono text-accent">404</p>
      <h1 className="font-display-wide mt-6 text-[clamp(3rem,12vw,9rem)] uppercase">Not found</h1>
      <p className="mt-6 max-w-[44ch] text-lg text-muted">
        This page doesn&apos;t exist. The portfolio, projects and contact details are all on the home page.
      </p>
      <Link
        href="/"
        className="label-mono mt-10 inline-flex items-center gap-2 text-fg transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>
    </section>
  );
}
