/**
 * Turns the portrait into particle positions for the hero (the technique from
 * Codrops' "Interactive Particles with Three.js"): every point is a pixel of
 * the photo that clears a tone threshold, with gaps where it is dark. Writes
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
const WIDTH = 340; // pixel grid: one particle per qualifying pixel, with room between them
const CROP_BOTTOM = 0.7; // head, neck and shoulders; the T-shirt below adds nothing
const COUNT = 20000; // the desktop world uses 20,000 particles

const meta = await sharp(SOURCE).metadata();
const height = Math.round(WIDTH * (meta.height / meta.width) * CROP_BOTTOM);
const { data } = await sharp(SOURCE)
  .removeAlpha()
  .greyscale()
  .extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * CROP_BOTTOM) })
  .resize(WIDTH, height)
  .raw()
  .toBuffer({ resolveWithObject: true });

const lum = (x, y) => data[y * WIDTH + x] / 255;
const at = (x, y) => y * WIDTH + x;

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
  const i = at(x, y);
  if (background[i] || Math.abs(lum(x, y) - rowBg[y]) > 0.06) return;
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

/** Mean of a square neighbourhood; `value(i)` reads each pixel. */
function boxBlur(value, radius) {
  const out = new Float32Array(WIDTH * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < WIDTH; x++) {
      let sum = 0, n = 0;
      for (let dy = -radius; dy <= radius; dy++)
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= WIDTH || yy >= height) continue;
          sum += value(at(xx, yy)); n++;
        }
      out[at(x, y)] = sum / n;
    }
  return out;
}

// Smooth the edge: a pixel is the person if most of its neighbourhood is.
const coverage = boxBlur((i) => 1 - background[i], 2);
const person = (i) => coverage[i] > 0.5;
// The silhouette: person pixels within a couple of pixels of the background.
// Drawing it gives the jaw, ears and hair their outline in both themes.
const near = boxBlur((i) => (person(i) ? 1 : 0), 1);
const rim = (i) => person(i) && near[i] < 0.99;

// Tone: the photo's own light and shade (no local equalising, which flattens
// the cheeks and jaw), stretched to the range found on the head and neck,
// then sharpened so eyes, brows, nose and mouth stand out.
const headTones = [];
for (let y = 0; y < height * 0.62; y++)
  for (let x = 0; x < WIDTH; x++) if (person(at(x, y))) headTones.push(lum(x, y));
headTones.sort((a, b) => a - b);
const lo = headTones[Math.floor(headTones.length * 0.03)];
const hi = headTones[Math.floor(headTones.length * 0.985)];
const stretched = new Float32Array(WIDTH * height);
for (let i = 0; i < stretched.length; i++) stretched[i] = Math.min(1, Math.max(0, (data[i] / 255 - lo) / (hi - lo)));
const soft = boxBlur((i) => stretched[i], 3);
const tone = (i) => Math.min(1, Math.max(0, stretched[i] + 1.4 * (stretched[i] - soft[i])));

let seed = 7;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

/**
 * One particle per pixel whose shade clears the threshold (as Codrops does with
 * brightness > 34), so the face reads like a coarse photo rather than noise.
 * Below the threshold a few faint dots remain, so even the palest skin (on
 * paper) and the darkest hair (on dark) keep the head's shape.
 * The pool is shuffled, so taking the first N points (phones) thins it evenly.
 * Particles beyond the pixel count get shade 0: the shader hides them on the
 * face, and they only appear when the world morphs into other shapes.
 */
function sample(shadeOf, rimShade) {
  const scale = 2 / height; // fit the height to -1…1
  const cells = [];
  for (let y = 0; y < height; y++) {
    // Fade out towards the bottom crop so the shoulders dissolve.
    const fade = Math.min(1, (height - y) / (height * 0.25));
    for (let x = 0; x < WIDTH; x++) {
      const i = at(x, y);
      if (!person(i) || rand() > fade) continue;
      let shade = shadeOf(tone(i));
      if (rim(i)) shade = Math.max(shade, rimShade);
      if (shade < 0.14) {
        if (rand() > 0.2) continue;
        shade = 0.08;
      }
      cells.push([x, y, shade]);
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const out = new Int16Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const [x, y, shade] = cells[i % cells.length];
    const px = (x + 0.5 + (rand() - 0.5) * 0.6 - WIDTH / 2) * scale;
    const py = -(y + 0.5 + (rand() - 0.5) * 0.6 - height / 2) * scale;
    out.set([Math.round(px * 10000), Math.round(py * 10000), Math.round((i < cells.length ? shade : 0) * 10000)], i * 3);
  }
  console.log(`${cells.length} pixels qualify`);
  return out;
}

const forPaper = sample((t) => (1 - t) ** 0.8, 0.55); // ink where the photo is dark
const forDark = sample((t) => t ** 1.2, 0.4); // light where the photo is bright
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
