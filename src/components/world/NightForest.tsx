"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  ShaderMaterial,
} from "three";
import { riverDistance, terrainHeight } from "@/lib/geography";
import { daylight } from "./daylight";
import { mushroomGeometry } from "./foliage";
import { paint, world } from "./shaders";

/**
 * CHAPTER 7 · MONSOON NIGHT: what comes out after dark.
 * - Rain: painted streaks falling around the camera, slanting in the wind.
 * - Fireflies: blinking over the forest floor, thickest in the clearing the
 *   camera comes down to for Contact.
 * - Glowing fungi: clumps of bioluminescent mushrooms on the forest floor
 *   (Kerala's forests have real ones), each with a soft halo.
 * All fade in with the night (daylight.ts) and cost nothing by day.
 */

/** The clearing the camera comes down to (see the contact shots in cameraPath). */
const CLEARING = { x: -60, z: -200, dirX: -30, dirZ: -35 };

/** A seeded random sequence, so the night forest is the same on every visit. */
function seeded(start: number) {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

/** A spot on the forest floor in front of the camera's night view, `spread` metres either side. */
function floorSpot(rand: () => number, near: number, far: number, spread: number) {
  for (let tries = 0; tries < 20; tries++) {
    const t = near + rand() * (far - near);
    const side = (rand() - 0.5) * 2 * spread;
    const len = Math.hypot(CLEARING.dirX, CLEARING.dirZ);
    const x = CLEARING.x + (CLEARING.dirX / len) * t + (CLEARING.dirZ / len) * side;
    const z = CLEARING.z + (CLEARING.dirZ / len) * t - (CLEARING.dirX / len) * side;
    if (riverDistance(x, z) > 17) return { x, z, ground: terrainHeight(x, z) };
  }
  return null;
}

export function NightForest({ rain = 2600, fireflies = 320, fungi = 70 }: { rain?: number; fireflies?: number; fungi?: number }) {
  return (
    <group>
      <Rain count={rain} />
      <Fireflies count={fireflies} />
      <GlowFungi count={fungi} />
    </group>
  );
}

/* ─── Rain ───────────────────────────────────────────────────────────────── */

function Rain({ count }: { count: number }) {
  const ref = useRef<Mesh>(null);
  const { geometry, material } = useMemo(() => {
    const rand = seeded(77);
    const instanced = new InstancedBufferGeometry().copy(new PlaneGeometry(1, 1, 1, 1) as unknown as InstancedBufferGeometry);
    instanced.instanceCount = count;
    const offsets = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) offsets.set([rand(), rand(), rand(), rand()], i * 4);
    instanced.setAttribute("aOffset", new InstancedBufferAttribute(offsets, 4));
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: world.uTime, uRain: daylight.uRain, uLight: { value: daylight.light } },
      vertexShader: /* glsl */ `
        attribute vec4 aOffset;
        uniform float uTime;
        varying vec2 vUv;
        varying float vFade;
        void main() {
          vUv = uv;
          // A box of rain that travels with the camera: each streak falls and wraps
          vec3 box = vec3(70.0, 46.0, 70.0);
          vec3 p = aOffset.xyz * box;
          p.y -= uTime * (30.0 + aOffset.w * 14.0);
          p.x += uTime * 4.0; // the monsoon wind
          vec3 rel = mod(p - cameraPosition + box * 0.5, box) - box * 0.5;
          vec3 centre = cameraPosition + rel;
          float dist = length(rel);
          // Face the camera around the vertical, slanted with the wind
          vec3 toCam = normalize(vec3(rel.x, 0.0, rel.z) * -1.0 + vec3(0.0001));
          vec3 right = vec3(toCam.z, 0.0, -toCam.x);
          float len = 1.6 + aOffset.w * 1.4;
          float width = 0.025 + dist * 0.0018;
          vec3 world = centre + right * position.x * width + vec3(0.12, 1.0, 0.0) * position.y * len;
          vFade = smoothstep(1.5, 5.0, dist) * smoothstep(36.0, 18.0, dist);
          gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uRain;
        uniform vec3 uLight;
        varying vec2 vUv;
        varying float vFade;
        void main() {
          float across = 1.0 - abs(vUv.x * 2.0 - 1.0);
          float along = smoothstep(0.0, 0.6, vUv.y) * smoothstep(1.0, 0.85, vUv.y); // a tapering brush stroke
          vec3 color = mix(vec3(0.72, 0.84, 0.9), vec3(1.0), 0.3) * (0.6 + uLight * 0.6);
          gl_FragColor = vec4(color, across * along * vFade * uRain * 0.42);
        }
      `,
    });
    return { geometry: instanced, material };
  }, [count]);

  useFrame(() => {
    if (ref.current) ref.current.visible = daylight.rain > 0.01;
  });

  return (
<mesh ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={10} visible={false} />
  );
}

/* ─── Fireflies ──────────────────────────────────────────────────────────── */

