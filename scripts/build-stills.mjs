/**
 * Paints the stills shown without WebGL or with reduced motion: one frame of
 * the live forest per chapter, landscape and portrait, saved as WebP in
 * public/stills/. Also keeps a full-size PNG of the opening, the river and the falls in
 * assets-src/stills/ for the share cards (npm run og).
 *
 * Needs the site running (production build is best):
 *   npm run build && npx next start -p 3100
 *   npm run stills            (or: BASE_URL=http://localhost:3000 npm run stills)
 *
 * Uses local Chrome with the GPU, so the paint filter renders as on screen.
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";

/** Which moment of each chapter makes its still (as in cameraPath's shots). */
const MOMENTS = { home: 0.12, flight: 0.55, about: 0.45, skills: 0.55, projects: 0.5, experience: 0.15, contact: 1 };
const FORMATS = [
  { suffix: "", width: 1920, height: 1080, quality: 76 },
  { suffix: "-portrait", width: 720, height: 1440, quality: 74 },
];
/** Kept as PNG for the share cards. */
const KEEP = ["home", "projects", "experience"];

await mkdir("public/stills", { recursive: true });
await mkdir("assets-src/stills", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
for (const format of FORMATS) {
  const page = await browser.newPage({ viewport: { width: format.width, height: format.height } });
  await page.goto(`${BASE}/?capture`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.querySelector("canvas"), null, { timeout: 30_000 });
  await page.waitForTimeout(5000);
  for (const [id, at] of Object.entries(MOMENTS)) {
    await page.evaluate(
      ([id, at]) => {
        const section = document.querySelector(`[data-chapter="${id}"]`);
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + at * Math.max(0, section.offsetHeight - window.innerHeight));
      },
      [id, at],
    );
    // Let the camera settle and the light change
    await page.waitForTimeout(5500);
    const png = await page.screenshot();
    await sharp(png).webp({ quality: format.quality }).toFile(`public/stills/${id}${format.suffix}.webp`);
    if (!format.suffix && KEEP.includes(id)) await sharp(png).png().toFile(`assets-src/stills/${id}.png`);
    console.log(`still: ${id}${format.suffix}`);
  }
  await page.close();
}
await browser.close();
