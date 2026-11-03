/**
 * Converts Cormorant Garamond (from @fontsource) into the typeface JSON that
 * three.js / drei <Text3D> read (same conversion as three's TTFLoader), keeping
 * only the characters the 3D titles use.
 * Output: public/fonts/cormorant-garamond.typeface.json      npm run typeface
 */
import { readFile, writeFile } from "node:fs/promises";
import opentype from "opentype.js";

const SOURCE = "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff";
const KEEP = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,'’&-:");

const file = await readFile(SOURCE);
const font = opentype.parse(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const round = Math.round;
const scale = 100000 / ((font.unitsPerEm || 2048) * 72);

const glyphs = {};
for (const char of KEEP) {
  const glyph = font.charToGlyph(char);
  if (!glyph) continue;
  let o = "";
  for (const command of glyph.path.commands) {
    o += (command.type === "C" ? "b" : command.type.toLowerCase()) + " ";
    for (const [x, y] of [["x", "y"], ["x1", "y1"], ["x2", "y2"]]) {
      if (command[x] !== undefined && command[y] !== undefined) o += `${round(command[x] * scale)} ${round(command[y] * scale)} `;
    }
  }
  glyphs[char] = {
    ha: round(glyph.advanceWidth * scale),
    x_min: round((glyph.xMin ?? 0) * scale),
    x_max: round((glyph.xMax ?? 0) * scale),
    o,
  };
}

const json = {
  glyphs,
  familyName: font.getEnglishName("fullName"),
  ascender: round(font.ascender * scale),
  descender: round(font.descender * scale),
  underlinePosition: font.tables.post.underlinePosition,
  underlineThickness: font.tables.post.underlineThickness,
  boundingBox: {
    xMin: font.tables.head.xMin,
    xMax: font.tables.head.xMax,
    yMin: font.tables.head.yMin,
    yMax: font.tables.head.yMax,
  },
  resolution: 1000,
  original_font_information: { fontFamily: font.getEnglishName("fontFamily"), license: "SIL Open Font License 1.1" },
};
await writeFile("public/fonts/cormorant-garamond.typeface.json", JSON.stringify(json));
console.log(`typeface: ${Object.keys(glyphs).length} glyphs`);
