/**
 * Renders the live 3D hand in Chrome and saves a transparent WebP poster
 * used before WebGL loads and as the static fallback.
 *
 *   npm run dev            # in another terminal
 *   npm run poster         # writes public/images/hand-poster.webp
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";

const url = process.env.POSTER_URL ?? "http://localhost:3000/";
const out = "public/images/hand-poster.webp";

const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=metal"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });
const canvas = page.locator("#home canvas");
await canvas.waitFor({ state: "attached", timeout: 30_000 });
await page.waitForTimeout(2500); // let the pose settle

// Keep only the canvas, on a transparent page.
await page.addStyleTag({
  content: `html, body { background: transparent !important; }
    body * { visibility: hidden !important; }
    #home canvas { visibility: visible !important; }`,
});
const png = await canvas.screenshot({ omitBackground: true });

const info = await sharp(png)
  .trim()
  .resize({ height: 1100, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 90 })
  .toFile(out);
console.log(`Saved ${out} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
await browser.close();
