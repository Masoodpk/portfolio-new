"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, Group, SpriteMaterial } from "three";
import { terrainHeight, WORLD } from "@/lib/geography";
import { daylight } from "./daylight";
import { world } from "./shaders";

/** One painted sheet of mist: long, soft horizontal brush strokes. */
function mistTexture() {
  const w = 1024;
  const h = 320;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  ctx.lineCap = "round";
  ctx.filter = "blur(6px)"; // soft-edged strokes: mist, not smears
  for (let i = 0; i < 140; i++) {
    const y = h * (0.32 + rand() * 0.4);
    const x = w * (0.06 + rand() * 0.5);
    const length = w * (0.25 + rand() * 0.45);
    // Fade strokes towards the sheet's edges
    const edge = 1 - Math.abs(y / h - 0.5) * 2;
    ctx.strokeStyle = `rgba(244,249,248,${(0.035 + rand() * 0.06) * edge})`;
    ctx.lineWidth = 10 + rand() * 34;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + length * 0.3, y - 6 + rand() * 12, x + length * 0.7, y - 6 + rand() * 12, x + length, y + (rand() - 0.5) * 10);
    ctx.stroke();
  }
  // Fade every edge with a soft oval, so a sheet never shows its rectangle:
  // a circle of radius w/2, squashed vertically to the sheet's proportions.
  ctx.filter = "none";
  ctx.globalCompositeOperation = "destination-in";
  ctx.setTransform(1, 0, 0, h / w, 0, 0);
  const mask = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  mask.addColorStop(0, "rgba(0,0,0,1)");
  mask.addColorStop(0.55, "rgba(0,0,0,0.85)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, w, w);
  return new CanvasTexture(canvas);
}

/** The highest summits of the Ghats, at least 220 m apart (sampled on a grid). */
function summits(count: number) {
  const found: { x: number; y: number; z: number }[] = [];
  const samples: { x: number; y: number; z: number }[] = [];
  for (let x = -900; x <= 900; x += 30) {
    for (let z = -1150; z <= -420; z += 30) samples.push({ x, y: terrainHeight(x, z), z });
  }
  samples.sort((a, b) => b.y - a.y);
  for (const p of samples) {
    if (found.length >= count) break;
    if (found.every((f) => Math.hypot(f.x - p.x, f.z - p.z) > 220)) found.push(p);
  }
  return found;
}

/** `cap`: a cloud on a summit, which sways about its peak instead of drifting away. */
type Sheet = { x: number; y: number; z: number; width: number; speed: number; opacity: number; cap?: boolean };

/**
 * Painted mist sheets: banks lying in the Ghats' valleys above the plateau,
 * clouds caught on the highest summits, and a few thin wisps over the
 * lowland canopy. Soft-edged and fairly
 * transparent, so they veil the layers without washing the view out.
 * They drift slowly with the wind.
 */
export function Mist({ count }: { count: number }) {
  const group = useRef<Group>(null);

  const { sheets, materials } = useMemo(() => {
    const texture = mistTexture();
    let seed = 5;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const list: Sheet[] = [];
    // Banks of mist lying in the Ghats' valleys, above the plateau
    for (let i = 0; i < count; i++) {
      const z = -380 - rand() * 640;
      list.push({
        x: (rand() - 0.5) * 1300,
        y: WORLD.plateau + 25 + rand() * 120 + (-z - 380) * 0.12,
        z,
        width: 340 + rand() * 380,
        speed: 1.5 + rand() * 2.5,
        opacity: 0.18 + rand() * 0.22,
      });
    }
    // A couple of thin wisps over the lowland canopy
    for (let i = 0; i < Math.ceil(count / 9); i++) {
      list.push({
        x: (rand() - 0.5) * 900,
        y: 48 + rand() * 30,
        z: -320 + rand() * 260,
        width: 220 + rand() * 220,
        speed: 1.5 + rand() * 2,
        opacity: 0.12 + rand() * 0.12,
      });
    }
    // Cloud caps: a soft cloud clinging to each of the highest summits
    for (const peak of summits(Math.ceil(count / 2))) {
      list.push({ x: peak.x - 30, y: peak.y - 18, z: peak.z + 20, width: 230 + rand() * 120, speed: 0.6 + rand() * 0.6, opacity: 0.32 + rand() * 0.14, cap: true });
    }
    const mats = list.map((s) => new SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: s.opacity, fog: false }));
    return { sheets: list, materials: mats };
  }, [count]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    for (const m of materials) m.color.copy(daylight.mist);
    const time = world.uTime.value;
    group.current?.children.forEach((sprite, i) => {
      const sheet = sheets[i];
      if (sheet.cap) {
        sprite.position.x = sheet.x + Math.sin(time * 0.05 * sheet.speed + i) * 25;
        return;
      }
      sprite.position.x += sheet.speed * dt;
      if (sprite.position.x > sheet.x + 300) sprite.position.x = sheet.x - 300;
    });
  });

  return (
    <group ref={group}>
      {sheets.map((sheet, i) => (
        <sprite key={i} material={materials[i]} position={[sheet.x, sheet.y, sheet.z]} scale={[sheet.width, sheet.width * 0.31, 1]} />
      ))}
    </group>
  );
}
