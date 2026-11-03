"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedMesh, MeshLambertMaterial, Object3D, ShaderMaterial, Vector4, Vector3 } from "three";
import { river, waterLevel, WORLD } from "@/lib/geography";
import { PROJECT_FRAMES, projectHover, RIVER_ROCKS } from "@/lib/scenes";
import { mossyRockGeometry } from "./foliage";
import { daylight } from "./daylight";
import { brushTexture, CLOUD_SHADOW_GLSL, FOG_GLSL, NOISE_GLSL, paint, world } from "./shaders";

/**
 * The river: a ribbon of water following the river curve, painted in a
 * custom shader.
 * - Colour: deep teal in the channel, jade in the shallows, with the banks'
 *   green reflected along the edges and the sky reflected more at grazing
 *   angles (soft, painterly reflections rather than a mirror).
 * - Flow: brush strokes drift downstream and ruffle the surface.
 * - Foam: brush-stroke foam along the banks and gathering around rocks.
 * - Ripples: rings spreading from where a project canvas stands, whenever
 *   its card on the page is hovered (see ProjectCanvases / lib/scenes).
 */

/** How many ripples can be spreading at once, and how many rocks make foam. */
const RIPPLES = 4;
const ROCKS = RIVER_ROCKS.length;

const vertex = /* glsl */ `
  attribute vec2 aFlow; // x: across the river (-1…1), y: metres downstream
  varying vec2 vFlow;
  varying vec3 vWorld;
  void main() {
    vFlow = aFlow;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uBank;
  uniform vec3 uSky;
  uniform vec3 uSun;
  uniform vec3 uSunDir;
  uniform vec3 uLight;
  uniform float uRain;
  uniform float uCliffZ;
  uniform vec3 uRocks[${ROCKS}];
  uniform vec4 uRipples[${RIPPLES}]; // x, z, start time, strength
  uniform sampler2D uBrush;
  varying vec2 vFlow;
  varying vec3 vWorld;
  ${NOISE_GLSL}
  ${FOG_GLSL}
  ${CLOUD_SHADOW_GLSL}
  void main() {
    // Over the cliff the water is the waterfall's (Waterfall.tsx), not the ribbon's.
    if (vWorld.z > uCliffZ - 14.0 && vWorld.z < uCliffZ + 7.0) discard;
    float edge = abs(vFlow.x);

    // Brush strokes drifting downstream (two layers, at different speeds)
    float s1 = texture2D(uBrush, vec2(vFlow.x * 0.45, vFlow.y * 0.018 - uTime * 0.05)).r;
    float s2 = texture2D(uBrush, vec2(vFlow.x * 0.8 + 0.3, vFlow.y * 0.04 - uTime * 0.11)).r;
    float ruffle = (s1 + s2) * 0.5;

    // Ripples from the project canvases
    float ring = 0.0;
    for (int i = 0; i < ${RIPPLES}; i++) {
      vec4 r = uRipples[i];
      float age = uTime - r.z;
      if (r.w <= 0.0 || age < 0.0 || age > 6.0) continue;
      float d = distance(vWorld.xz, r.xy);
      float front = age * 5.0;
      ring += sin((d - front) * 1.6) * smoothstep(5.0, 0.0, abs(d - front)) * exp(-age * 0.7) * r.w;
    }

    // Base: deep channel, jade shallows, the banks' green reflected at the edges
    vec3 color = mix(uDeep, uShallow, smoothstep(0.3, 0.95, edge));
    color = mix(color, uBank, smoothstep(0.55, 1.0, edge) * 0.45 * (0.7 + ruffle * 0.6));
    color *= uLight; // the water's own colour darkens with the day; reflections carry the sky

    // Soft sky reflection, stronger at grazing angles, broken up by the strokes
    vec3 view = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - max(view.y, 0.0), 3.0);
    color = mix(color, uSky, (0.18 + fresnel * 0.42) * (0.75 + (ruffle - 0.5) * 0.8) * (1.0 - smoothstep(0.6, 1.0, edge) * 0.6));
    color += ring * 0.08;

    // Monsoon rain: little rings opening all over the surface
    if (uRain > 0.01) {
      vec2 cell = floor(vWorld.xz * 0.5);
      vec2 local = fract(vWorld.xz * 0.5) - 0.5;
      float seed = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
      float age = fract(uTime * 1.3 + seed);
      float r = length(local + (seed - 0.5) * 0.4);
      color += uSky * smoothstep(0.05, 0.0, abs(r - age * 0.45)) * (1.0 - age) * uRain * 0.5;
    }

    // Sun glints along the stroke crests
    vec3 halfV = normalize(view + uSunDir);
    float facing = pow(max(halfV.y, 0.0), 30.0);
    float glint = smoothstep(0.68, 0.82, s2) * smoothstep(0.55, 0.75, s1);
    color += uSun * (glint * (0.12 + facing * 1.2) + max(ring, 0.0) * facing * 0.6);

    // Foam: along the banks, and gathered around each rock (a little downstream of it)
    float foam = smoothstep(0.78, 1.0, edge + (s1 - 0.5) * 0.45);
    for (int i = 0; i < ${ROCKS}; i++) {
      vec2 d = vWorld.xz - uRocks[i].xz;
      d.y *= 0.6; // stretched downstream
      foam += smoothstep(7.0, 2.5, length(d)) * smoothstep(0.35, 0.7, s2 + (wNoise(vWorld.xz * 0.6 - uTime * 0.4) - 0.5) * 0.5);
    }
    color = mix(color, vec3(0.92, 0.95, 0.91) * uLight, clamp(foam, 0.0, 1.0) * 0.7);

    gl_FragColor = vec4(paintedFog(color * cloudShade(vWorld.xz, uTime), vWorld), 1.0);
  }
`;

