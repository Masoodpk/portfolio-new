"use client";

import { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CircleGeometry, DoubleSide, PlaneGeometry, RingGeometry, ShaderMaterial, Vector3 } from "three";
import { riverAt, riverTAtZ, waterLevel, WORLD } from "@/lib/geography";
import { daylight } from "./daylight";
import { FOG_GLSL, NOISE_GLSL, world } from "./shaders";

/**
 * CHAPTER 6 · THE WATERFALL: the river pours off the plateau, about 95 m
 * down the cliff.
 * - The sheet: shoots off the lip and curves down (a real fall's
 *   trajectory), streaks of water racing down it, whiter as it aerates.
 * - The plunge pool: churning foam where it lands.
 * - Spray and mist: droplets thrown out of the pool and big soft puffs of
 *   mist billowing up in front of the cliff.
 * - A faint rainbow arcing through the spray (by day only).
 * All painted in shaders, coloured by the time of day.
 */

/** Where the water leaves the lip and where it lands (see the river's cliff gap). */
const LIP_Z = WORLD.cliffZ - 13; // just upstream of where the river ribbon stops
const FOOT_Z = WORLD.cliffZ + 14;
const TOP = waterLevel(LIP_Z - 8) + 0.25;
/** Share of the sheet that lies flat on the river before the edge */
const LIP_RUN = 0.06;
const BOTTOM = waterLevel(FOOT_Z + 6);
/** One centre line for the whole fall (the river's centre where it crosses the cliff) */
const FOOT = riverAt(riverTAtZ(WORLD.cliffZ)).setZ(FOOT_Z);

const fogUniforms = () => ({
  uFogNear: world.uFogNear,
  uFogFar: world.uFogFar,
  uFogDensity: world.uFogDensity,
  uFogBase: world.uFogBase,
  uFogFalloff: world.uFogFalloff,
});

/** The falling sheet, row by row from the lip (v = 0) to the pool (v = 1). */
function sheetGeometry() {
  const geo = new PlaneGeometry(1, 1, 12, 60);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i); // −0.5…0.5 across
    const v = 0.5 - pos.getY(i); // 0 upstream of the lip … 1 at the bottom
    // The first rows run flat over the river's end (so the lip hides where the river stops)…
    const run = Math.min(1, v / LIP_RUN);
    const fall = Math.max(0, (v - LIP_RUN) / (1 - LIP_RUN));
    const y = TOP - (TOP - BOTTOM) * fall;
    // …then the water is launched off the lip and arcs out, well clear of the rock face
    const z = v < LIP_RUN ? LIP_Z - 7 * (1 - run) : LIP_Z + (FOOT_Z - LIP_Z) * Math.pow(fall, 0.4);
    const width = 25 + v * 7; // spreads a little as it falls
    // The edges curl back towards the cliff, so the sheet reads as a curtain
    pos.setXYZ(i, FOOT.x + u * width, y, z - Math.pow(Math.abs(u) * 2, 3) * 2.5);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Spray: droplets and mist puffs, each looping on its own clock. */
function sprayGeometry(count: number) {
  const geo = new BufferGeometry();
  const seeds = new Float32Array(count * 4);
  let seed = 41;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < count; i++) seeds.set([rand(), rand(), rand(), rand()], i * 4);
  geo.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new BufferAttribute(seeds, 4));
  return geo;
}

