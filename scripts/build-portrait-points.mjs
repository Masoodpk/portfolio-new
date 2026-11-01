/**
 * Turns the portrait into particle positions for the hero (the technique from
 * Codrops' "Interactive Particles with Three.js"): every point is a pixel of
 * the photo, picked more often where the photo is darker. Writes
 * public/data/portrait-points.bin:  npm run portrait
 *
 * File layout (Int16, little-endian):
 *   [count, then count × (x, y, shade) for paper themes,
 *           then count × (x, y, shade) for dark themes]
 * y is in -1…1 and x keeps the photo's aspect (×10000); shade is 0…1 (×10000). Light themes draw dark ink
 * where the photo is dark; dark themes draw light where the photo is light.
 */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "src/assets/masood-pk.png";
const WIDTH = 220; // sampling grid; points are jittered within each cell
const CROP_BOTTOM = 0.74; // the photo's bottom edge fades into a dark band
const COUNT = 20000; // the desktop world uses 20,000 particles

const meta = await sharp(SOURCE).metadata();
const height = Math.round(WIDTH * (meta.height / meta.width) * CROP_BOTTOM);
const { data } = await sharp(SOURCE)
  .removeAlpha()
  .greyscale()
  .extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * CROP_BOTTOM) })
  .resize(WIDTH, height)
  .normalise()
  .clahe({ width: 24, height: 24, maxSlope: 3 }) // lift facial detail locally
  .raw()
  .toBuffer({ resolveWithObject: true });

const lum = (x, y) => data[y * WIDTH + x] / 255;

// The background is a plain grey that varies by row. Flood-fill it inward
// from the top and side edges; whatever the fill can't reach is the person
// (skin is close to the grey, but it's enclosed by hair, ears and beard).
const rowBg = new Float32Array(height);
for (let y = 0; y < height; y++) {
  let bg = 0;
  for (let x = 0; x < 6; x++) bg += lum(x, y) + lum(WIDTH - 1 - x, y);
  rowBg[y] = bg / 12;
}
const background = new Uint8Array(WIDTH * height);
const queue = [];
const visit = (x, y) => {
  const i = y * WIDTH + x;
  if (background[i] || Math.abs(lum(x, y) - rowBg[y]) > 0.07) return;
  background[i] = 1;
  queue.push(i);
};
for (let x = 0; x < WIDTH; x++) visit(x, 0);
for (let y = 0; y < height; y++) {
  visit(0, y);
  visit(WIDTH - 1, y);
}
while (queue.length) {
  const i = queue.pop(), x = i % WIDTH, y = (i / WIDTH) | 0;
  if (x > 0) visit(x - 1, y);
  if (x < WIDTH - 1) visit(x + 1, y);
  if (y > 0) visit(x, y - 1);
  if (y < height - 1) visit(x, y + 1);
}
// Smooth the edge: a pixel is the person if most of its neighbourhood is.
const soft = new Uint8Array(WIDTH * height);
for (let y = 0; y < height; y++)
  for (let x = 0; x < WIDTH; x++) {
    let sum = 0, n = 0;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= WIDTH || yy >= height) continue;
        sum += 1 - background[yy * WIDTH + xx]; n++;
      }
    soft[y * WIDTH + x] = sum / n > 0.5 ? 1 : 0;
  }

// Edge strength (Sobel), so features like eyes, nose, mouth and the beard line
// get extra particles and the face stays recognisable at a few thousand dots.
const edge = new Float32Array(WIDTH * height);
let maxEdge = 0;
for (let y = 1; y < height - 1; y++)
  for (let x = 1; x < WIDTH - 1; x++) {
    const gx = lum(x + 1, y - 1) + 2 * lum(x + 1, y) + lum(x + 1, y + 1) - lum(x - 1, y - 1) - 2 * lum(x - 1, y) - lum(x - 1, y + 1);
    const gy = lum(x - 1, y + 1) + 2 * lum(x, y + 1) + lum(x + 1, y + 1) - lum(x - 1, y - 1) - 2 * lum(x, y - 1) - lum(x + 1, y - 1);
    const e = Math.hypot(gx, gy);
    edge[y * WIDTH + x] = e;
    maxEdge = Math.max(maxEdge, e);
  }
for (let i = 0; i < edge.length; i++) edge[i] = Math.min(1, edge[i] / (maxEdge * 0.45));

let seed = 7;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

function sample(toneOf) {
  const out = new Int16Array(COUNT * 3);
  const scale = 2 / height; // fit the height to -1…1
  let i = 0;
  while (i < COUNT) {
    const x = Math.floor(rand() * WIDTH), y = Math.floor(rand() * height);
    if (!soft[y * WIDTH + x]) continue;
    const tone = toneOf(lum(x, y));
    const weight = Math.min(1, 0.03 + 0.5 * tone + 0.65 * edge[y * WIDTH + x]);
    // Fade out towards the bottom crop so the shoulders dissolve.
    const fade = Math.min(1, (height - y) / (height * 0.22));
    if (rand() > weight * fade) continue;
    const px = (x + rand() - WIDTH / 2) * scale;
    const py = -(y + rand() - height / 2) * scale;
    out.set([Math.round(px * 10000), Math.round(py * 10000), Math.round(tone * 10000)], i * 3);
    i++;
  }
  return out;
}

const forPaper = sample((l) => Math.pow(1 - l, 1.4)); // ink where dark
const forDark = sample((l) => Math.pow(l, 1.2)); // light where bright
const header = new Int16Array([COUNT]);
const file = Buffer.concat([header, forPaper, forDark].map((a) => Buffer.from(a.buffer)));
await writeFile("public/data/portrait-points.bin", file);
console.log(`portrait-points.bin: ${COUNT} points × 2 themes, ${Math.round(file.length / 1024)} KB, aspect ${(WIDTH / height).toFixed(3)}`);

// Optional preview for tuning: node scripts/build-portrait-points.mjs --preview out.png
const previewIndex = process.argv.indexOf("--preview");
if (previewIndex > 0) {
  const W = 520, H = 520, img = Buffer.alloc(W * H * 3, 255);
  for (const [pool, ox] of [[forPaper, 0], [forDark, W / 2]]) {
    if (ox) for (let p = 0; p < W * H; p++) if (p % W >= W / 2) img.fill(16, p * 3, p * 3 + 3);
    for (let k = 0; k < 11000; k++) {
      const x = Math.round(ox + W / 4 + (pool[k * 3] / 10000) * (H / 4.6));
      const y = Math.round(H / 2 - (pool[k * 3 + 1] / 10000) * (H / 4.6));
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const c = ox ? [180, 190, 255] : [35, 64, 255];
      img.set(c, (y * W + x) * 3);
      if (x + 1 < W) img.set(c, (y * W + x + 1) * 3);
    }
  }
  await sharp(img, { raw: { width: W, height: H, channels: 3 } }).png().toFile(process.argv[previewIndex + 1]);
}
