/**
 * Draws the site icon (the logo's leaf, lime on deep forest green, with a
 * soft glow like a firefly behind it) and writes every size the app needs.
 * Re-run after changing the mark:
 *   npm run icons
 */
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const FOREST = "#1e3b2c";
const FOREST_DEEP = "#12291f";
const LEAF = "#c5d86d";
const LEAF_SHADE = "#8dbf6a";

/** `pad` shrinks the leaf into the maskable safe zone. */
const mark = ({ radius = 8, pad = 1 } = {}) => {
  const t = `translate(16 16) scale(${pad}) translate(-16 -16)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0" stop-color="${FOREST}"/>
      <stop offset="1" stop-color="${FOREST_DEEP}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${LEAF}" stop-opacity=".35"/>
      <stop offset="1" stop-color="${LEAF}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="32" height="32" rx="${radius}" fill="url(#bg)"/>
  <g transform="${t}">
    <circle cx="16" cy="16" r="12" fill="url(#glow)"/>
    <path d="M7 25C7 14 13.5 7 25 7C25 18.5 18 25 7 25Z" fill="${LEAF}"/>
    <path d="M7 25C7 14 13.5 7 25 7C19 12 13 18 7 25Z" fill="${LEAF_SHADE}" opacity=".55"/>
    <path d="M7 25L19.5 12.5" stroke="${FOREST}" stroke-width="1.5" stroke-linecap="round"/>
  </g>
</svg>
`;
};

await writeFile("src/app/icon.svg", mark());
const png = (svg, size, path) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(path);
await png(mark({ radius: 0 }), 180, "src/app/apple-icon.png");
await png(mark({ radius: 0 }), 192, "public/icon-192.png");
await png(mark({ radius: 0, pad: 0.72 }), 512, "public/icon-512.png");
console.log("icons written");
