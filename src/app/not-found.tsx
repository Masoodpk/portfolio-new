import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[86svh] flex-col justify-center pt-[var(--header-h)]">
      <p className="font-display text-xl italic text-muted">This trail leads nowhere.</p>
      <h1 className="font-display mt-4 text-[clamp(4rem,13vw,9rem)] text-mist">Not found</h1>
      <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
        This page doesn&apos;t exist. The portfolio, projects and contact details are all on the home page.
      </p>
      <Link href="/" className="btn btn--solid mt-10 self-start">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to the forest
      </Link>
    </section>
  );
}
