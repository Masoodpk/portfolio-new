import { profile } from "@/content/profile";
import { ogImage, ogSize } from "@/lib/og";

export const alt = `${profile.name} — ${profile.title}. From Kerala to the world.`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage("home");
}
