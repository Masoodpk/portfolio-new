"use client";

import { useMemo } from "react";
import { BufferAttribute, Color, MeshLambertMaterial, PlaneGeometry } from "three";
import { fbm } from "@/lib/geography";
import { paint } from "./shaders";

/**
 * Far ranges behind the peaks: three long, faceted ridgelines at increasing
 * distance, each paler and bluer (the painted fog does most of that), like
 * the receding layers in a landscape painting. Cheap: one low-res strip each.
 */
const LAYERS = [
  { z: -1900, height: 620, color: "#3d6a55", seed: 3 },
  { z: -2500, height: 760, color: "#5a8a83", seed: 9 },
  { z: -3200, height: 900, color: "#7ea6ad", seed: 17 },
];

function ridge(z: number, height: number, seed: number, color: string) {
  const width = 7000;
  const depth = 500;
  const geo = new PlaneGeometry(width, depth, 140, 6);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const zz = pos.getZ(i);
    // A ridge profile: highest along the middle of the strip, jagged peaks along x
    const across = 1 - Math.abs(zz) / (depth / 2);
    const peaks = Math.pow(fbm(x * 0.0016 + seed, seed, 4), 1.6) * 1.7;
    pos.setY(i, Math.max(0, across) * height * (0.35 + peaks) - 40);
    pos.setZ(i, zz + z);
  }
  geo.computeVertexNormals();
  // Snow on the highest tops, in ragged patches (the fog keeps it soft and far)
  const base = new Color(color);
  const snow = new Color("#e8eef4");
  const colors = new Float32Array(pos.count * 3);
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / height;
    const line = 0.95 + (fbm(pos.getX(i) * 0.01 + seed, 2.7, 3) - 0.5) * 0.3;
    c.copy(base).lerp(snow, Math.min(1, Math.max(0, (y - line) / 0.12)) * 0.9);
    c.toArray(colors, i * 3);
  }
  geo.setAttribute("color", new BufferAttribute(colors, 3));
  return geo;
}

export function Mountains() {
  const layers = useMemo(
    () =>
      LAYERS.map((layer) => ({
        geometry: ridge(layer.z, layer.height, layer.seed, layer.color),
        material: paint(new MeshLambertMaterial({ vertexColors: true, flatShading: true }), { strokeScale: 0.012, cloudShadows: false }),
      })),
    [],
  );

  return (
    <group>
      {layers.map((layer, i) => (
        <mesh key={i} geometry={layer.geometry} material={layer.material} />
      ))}
    </group>
  );
}
