/**
 * Draws the site icon (a cobalt tile with a paper arc) and writes every
 * size the app needs. Re-run after changing the mark:  npm run icons
 */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const COBALT = "#2340ff";
const PAPER = "#f2eee5";

/** An arc from a home dot out to a ring: Kerala to the world. `pad` shrinks it into the maskable safe zone. */
const mark = ({ radius = 7, pad = 1 } = {}) => {
  const s = (v) => +(16 + (v - 16) * pad).toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${radius}" fill="${COBALT}"/>
  <path d="M${s(9)} ${s(23)}C${s(9)} ${s(13)} ${s(14)} ${s(8.5)} ${s(21.2)} ${s(9.6)}" fill="none" stroke="${PAPER}" stroke-width="${+(2.4 * pad).toFixed(2)}" stroke-linecap="round"/>
  <circle cx="${s(9)}" cy="${s(23)}" r="${+(3.2 * pad).toFixed(2)}" fill="${PAPER}"/>
  <circle cx="${s(23.4)}" cy="${s(10)}" r="${+(2.6 * pad).toFixed(2)}" fill="none" stroke="${PAPER}" stroke-width="${+(2 * pad).toFixed(2)}"/>
</svg>
`;
};

await writeFile("src/app/icon.svg", mark());
const png = (svg, size, path) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(path);
await png(mark({ radius: 0 }), 180, "src/app/apple-icon.png");
await png(mark({ radius: 0 }), 192, "public/icon-192.png");
await png(mark({ radius: 0, pad: 0.72 }), 512, "public/icon-512.png");
console.log("icons written");
