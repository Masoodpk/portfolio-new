/**
 * Captures desktop and mobile screenshots of live project sites for the
 * case studies. Re-run when a site changes:  npm run shots
 */
import { chromium, devices } from "@playwright/test";
import sharp from "sharp";

const targets = [
  { slug: "brew-your-brand", url: "https://brewyourbrand.in/" },
];

const browser = await chromium.launch({ channel: "chrome" });
for (const { slug, url } of targets) {
  const dir = `public/images/projects/${slug}`;
  const shots = [
    { name: "desktop", context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 }, fullPage: false },
    { name: "desktop-full", context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, fullPage: true },
    { name: "mobile", context: { ...devices["iPhone 13"] }, fullPage: false },
  ];
  for (const shot of shots) {
    const context = await browser.newContext(shot.context);
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(2500);
    const png = await page.screenshot({ fullPage: shot.fullPage });
    let image = sharp(png);
    if (shot.fullPage) image = image.resize({ width: 1440, withoutEnlargement: true });
    const info = await image.webp({ quality: 80 }).toFile(`${dir}/${shot.name}.webp`);
    console.log(`${slug}/${shot.name}.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`);
    await context.close();
  }
}
await browser.close();