function Fireflies({ count }: { count: number }) {
  const ref = useRef<Points>(null);
  const { geometry, material } = useMemo(() => {
    const rand = seeded(131);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      // Most in the clearing, the rest scattered further along the floor
      const spot = i < count * 0.7 ? floorSpot(rand, 6, 60, 26) : floorSpot(rand, -40, 160, 90);
      if (!spot) continue;
      positions.set([spot.x, spot.ground + 0.6 + rand() * 6, spot.z], i * 3);
      seeds.set([rand(), rand()], i * 2);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new BufferAttribute(seeds, 2));
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: world.uTime, uNight: daylight.uNight },
      vertexShader: /* glsl */ `
        attribute vec2 aSeed;
        uniform float uTime;
        varying float vBlink;
        void main() {
          float t = uTime * (0.25 + aSeed.x * 0.3) + aSeed.y * 40.0;
          // A slow, looping wander
          vec3 p = position + vec3(sin(t) * 1.6, sin(t * 1.7) * 0.8, cos(t * 0.8) * 1.6);
          vec4 mv = viewMatrix * modelMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          // Blink: long glows with gaps of darkness
          vBlink = pow(max(sin(uTime * (0.8 + aSeed.y * 1.4) + aSeed.x * 30.0), 0.0), 3.0);
          gl_PointSize = clamp(260.0 / max(1.0, -mv.z), 2.0, 18.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uNight;
        varying float vBlink;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float glow = smoothstep(1.0, 0.0, d);
          float core = smoothstep(0.35, 0.0, d);
          vec3 color = vec3(0.91, 0.95, 0.48) * glow * 0.7 + vec3(1.0, 1.0, 0.85) * core;
          gl_FragColor = vec4(color * vBlink * uNight, 1.0);
        }
      `,
    });
    return { geometry, material };
  }, [count]);

  useFrame(() => {
    if (ref.current) ref.current.visible = daylight.night > 0.01;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} visible={false} renderOrder={5} />;
}

/* ─── Glowing fungi ──────────────────────────────────────────────────────── */

function GlowFungi({ count }: { count: number }) {
  const caps = useRef<InstancedMesh>(null);
  const halos = useRef<Points>(null);

  const clumps = useMemo(() => {
    const rand = seeded(211);
    const out: { x: number; z: number; ground: number }[] = [];
    for (let i = 0; i < count; i++) {
      const spot = floorSpot(rand, 5, 70, 30);
      if (spot) out.push(spot);
    }
    return out;
  }, [count]);

  const { geometry, material, haloGeometry, haloMaterial } = useMemo(() => {
    const haloPositions = new Float32Array(clumps.length * 3);
    clumps.forEach((c, i) => haloPositions.set([c.x, c.ground + 0.7, c.z], i * 3));
    const haloGeometry = new BufferGeometry();
    haloGeometry.setAttribute("position", new BufferAttribute(haloPositions, 3));
    return {
      geometry: mushroomGeometry(),
      material: paint(new MeshLambertMaterial({ color: "#8fbfae", emissive: "#5fe8bd", emissiveIntensity: 0 }), { strokes: 0.3, strokeScale: 2, cloudShadows: false }),
      haloGeometry,
      haloMaterial: new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uNight: daylight.uNight, uTime: world.uTime },
        vertexShader: /* glsl */ `
          uniform float uTime;
          varying float vPulse;
          void main() {
            vec4 mv = viewMatrix * modelMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = clamp(1400.0 / max(1.0, -mv.z), 4.0, 120.0);
            vPulse = 0.75 + 0.25 * sin(uTime * 0.9 + position.x * 0.7);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uNight;
          varying float vPulse;
          void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            gl_FragColor = vec4(vec3(0.35, 0.95, 0.75) * pow(smoothstep(1.0, 0.0, d), 2.0) * 0.35 * vPulse * uNight, 1.0);
          }
        `,
      }),
    };
  }, [clumps]);

  // Each clump: three to five mushrooms of different sizes
  const perClump = 4;
  useLayoutEffect(() => {
    const mesh = caps.current;
    if (!mesh) return;
    const dummy = new Object3D();
    const tint = new Color();
    clumps.forEach((c, i) => {
      for (let k = 0; k < perClump; k++) {
        const a = k * 2.1 + i;
        const r = k === 0 ? 0 : 0.35 + k * 0.18;
        dummy.position.set(c.x + Math.cos(a) * r, c.ground - 0.05, c.z + Math.sin(a) * r);
        dummy.rotation.set((k - 1.5) * 0.12, a, 0);
        dummy.scale.setScalar(k === 0 ? 0.9 : 0.4 + (k % 3) * 0.18);
        dummy.updateMatrix();
        mesh.setMatrixAt(i * perClump + k, dummy.matrix);
        mesh.setColorAt(i * perClump + k, tint.set(k % 2 ? "#c9f7e4" : "#e8fbef"));
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [clumps]);

  useFrame(() => {
    if (caps.current) (caps.current.material as MeshLambertMaterial).emissiveIntensity = daylight.night * 1.4;
    if (halos.current) halos.current.visible = daylight.night > 0.01;
  });

  return (
    <group>
      <instancedMesh ref={caps} args={[geometry, material, clumps.length * perClump]} frustumCulled={false} />
      <points ref={halos} geometry={haloGeometry} material={haloMaterial} frustumCulled={false} visible={false} renderOrder={5} />
    </group>
  );
}
