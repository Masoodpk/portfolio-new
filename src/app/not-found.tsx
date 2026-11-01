import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-page relative flex min-h-[80svh] flex-col justify-center pt-[var(--header-h)]">
      <p className="eyebrow text-cobalt">404</p>
      <h1 className="font-display mt-6 text-[clamp(4rem,14vw,11rem)]">
        Not <span className="italic text-cobalt">found</span>
      </h1>
      <p className="mt-6 max-w-[44ch] text-lg text-ink-soft">
        This page doesn&apos;t exist. The portfolio, projects and contact details are all on the home page.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:bg-cobalt"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>
    </section>
  );
}
