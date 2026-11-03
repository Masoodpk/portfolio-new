"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  CanvasTexture,
  Color,
  MeshBasicMaterial,
  MeshLambertMaterial,
  SpriteMaterial,
  Vector3,
  type BufferGeometry,
} from "three";
import { timeline, type TimelineEntry } from "@/data/content";
import { cameraAt, targetCurve } from "@/lib/cameraPath";
import { fbm, terrainHeight } from "@/lib/geography";
import { chapterProgress } from "@/lib/journey";
import { paint } from "./shaders";

/**
 * The journey, carved into the cliff beside the falls: one stone ledge per
 * milestone, rising from the earliest (at the foot) to today (near the top).
 * Each ledge stands where the camera is looking at its moment of the
 * Journey chapter, so as the camera rises, they light up one after another:
 * the carved line along the front glows gold and the inscription appears.
 * Decorative: the same milestones are listed on the page.
 */

const FIRST = 0.2;
const LAST = 0.8;

/** Oldest first: studies, then certificates, then work in order of starting. */
const RANK: Record<TimelineEntry["kind"], number> = { education: 0, certification: 1, work: 2 };
const climb = [...timeline].sort((a, b) => RANK[a.kind] - RANK[b.kind] || (a.start ?? "").localeCompare(b.start ?? ""));

/** Where the cliff face is at height y along x: walk north until the ground reaches y. */
function faceAt(x: number, y: number) {
  let z = -280;
  while (z > -360 && terrainHeight(x, z) < y) z -= 0.25;
  // Which way the face looks (downhill, horizontally)
  const gx = terrainHeight(x + 1.5, z) - terrainHeight(x - 1.5, z);
  const gz = terrainHeight(x, z + 1.5) - terrainHeight(x, z - 1.5);
  return { z, rotationY: Math.atan2(-gx, -gz) };
}

/**
 * A rough shelf of stone: a slab with chiselled, uneven edges, coloured
 * like the cliff around it (weathered rock, moss on top),
 * so from a distance it reads as part of the rock face.
 */
function slabGeometry(seed: number) {
  const geo = new BoxGeometry(10, 1.8, 4.4, 8, 2, 4).toNonIndexed() as BufferGeometry;
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const stone = new Color("#8f8468");
  const dark = new Color("#6c634e");
  const moss = new Color("#6a7f3e");
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = fbm(x * 0.5 + seed, z * 0.5 + y, 3);
    // Chip the edges and taper the slab into the rock; the front face stays
    // flat enough to carry the carved line
    const front = z > 2 ? 0.25 : 1;
    pos.setXYZ(i, x * (1 - (z < 0 ? 0 : z / 4.4) * 0.12) + (n - 0.5) * 0.5, y + (n - 0.5) * 0.35, z + (n - 0.5) * 0.6 * front);
    c.copy(stone).lerp(dark, n * (y < 0 ? 1.2 : 0.8));
    if (y > 0.5 && n > 0.5) c.lerp(moss, 0.75);
    c.toArray(colors, i * 3);
  }
  geo.setAttribute("color", new BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function glowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,226,160,0.5)");
  g.addColorStop(0.4, "rgba(242,198,109,0.22)");
  g.addColorStop(1, "rgba(242,198,109,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

export function JourneyLedges() {
  const ledges = useMemo(() => {
    const cam = new Vector3();
    const look = new Vector3();
    return climb.map((entry, i) => {
      const at = FIRST + (i / Math.max(1, climb.length - 1)) * (LAST - FIRST);
      cameraAt("experience", at, cam);
      cameraAt("experience", at, look, targetCurve);
      const x = -32 - (i % 2) * 3;
      // Between the camera's eye line and where it looks, so each ledge sits mid-frame at its moment
      const y = cam.y + (look.y - cam.y) * 0.45;
      const face = faceAt(x, y);
      // Half the slab sunk into the rock, half standing out
      const position = new Vector3(x, y, face.z).add(new Vector3(Math.sin(face.rotationY), 0, Math.cos(face.rotationY)).multiplyScalar(1.2));
      return { entry, at, position, rotationY: face.rotationY, geometry: slabGeometry(i * 3.1) };
    });
  }, []);

  const shared = useMemo(
    () => ({
      stone: paint(new MeshLambertMaterial({ vertexColors: true, flatShading: true }), { strokeScale: 0.3 }),
      groove: new BoxGeometry(7.4, 0.24, 0.2),
      glow: glowTexture(),
    }),
    [],
  );
  const grooves = useMemo(() => ledges.map(() => new MeshBasicMaterial({ color: new Color("#6c634e") })), [ledges]);
  const glows = useMemo(
    () => ledges.map(() => new SpriteMaterial({ map: shared.glow, transparent: true, blending: AdditiveBlending, depthWrite: false, opacity: 0 })),
    [ledges, shared],
  );
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const unlit = useMemo(() => new Color("#6c634e"), []);
  const lit = useMemo(() => new Color("#ffd27a"), []);

  useFrame(() => {
    const p = chapterProgress("experience");
    ledges.forEach((ledge, i) => {
      const on = Math.min(1, Math.max(0, (p - ledge.at + 0.06) / 0.07));
      // The inscription shows while the camera is near, then fades as it climbs on
      const label = Math.min(on, 1 - Math.min(1, Math.max(0, (p - ledge.at - 0.18) / 0.12)));
      // Lit only while the Journey is on screen: from the river or the night
      // forest the ledges are just shelves in the rock
      const shown = on * (p < 1.15 ? 1 : 0);
      grooves[i].color.copy(unlit).lerp(lit, shown);
      glows[i].opacity = shown * 0.35;
      const el = labelRefs.current[i];
      if (el) {
        el.style.opacity = String(label);
        el.style.visibility = label > 0.01 ? "visible" : "hidden";
        el.style.transform = `translateY(${(1 - on) * 10}px)`;
      }
    });
  });

  return (
    <group>
      {ledges.map((ledge, i) => (
        <group key={ledge.entry.id} position={ledge.position} rotation={[0, ledge.rotationY, 0]}>
          <mesh geometry={ledge.geometry} material={shared.stone} />
          {/* The carved line along the slab's front edge */}
          <mesh geometry={shared.groove} material={grooves[i]} position={[0, 0.05, 2.5]} />
          {/* A warm wash on the rock above the ledge, behind the carved line (never across it) */}
          <sprite material={glows[i]} position={[0, 1.8, 0.6]} scale={[16, 6, 1]} />
          <Html position={[5, 1.5, 1.6]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div ref={(el) => void (labelRefs.current[i] = el)} aria-hidden="true" className="scene-label w-64 -translate-y-1/2 text-center opacity-0">
              <span className="on-scene eyebrow block text-[0.6rem] text-gold">{ledge.entry.period}</span>
              <span className="on-scene font-display block text-2xl leading-tight text-mist">{ledge.entry.role}</span>
              <span className="on-scene block text-xs text-mist/80">{ledge.entry.organization}</span>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