export function Waterfall({ spray = 900 }: { spray?: number }) {
  const parts = useMemo(() => {
    const sheet = new ShaderMaterial({
      transparent: true,
      // Writes depth, so the depth of field focuses on the water, not the cliff behind it
      depthWrite: true,
      side: DoubleSide,
      uniforms: { uTime: world.uTime, uLight: { value: daylight.light }, uSun: { value: daylight.waterSun }, ...fogUniforms() },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorld;
        void main() {
          vUv = vec2(uv.x, 1.0 - uv.y);
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uLight, uSun;
        varying vec2 vUv;
        varying vec3 vWorld;
        ${NOISE_GLSL}
        ${FOG_GLSL}
        void main() {
          // Clamped: at the lip v can interpolate a hair below 0, and sqrt() of
          // that is NaN, which the paint filter smears into dark blotches
          float v = clamp(vUv.y, 0.0, 1.0);
          // Water accelerates as it falls: streaks stretch and speed up
          float fall = sqrt(v) * 9.0 - uTime * 1.25;
          float streaks = wNoise(vec2(vUv.x * 34.0, fall * 1.4));
          float fine = wNoise(vec2(vUv.x * 90.0, fall * 3.0));
          float ropes = smoothstep(0.35, 0.75, wNoise(vec2(vUv.x * 9.0, 0.3)) + (streaks - 0.5) * 0.6);
          float aerated = smoothstep(0.05, 0.9, v) * 0.45 + ropes * 0.45;
          vec3 deep = vec3(0.2, 0.36, 0.37);
          vec3 white = vec3(0.93, 0.96, 0.95);
          vec3 color = mix(deep, white, clamp(aerated + (streaks - 0.5) * 1.1 + (fine - 0.5) * 0.3, 0.0, 1.0));
          // Bright foam lip at the top, warm light catching the curtain
          color = mix(color, white, smoothstep(0.06, 0.0, v));
          color = color * uLight + uSun * smoothstep(0.7, 0.95, streaks) * 0.12;
          // Ragged edges: thin trickles at the sides, gaps between the ropes
          float edge = smoothstep(0.0, 0.1 + fine * 0.06, vUv.x) * smoothstep(1.0, 0.9 - fine * 0.06, vUv.x);
          float alpha = edge * (0.6 + ropes * 0.35) * mix(0.6, 1.0, streaks);
          gl_FragColor = vec4(clamp(paintedFog(color, vWorld), 0.0, 1.0), clamp(alpha, 0.0, 1.0));
        }
      `,
    });

    const pool = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: world.uTime, uLight: { value: daylight.light }, ...fogUniforms() },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorld;
        void main() {
          vUv = uv;
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uLight;
        varying vec2 vUv;
        varying vec3 vWorld;
        ${NOISE_GLSL}
        ${FOG_GLSL}
        void main() {
          vec2 p = vUv - 0.5;
          float r = length(p) * 2.0;
          // Foam rings rolling outwards from where the water lands
          float churn = wFbm(vec2(atan(p.y, p.x) * 3.0, r * 6.0 - uTime * 0.9));
          float foam = smoothstep(0.35, 0.7, churn + (1.0 - r) * 0.45);
          vec3 color = vec3(0.92, 0.95, 0.93) * uLight;
          gl_FragColor = vec4(paintedFog(color, vWorld), foam * smoothstep(1.0, 0.45, r) * 0.9);
        }
      `,
    });

    const sprayMat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: world.uTime,
        uLight: { value: daylight.light },
        uFoot: { value: new Vector3(FOOT.x, BOTTOM, FOOT_Z) },
        ...fogUniforms(),
      },
      vertexShader: /* glsl */ `
        attribute vec4 aSeed;
        uniform float uTime;
        uniform vec3 uFoot;
        varying float vAlpha;
        varying float vPuff;
        varying vec3 vWorld;
        void main() {
          float puff = step(0.9, aSeed.w); // about one in ten is a big puff of mist
          float speed = mix(0.32, 0.09, puff);
          float age = fract(uTime * speed * (0.7 + aSeed.z * 0.6) + aSeed.x * 7.0);
          float across = (aSeed.y - 0.5) * 34.0;
          // Thrown out from the foot of the falls: up, outwards and falling back (droplets);
          // rising slowly and drifting (mist)
          vec3 drop = vec3(across * (1.0 + age * 0.4), age * (20.0 + aSeed.z * 20.0) - age * age * 26.0, age * (6.0 + aSeed.w * 18.0));
          vec3 mist = vec3(across * 1.4 + age * 6.0, 2.0 + age * (12.0 + aSeed.z * 16.0), age * 12.0);
          vec3 p = uFoot + mix(drop, mist, puff);
          vec4 world = modelMatrix * vec4(p, 1.0);
          vWorld = world.xyz;
          vec4 mv = viewMatrix * world;
          gl_Position = projectionMatrix * mv;
          float size = mix(0.18 + aSeed.z * 0.3, 8.0 + aSeed.z * 6.0 + age * 8.0, puff);
          gl_PointSize = size * (900.0 / max(1.0, -mv.z));
          vAlpha = sin(age * 3.14159) * mix(0.7, 0.09, puff);
          vPuff = puff;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uLight;
        varying float vAlpha;
        varying float vPuff;
        varying vec3 vWorld;
        ${FOG_GLSL}
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = mix(smoothstep(1.0, 0.4, d), smoothstep(1.0, 0.0, d) * smoothstep(1.0, 0.2, d), vPuff);
          gl_FragColor = vec4(paintedFog(vec3(0.94, 0.97, 0.96) * uLight, vWorld), a * vAlpha);
        }
      `,
    });

    const rainbow = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uNight: daylight.uNight, uTime: world.uTime },
      vertexShader: /* glsl */ `
        varying vec2 vLocal;
        void main() {
          vLocal = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uNight, uTime;
        varying vec2 vLocal;
        void main() {
          float r = (length(vLocal) - 20.0) / 4.5; // 0 inner (violet) … 1 outer (red)
          vec3 spectrum = clamp(vec3(abs(r * 6.0 - 3.0) - 1.0, 2.0 - abs(r * 6.0 - 2.0), 2.0 - abs(r * 6.0 - 4.0)), 0.0, 1.0);
          spectrum = mix(spectrum, vec3(1.0), 0.25);
          // Strongest in the spray, fading out as the arc climbs away from it
          float low = smoothstep(26.0, 4.0, vLocal.y);
          float shimmer = 0.85 + 0.15 * sin(uTime * 0.7 + vLocal.x * 0.1);
          float a = sin(clamp(r, 0.0, 1.0) * 3.14159) * low * shimmer * (1.0 - uNight) * 0.13;
          gl_FragColor = vec4(spectrum * a, 1.0);
        }
      `,
    });

    return {
      sheetGeometry: sheetGeometry(),
      sheet,
      poolGeometry: new CircleGeometry(24, 40).rotateX(-Math.PI / 2),
      pool,
      sprayGeometry: sprayGeometry(spray),
      sprayMat,
      rainbowGeometry: new RingGeometry(20, 24.5, 96, 1, 0.12, Math.PI - 0.24),
      rainbow,
    };
  }, [spray]);

  return (
    <group>
      <mesh geometry={parts.sheetGeometry} material={parts.sheet} frustumCulled={false} renderOrder={2} />
      <mesh geometry={parts.poolGeometry} material={parts.pool} position={[FOOT.x, BOTTOM + 0.15, FOOT_Z + 4]} renderOrder={1} />
      <points geometry={parts.sprayGeometry} material={parts.sprayMat} frustumCulled={false} renderOrder={3} />
      {/* The rainbow faces downstream (towards the camera's approach), rooted in the spray */}
      <mesh geometry={parts.rainbowGeometry} material={parts.rainbow} position={[FOOT.x + 6, BOTTOM - 6, FOOT_Z + 9]} rotation={[0, -0.12, 0]} renderOrder={4} />
    </group>
  );
}
