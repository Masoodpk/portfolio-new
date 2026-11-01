import { ArrowUpRight } from "lucide-react";
import { profile } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="label-mono text-subtle">
          {profile.name} <span className="mx-2 text-line-strong">/</span> {profile.title}
          <span className="mx-2 text-line-strong">/</span> {profile.location}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {profile.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="label-mono inline-flex items-center gap-1 text-subtle transition-colors hover:text-fg"
              >
                {social.label}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
          <li>
            <a
              href={`mailto:${profile.email}`}
              className="label-mono text-subtle transition-colors hover:text-fg"
            >
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
