import { profile } from "@/data/content";
import { ogImage, ogSize } from "@/lib/og";

export const alt = `${profile.name} — ${profile.title}. Building digital experiences.`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage("home");
}