export function River() {
  const geometry = useMemo(() => {
    const steps = 700;
    const positions: number[] = [];
    const flow: number[] = [];
    const indices: number[] = [];
    const up = new Vector3(0, 1, 0);
    const side = new Vector3();
    let length = 0;
    let prev = river.getPointAt(0);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = river.getPointAt(t);
      length += p.distanceTo(prev);
      prev = p;
      const tangent = river.getTangentAt(t);
      side.crossVectors(tangent, up).normalize();
      // Narrower on the plateau, wider in the lowlands
      const half = WORLD.riverHalfWidth * (p.z < WORLD.cliffZ ? 0.8 : 1.15);
      const y = waterLevel(p.z);
      for (const s of [-1, 1]) {
        positions.push(p.x + side.x * half * s, y, p.z + side.z * half * s);
        flow.push(s, length);
      }
      if (i < steps) {
        const a = i * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
    geo.setAttribute("aFlow", new BufferAttribute(new Float32Array(flow), 2));
    geo.setIndex(indices);
    return geo;
  }, []);

  const material = useMemo(() => {
    const m = new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        // The ribbon's winding depends on the river's direction; draw both sides.
        side: DoubleSide,
        uniforms: {
          uDeep: { value: new Color("#24585a") },
          uShallow: { value: new Color("#6fa892") },
          uBank: { value: new Color("#2f5a3c") },
          uSky: { value: daylight.waterSky },
          uRocks: { value: RIVER_ROCKS },
          uRipples: { value: Array.from({ length: RIPPLES }, () => new Vector4(0, 0, -100, 0)) },
          uSun: { value: daylight.waterSun },
          uSunDir: { value: daylight.sunDir },
          uLight: { value: daylight.light },
          uRain: daylight.uRain,
          uCliffZ: { value: WORLD.cliffZ },
          // Shared by reference: clock, brush and fog
          uTime: world.uTime,
          uBrush: { value: brushTexture() },
          uFogNear: world.uFogNear,
          uFogFar: world.uFogFar,
          uFogDensity: world.uFogDensity,
          uFogBase: world.uFogBase,
          uFogFalloff: world.uFogFalloff,
        },
      });
    return m;
  }, []);

  // Ripples: when a project card is hovered, rings spread from its canvas,
  // and keep coming gently while the pointer stays.
  const ripple = useRef({ seen: 0, next: 0, slot: 0 });
  useFrame(() => {
    const t = world.uTime.value;
    const r = ripple.current;
    const frame = PROJECT_FRAMES.find((f) => f.slug === projectHover.slug);
    if (!frame) return;
    if (projectHover.changedAt !== r.seen || t > r.next) {
      r.seen = projectHover.changedAt;
      r.next = t + 1.4;
      const slots = material.uniforms.uRipples.value as Vector4[];
      slots[r.slot].set(frame.ripple.x, frame.ripple.z, t, 1);
      r.slot = (r.slot + 1) % RIPPLES;
    }
  });

  return (
    <group>
      <mesh geometry={geometry} material={material} />
      <RiverRocks />
    </group>
  );
}

/** Mossy rocks standing in the stream (the shader gathers foam around them). */
function RiverRocks() {
  const mesh = useMemo(() => {
    const m = new InstancedMesh(
      mossyRockGeometry(),
      paint(new MeshLambertMaterial({ vertexColors: true, flatShading: true }), { strokeScale: 0.3 }),
      RIVER_ROCKS.length,
    );
    const dummy = new Object3D();
    RIVER_ROCKS.forEach((p, i) => {
      dummy.position.set(p.x, p.y - 0.8, p.z);
      dummy.rotation.set(0, i * 1.9, 0);
      const s = 2.2 + (i % 3) * 0.9;
      dummy.scale.set(s, s * 0.9, s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.frustumCulled = false;
    return m;
  }, []);
  return <primitive object={mesh} />;
}
