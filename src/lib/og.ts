import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Shared 1200×630 social card size. */
export const ogSize = { width: 1200, height: 630 };

/**
 * Serves a share card pre-rendered by `npm run og` (scripts/build-og-images.mjs),
 * which draws it in Chrome with the site's own fonts and halftone portrait.
 */
export async function ogImage(name: string) {
  const png = await readFile(join(process.cwd(), "assets-src", "og", `${name}.png`));
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}
