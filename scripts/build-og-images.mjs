/**
 * Renders the social share cards (1200×630) in local Chrome so they use the
 * site's own fonts and the real dotted globe. Output: assets-src/og/*.png,
 * served by the opengraph-image routes. Re-run after changing names or
 * projects:  npm run og
 */
import { readFile, mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { profile } from "../src/content/profile.ts";
import { projects } from "../src/content/projects.ts";

const font = async (file) => (await readFile(`assets-src/fonts/${file}`)).toString("base64");
const [serif, serifItalic, sans] = await Promise.all([
  font("InstrumentSerif-Regular-latin.woff2"),
  font("InstrumentSerif-Italic-latin.woff2"),
  font("Manrope-Variable-latin.woff2"),
]);
const land = Array.from(new Int16Array((await readFile("public/data/land-points.bin")).buffer.slice(0)));

const ORIGIN = { lat: 11.2588, lon: 75.7804 };
const DESTINATIONS = [
  [25.2048, 55.2708], [24.4539, 54.3773], [24.7136, 46.6753], [21.4858, 39.1925],
  [25.2854, 51.531], [23.588, 58.3829], [26.2285, 50.586],
];

const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function page({ eyebrow, title, accent, subtitle, footer }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Display";src:url(data:font/woff2;base64,${serif}) format("woff2");font-style:normal}
@font-face{font-family:"Display";src:url(data:font/woff2;base64,${serifItalic}) format("woff2");font-style:italic}
@font-face{font-family:"Body";src:url(data:font/woff2;base64,${sans}) format("woff2");font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#f2eee5;color:#141414;font-family:"Body";position:relative;overflow:hidden}
.copy{position:absolute;inset:64px auto 60px 72px;width:700px;display:flex;flex-direction:column;justify-content:space-between}
.eyebrow{font-weight:600;font-size:18px;letter-spacing:.16em;text-transform:uppercase;display:flex;gap:14px;align-items:center}
.eyebrow i{width:10px;height:10px;border-radius:50%;background:#2340ff;display:block}
h1{font-family:"Display";font-weight:400;letter-spacing:-.035em;line-height:.86;font-size:${title.length + (accent?.length ?? 0) > 14 ? 112 : 150}px}
h1 em{color:#2340ff}
p{font-family:"Display";font-style:italic;font-size:40px;line-height:1.1;color:#46433d;margin-top:22px;letter-spacing:-.015em}
.footer{font-weight:600;font-size:17px;letter-spacing:.12em;text-transform:uppercase;color:#6b665c;border-top:1px solid rgb(20 20 20/.28);padding-top:20px}
canvas{position:absolute;right:-90px;top:35px}
</style></head><body>
<canvas id="globe" width="1120" height="1120" style="width:560px;height:560px"></canvas>
<div class="copy">
  <div class="eyebrow"><i></i>${escape(eyebrow)}</div>
  <div><h1>${escape(title)}${accent ? ` <em>${escape(accent)}</em>` : ""}</h1><p>${escape(subtitle)}</p></div>
  <div class="footer">${escape(footer)}</div>
</div>
<script>
const land=${JSON.stringify(land)}, origin=${JSON.stringify(ORIGIN)}, dest=${JSON.stringify(DESTINATIONS)};
const c=document.getElementById("globe").getContext("2d"); c.scale(2,2);
const R=250, cx=280, cy=280, rad=Math.PI/180, lat0=18*rad, lon0=62*rad;
const project=(lat,lon)=>{lat*=rad;lon*=rad;const cosC=Math.sin(lat0)*Math.sin(lat)+Math.cos(lat0)*Math.cos(lat)*Math.cos(lon-lon0);
  return {x:cx+R*Math.cos(lat)*Math.sin(lon-lon0),y:cy-R*(Math.cos(lat0)*Math.sin(lat)-Math.sin(lat0)*Math.cos(lat)*Math.cos(lon-lon0)),z:cosC};};
c.strokeStyle="rgba(35,64,255,.18)";c.lineWidth=1;c.beginPath();c.arc(cx,cy,R,0,Math.PI*2);c.stroke();
for(let i=0;i<land.length;i+=2){const p=project(land[i]/100,land[i+1]/100);if(p.z<=0.02)continue;
  c.fillStyle="rgba(35,64,255,"+(0.25+p.z*0.65).toFixed(2)+")";c.beginPath();c.arc(p.x,p.y,0.9+p.z*1.3,0,Math.PI*2);c.fill();}
const vec=(lat,lon)=>{lat*=rad;lon*=rad;return[Math.cos(lat)*Math.cos(lon),Math.cos(lat)*Math.sin(lon),Math.sin(lat)];};
const toLL=(v)=>[Math.asin(v[2])/rad,Math.atan2(v[1],v[0])/rad];
c.strokeStyle="#1328c4";c.lineWidth=1.6;
for(const [lat,lon] of dest){const a=vec(origin.lat,origin.lon),b=vec(lat,lon);c.beginPath();
  for(let t=0;t<=1.0001;t+=0.02){const v=a.map((ai,k)=>ai*(1-t)+b[k]*t);const n=Math.hypot(...v);const lift=1+Math.sin(Math.PI*t)*0.12;
    const [la,lo]=toLL(v.map(x=>x/n));const p=project(la,lo);const x=cx+(p.x-cx)*lift,y=cy+(p.y-cy)*lift;t===0?c.moveTo(x,y):c.lineTo(x,y);}
  c.stroke();const e=project(lat,lon);c.fillStyle="#1328c4";c.beginPath();c.arc(e.x,e.y,3,0,Math.PI*2);c.fill();}
const o=project(origin.lat,origin.lon);c.fillStyle="#2340ff";c.beginPath();c.arc(o.x,o.y,6,0,Math.PI*2);c.fill();
c.strokeStyle="rgba(35,64,255,.35)";c.beginPath();c.arc(o.x,o.y,12,0,Math.PI*2);c.stroke();
</script></body></html>`;
}

const cards = [
  {
    name: "home",
    eyebrow: `${profile.title} · ${profile.location.split(",").slice(0, 2).join(",")}`,
    title: "Masood",
    accent: "PK",
    subtitle: "From Kerala to the world — building reliable, user-focused web applications.",
    footer: profile.coreStack.join(" · "),
  },
  ...projects.map((project) => ({
    name: project.slug,
    eyebrow: `Case study ${project.index} · ${project.context}`,
    title: project.name,
    subtitle: project.tagline,
    footer: `${profile.name} · ${project.stack.join(" · ")}`,
  })),
];

await mkdir("assets-src/og", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
for (const card of cards) {
  // A fresh page per card: setContent reuses the window, so scripts would clash.
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const errors = [];
  tab.on("pageerror", (error) => errors.push(error.message));
  await tab.setContent(page(card));
  if (errors.length) throw new Error(`${card.name}: ${errors.join("; ")}`);
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: `assets-src/og/${card.name}.png` });
  console.log(`assets-src/og/${card.name}.png`);
  await tab.close();
}
await browser.close();
