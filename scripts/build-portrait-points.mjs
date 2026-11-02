/**
 * Turns the portrait into a 3D point cloud for the hero, like a face scan:
 * thousands of fine points on a relief built from the photo, packed densely
 * where the photo is bright (dark themes) or dark (light themes), so overlaps
 * glow along brows, nose and lips. A little dust floats around the head.
 * Writes public/data/portrait-points.bin:  npm run portrait
 *
 * File layout (Int16, little-endian):
 *   [count, aspect (width / height), then count × (x, y, z, shade) for paper themes,
 *           then count × (x, y, z, shade) for dark themes]
 * y is in -1…1 and x keeps the photo's aspect; x, y, z and shade (0…1) are ×10000.
 * The relief is an estimate (a dome from the silhouette plus the photo's own
 * shading), not a scan; it only needs to catch the light as the head turns.
 */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "src/assets/masood-pk.png";
const WIDTH = 340; // pixel grid: one particle per qualifying pixel, with room between them
const CROP_BOTTOM = 0.7; // head, neck and shoulders; the T-shirt below adds nothing
const COUNT = 32000; // the desktop world uses 32,000 particles

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

// Depth. Distance from the silhouette (two-pass chamfer) makes a dome, and the
// photo's shading adds relief: brow, nose and cheekbones catch the light and
// sit forward, eye sockets and the mouth line fall back.
const dist = new Float32Array(WIDTH * height);
for (let i = 0; i < dist.length; i++) dist[i] = person(i) ? 1e6 : 0;
for (let y = 0; y < height; y++)
  for (let x = 0; x < WIDTH; x++) {
    const i = at(x, y);
    if (!dist[i]) continue;
    if (x > 0) dist[i] = Math.min(dist[i], dist[i - 1] + 1);
    if (y > 0) dist[i] = Math.min(dist[i], dist[i - WIDTH] + 1);
    if (x > 0 && y > 0) dist[i] = Math.min(dist[i], dist[i - WIDTH - 1] + 1.414);
    if (x < WIDTH - 1 && y > 0) dist[i] = Math.min(dist[i], dist[i - WIDTH + 1] + 1.414);
  }
for (let y = height - 1; y >= 0; y--)
  for (let x = WIDTH - 1; x >= 0; x--) {
    const i = at(x, y);
    if (!dist[i]) continue;
    if (x < WIDTH - 1) dist[i] = Math.min(dist[i], dist[i + 1] + 1);
    if (y < height - 1) dist[i] = Math.min(dist[i], dist[i + WIDTH] + 1);
    if (x < WIDTH - 1 && y < height - 1) dist[i] = Math.min(dist[i], dist[i + WIDTH + 1] + 1.414);
    if (x > 0 && y < height - 1) dist[i] = Math.min(dist[i], dist[i + WIDTH - 1] + 1.414);
  }
const headRadius = WIDTH * 0.16; // about half the face's width
const broad = boxBlur((i) => stretched[i], 10);
const depth = (i) => {
  const dome = Math.sqrt(Math.min(1, dist[i] / headRadius));
  return 0.4 * dome + 0.12 * (soft[i] - broad[i]) - 0.25;
};

const scale = 2 / height; // fit the height to -1…1
const DUST = 0.1; // share of points drifting around the head

/**
 * Draws COUNT points: most from the person, each pixel picked in proportion to
 * its weight and placed anywhere inside it (so density, not dot size, carries
 * the image), plus faint dust in a loose shell around the head. Shuffled, so
 * phones taking the first N points get an even thinning of both.
 */
function sample(weightOf, shadeOf) {
  const weights = new Float32Array(WIDTH * height);
  let total = 0;
  for (let y = 0; y < height; y++) {
    // Fade out towards the bottom crop so the shoulders dissolve.
    const fade = Math.min(1, (height - y) / (height * 0.3)) ** 1.5;
    for (let x = 0; x < WIDTH; x++) {
      const i = at(x, y);
      if (!person(i)) continue;
      weights[i] = weightOf(tone(i), rim(i)) * fade;
      total += weights[i];
    }
  }
  const cdf = new Float64Array(weights.length);
  let run = 0;
  for (let i = 0; i < weights.length; i++) cdf[i] = run += weights[i] / total;

  const out = new Int16Array(COUNT * 4);
  const dust = Math.round(COUNT * DUST);
  const order = Array.from({ length: COUNT }, (_, i) => i);
  for (let i = COUNT - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (let n = 0; n < COUNT; n++) {
    let x, y, z, shade;
    if (n < dust) {
      // Dust: a loose shell around the head, faint and fine.
      const a = rand() * Math.PI * 2, r = 0.75 + rand() ** 0.6 * 0.9;
      x = Math.cos(a) * r * 1.1;
      y = Math.sin(a) * r * 0.95 + 0.15;
      z = (rand() - 0.5) * 1.2;
      shade = 0.05 + rand() * 0.25;
    } else {
      const target = rand();
      let lo = 0, hi = cdf.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cdf[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      const px = lo % WIDTH, py = (lo / WIDTH) | 0;
      x = (px + rand() - WIDTH / 2) * scale;
      y = -(py + rand() - height / 2) * scale;
      z = depth(lo) + (rand() - 0.5) * 0.015;
      shade = shadeOf(tone(lo));
    }
    out.set([x, y, z, shade].map((v) => Math.round(v * 10000)), order[n] * 4);
  }
  return out;
}

// Dark themes: points gather where the photo is lit; light themes: where it's
// dark, like ink. Every part of the head keeps some points, and its outline a
// few more, so the shape holds even where the photo is flat.
const forPaper = sample((t, edge) => 0.08 + (1 - t) ** 1.6 + (edge ? 0.5 : 0), (t) => 0.35 + 0.65 * (1 - t));
const forDark = sample((t, edge) => 0.07 + t ** 1.8 + (edge ? 0.4 : 0), (t) => 0.35 + 0.65 * t);
const header = new Int16Array([COUNT, Math.round((WIDTH / height) * 10000)]);
const file = Buffer.concat([header, forPaper, forDark].map((a) => Buffer.from(a.buffer)));
await writeFile("public/data/portrait-points.bin", file);
console.log(`portrait-points.bin: ${COUNT} points × 2 themes, ${Math.round(file.length / 1024)} KB, aspect ${(WIDTH / height).toFixed(3)}`);
