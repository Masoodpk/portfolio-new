import { profile } from "@/content/profile";
import { ogSize, renderOgCard } from "@/lib/og";

export const alt = `${profile.name} — ${profile.title}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: `${profile.title} · ${profile.availability}`,
    title: profile.name,
    subtitle: profile.headline.join(" "),
    footer: profile.coreStack.join(" · "),
    withHand: true,
  });
}
