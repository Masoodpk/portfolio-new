import { ArrowUpRight } from "lucide-react";
import { profile } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-paper">
      <div className="container-page flex flex-col gap-6 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-display text-xl text-ink">{profile.name}</span>
          <span className="mx-3 text-line-strong">—</span>
          {profile.title}, {profile.location}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {profile.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-ink transition-colors hover:text-cobalt"
              >
                {social.label}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${profile.email}`} className="font-medium text-ink transition-colors hover:text-cobalt">
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
