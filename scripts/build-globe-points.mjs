/**
 * Pre-computes evenly spaced points over land for the particle globe.
 * Output: public/data/land-points.bin — Int16 pairs [lat*100, lon*100].
 *   npm run globe
 */
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topology = JSON.parse(await readFile(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(topology, topology.objects.land);

const SAMPLES = 42_000; // Fibonacci sphere → roughly even spacing
const golden = Math.PI * (3 - Math.sqrt(5));
const points = [];
for (let i = 0; i < SAMPLES; i++) {
  const y = 1 - (i / (SAMPLES - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (lat < -60) continue; // skip Antarctica, it only adds noise at the bottom
  if (geoContains(land, [lon, lat])) points.push(Math.round(lat * 100), Math.round(lon * 100));
}

const buffer = Buffer.from(new Int16Array(points).buffer);
await writeFile("public/data/land-points.bin", buffer);
console.log(`${points.length / 2} land points, ${Math.round(buffer.length / 1024)} KB`);
