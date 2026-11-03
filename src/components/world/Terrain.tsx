"use client";

import { useMemo } from "react";
import { BufferAttribute, Color, MeshLambertMaterial, PlaneGeometry } from "three";
import { fbm, riverDistance, terrainHeight, WORLD } from "@/lib/geography";
import { paint, SUN_DIR } from "./shaders";

/** The painted palette for the ground. */
const DEEP = new Color("#1e3b2c");
const JUNGLE = new Color("#2f5a3c");
const MOSS = new Color("#7fa650");
const GRASS = new Color("#a9bb6e"); // shola grassland on the crests
const GRASS_SHADE = new Color("#6f8a52");
const OCHRE = new Color("#a99a6c"); // sunlit rock, muted
const ROCK = new Color("#55604f"); // dark, mossy rock in shade

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The ground. In the lowlands it lies under the instanced forest; up in the
 * Ghats it *is* the forest, painted on like the Western Ghats look from
 * afar: dense shola forest filling the valleys and folds (concave ground),
 * pale grassland on the crests, bare rock on the steepest faces and the
 * escarpment. `aForest` marks where forest grows; the painted material
 * draws a canopy of crowns there (see paint({ canopy })).
 */
export function Terrain({ segments }: { segments: number }) {
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(WORLD.size, WORLD.size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, WORLD.centerZ);
    const pos = geo.attributes.position;
    const river = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      river[i] = riverDistance(x, z);
      pos.setY(i, terrainHeight(x, z, river[i]));
    }
    geo.computeVertexNormals();

    // Curvature from the grid itself: how much lower than its neighbours a
    // point is (positive = in a fold or valley, negative = on a crest).
    const row = segments + 1;
    const fold = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const ix = i % row;
      const iz = Math.floor(i / row);
      const s = 3;
      const at = (dx: number, dz: number) => pos.getY(Math.min(row - 1, Math.max(0, iz + dz)) * row + Math.min(row - 1, Math.max(0, ix + dx)));
      fold[i] = (at(-s, 0) + at(s, 0) + at(0, -s) + at(0, s)) / 4 - pos.getY(i);
    }

    const normals = geo.attributes.normal;
    const colors = new Float32Array(pos.count * 3);
    const forest = new Float32Array(pos.count);
    const c = new Color();
    const shade = new Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const up = normals.getY(i);
      const sun = Math.max(0, normals.getX(i) * SUN_DIR.x + up * SUN_DIR.y + normals.getZ(i) * SUN_DIR.z);
      const base = z < WORLD.cliffZ ? WORLD.plateau : 0;
      const alt = y - base;
      const steep = smooth(0.7, 0.35, up); // 0 flat … 1 cliff

      // Mountain colouring: forest everywhere except the convex crests (shola
      // grassland), the steepest faces (rock) and the highest summits.
      const mountain = smooth(40, 160, alt);
      const crest = smooth(0.5, -3, fold[i]);
      let f = 1 - mountain * crest * 0.9;
      f *= 1 - steep * 0.6;
      f *= 1 - smooth(420, 560, alt);
      forest[i] = f;

      c.copy(GRASS_SHADE).lerp(GRASS, sun);
      c.lerp(sun > 0.55 ? OCHRE : ROCK, steep);
      const x = pos.getX(i);
      // The forest's own colour (under the painted canopy): deep in shade, moss in sun
      c.lerp(shade.copy(DEEP).lerp(JUNGLE, sun), f);
      if (f > 0.5 && sun > 0.8) c.lerp(MOSS, (sun - 0.8) * 1.5);
      // Cliff faces: streaks of bare, mossy rock running down them
      if (steep > 0.2) c.lerp(ROCK, steep * smooth(0.45, 0.7, fbm(x * 0.06, y * 0.012 + z * 0.06, 3)) * 0.8);
      // Riverbanks a little darker and wetter
      if (river[i] < WORLD.riverHalfWidth * 2.4) c.lerp(DEEP, 0.5 * (1 - river[i] / (WORLD.riverHalfWidth * 2.4)));
      c.toArray(colors, i * 3);
    }
    geo.setAttribute("color", new BufferAttribute(colors, 3));
    geo.setAttribute("aForest", new BufferAttribute(forest, 1));
    return geo;
  }, [segments]);

  const material = useMemo(() => paint(new MeshLambertMaterial({ vertexColors: true }), { strokeScale: 0.03, canopy: true }), []);

  return <mesh geometry={geometry} material={material} />;
}
