/**
 * Renders the social share cards (1200×630) in local Chrome: a painted
 * still of the forest (from `npm run stills`) with the name or project set
 * over it in the site's serif. Output: assets-src/og/*.png, served by the
 * opengraph-image routes.
 * Re-run after changing names or projects, or after new stills:  npm run og
 */
import { readFile, mkdir, access } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { profile, projects } from "../src/data/content.ts";

const dataUrl = async (file, type) => `data:${type};base64,${(await readFile(file)).toString("base64")}`;
const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const exists = (file) => access(file).then(() => true, () => false);

// Project cards use the waterfall: a neutral scene (the river still shows a project's canvas)
const STILL = { home: "assets-src/stills/home.png", projects: "assets-src/stills/experience.png" };
for (const file of Object.values(STILL)) {
  if (!(await exists(file))) throw new Error(`${file} is missing: run \`npm run stills\` first (with the site running).`);
}
const stills = { home: await dataUrl(STILL.home, "image/png"), projects: await dataUrl(STILL.projects, "image/png") };

const LEAF = `<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 20C4 10 10 4 20 4C20 14 14 20 4 20Z" fill="#c5d86d"/><path d="M4 20L14 10" stroke="#1e3b2c" stroke-width="1.4" stroke-linecap="round"/></svg>`;

function page({ still, eyebrow, title, subtitle, footer, picture }) {
  const size = title.length > 14 ? 96 : 124;
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=DM+Sans:wght@400;500&display=block" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;position:relative;font-family:"DM Sans";color:#e8efe6;background:#1e3b2c}
.still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:
  linear-gradient(90deg,rgb(14 34 26/.88) 0%,rgb(14 34 26/.62) 42%,rgb(14 34 26/0) 72%),
  linear-gradient(0deg,rgb(14 34 26/.55) 0%,rgb(14 34 26/0) 40%)}
.copy{position:absolute;left:78px;top:92px;width:640px;text-shadow:0 2px 18px rgb(8 20 16/.5)}
.eyebrow{font-size:16px;letter-spacing:.28em;text-transform:uppercase;color:#f2c66d}
h1{font-family:"Cormorant Garamond";font-weight:500;line-height:.95;letter-spacing:-.01em;font-size:${size}px;margin-top:22px}
p.sub{font-family:"Cormorant Garamond";font-style:italic;font-size:36px;line-height:1.2;color:#e8efe6;opacity:.92;margin-top:18px;max-width:22ch}
.footer{position:absolute;left:78px;bottom:54px;display:flex;align-items:center;gap:14px;font-size:18px;letter-spacing:.04em;color:#e8efe6}
.footer span{background:rgb(15 42 29/.55);border:1px solid rgb(232 239 230/.18);padding:9px 18px;border-radius:999px}
.frame{position:absolute;right:64px;top:250px;width:400px;padding:12px;background:#6b4f34;border-radius:4px;
  box-shadow:0 30px 60px -20px rgb(0 0 0/.55);transform:rotate(1.5deg)}
.frame img{display:block;width:100%;height:228px;object-fit:cover;object-position:top}
</style></head><body>
<img class="still" src="${still}">
<div class="shade"></div>
${picture ? `<div class="frame"><img src="${picture}"></div>` : ""}
<div class="copy">
  <p class="eyebrow">${escape(eyebrow)}</p>
  <h1>${escape(title)}</h1>
  <p class="sub">${escape(subtitle)}</p>
</div>
<div class="footer">${LEAF}<span>${escape(footer)}</span></div>
</body></html>`;
}

const cards = [
  {
    name: "home",
    still: stills.home,
    eyebrow: `${profile.title} · ${profile.location.split(",").slice(0, 2).join(",")}`,
    title: profile.name,
    subtitle: profile.tagline,
    footer: profile.coreStack.join(" · "),
  },
  ...(await Promise.all(
    projects.map(async (project) => {
      const cover = project.visuals.find((v) => v.kind === "image");
      const file = cover ? `public${cover.src}` : null;
      return {
        name: project.slug,
        still: stills.projects,
        eyebrow: `Case study ${project.index} · ${project.context}`,
        title: project.name,
        subtitle: project.tagline,
        footer: `${profile.name} · ${project.stack.slice(0, 4).join(" · ")}`,
        picture: file && (await exists(file)) ? await dataUrl(file, file.endsWith(".png") ? "image/png" : file.endsWith(".webp") ? "image/webp" : "image/jpeg") : null,
      };
    }),
  )),
];

await mkdir("assets-src/og", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
for (const card of cards) {
  // A fresh page per card: setContent reuses the window.
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await tab.setContent(page(card), { waitUntil: "networkidle" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: `assets-src/og/${card.name}.png` });
  console.log(`assets-src/og/${card.name}.png`);
  await tab.close();
}
await browser.close();
