"use client";

import { useMemo } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Points,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Vector3,
} from "three";
import { positionCurve, SHOTS } from "@/lib/cameraPath";
import { terrainHeight } from "@/lib/geography";
import { paint, SUN_DIR, world } from "./shaders";

/**
 * CHAPTER 3, THROUGH THE CANOPY: what makes the dive feel like a dive.
 * - Giant leaves hung right beside the camera's descent, so they sweep past
 *   the lens (the depth of field blurs them, being so close).
 * - Shafts of sunlight slanting down through gaps in the canopy around the
 *   About clearing.
 * - Pollen and dust drifting in the light.
 */

/** The stretch of the flight path from the mouth of the gorge (where the camera turns in under the trees) to the About clearing. */
function diveRange() {
  const last = SHOTS.length - 1;
  const from = SHOTS.findIndex((s) => s.chapter === "about");
  const to = SHOTS.findLastIndex((s) => s.chapter === "about");
  return [from / last, to / last] as const;
}

/** Where the light falls: around the About clearing. */
const CLEARING = { x: -132, z: 72, radius: 48 };

let seed = 71;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

/** A big, simple rainforest leaf: a long pointed blade with a light midrib, base at the origin, pointing +y. */
function bigLeafGeometry() {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.42, 0.18, 0.4, 0.75, 0, 1.25);
  shape.bezierCurveTo(-0.4, 0.75, -0.42, 0.18, 0, 0);
  const blade = new ShapeGeometry(shape, 10);
  const pos = blade.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const dark = new Color("#2f5a3c");
  const light = new Color("#7fa650");
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Curl the blade: edges lift, the tip droops
    pos.setZ(i, x * x * 0.6 - y * y * 0.12);
    c.copy(dark).lerp(light, 0.35 + y * 0.3).lerp(new Color("#c5d86d"), Math.max(0, 0.06 - Math.abs(x)) * 6);
    c.toArray(colors, i * 3);
  }
  blade.setAttribute("color", new BufferAttribute(colors, 3));
  blade.computeVertexNormals();
  return blade;
}

function LensLeaves({ count }: { count: number }) {
  const mesh = useMemo(() => {
    const geometry = bigLeafGeometry();
    const material = paint(new MeshLambertMaterial({ vertexColors: true, side: DoubleSide }), {
      wind: true,
      swayHeight: 0,
      swayScale: 0.05,
      strokeScale: 0.6,
      cloudShadows: false,
    });
    const mesh = new InstancedMesh(geometry, material, count);
    const [from, to] = diveRange();
    const dummy = new Object3D();
    const p = new Vector3();
    const tangent = new Vector3();
    const side = new Vector3();
    for (let i = 0; i < count; i++) {
      const u = from + ((i + 0.5) / count) * (to - from) * 0.85;
      positionCurve.getPoint(u, p);
      positionCurve.getTangent(u, tangent);
      // Off to one side of the path, close enough to brush past the lens
      const angle = rand() * Math.PI * 2;
      side.set(Math.cos(angle), Math.sin(angle) * 0.6, Math.sin(angle)).cross(tangent).normalize();
      dummy.position.copy(p).addScaledVector(side, 2.2 + rand() * 3.5);
      dummy.rotation.set(rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI);
      dummy.scale.setScalar(2.6 + rand() * 3);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.frustumCulled = false;
    return mesh;
  }, [count]);

  return <primitive object={mesh} />;
}

function GodRays({ count }: { count: number }) {
  const group = useMemo(() => {
    const root = new Group();
    // A shaft of light: an open cone, narrow where it enters the canopy and
    // wider at the ground, lit through its middle and soft at its edges.
    const geometry = new CylinderGeometry(1.6, 6, 1, 20, 6, true).translate(0, -0.5, 0);
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      uniforms: { uTime: world.uTime, uColor: { value: new Color("#ffe1a1") } },
      vertexShader: /* glsl */ `
        varying float vAlong;
        varying float vFacing;
        varying float vFade;
        void main() {
          vAlong = position.y + 1.0; // 1 at the canopy, 0 at the ground
          vec4 world = modelMatrix * vec4(position, 1.0);
          vec3 n = normalize(mat3(modelMatrix) * normal);
          vec3 toCam = normalize(cameraPosition - world.xyz);
          vFacing = abs(dot(n, toCam)); // 1 through the middle of the shaft, 0 at its silhouette
          float dist = distance(world.xyz, cameraPosition);
          vFade = smoothstep(190.0, 70.0, dist) * smoothstep(4.0, 16.0, dist);
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColor;
        varying float vAlong;
        varying float vFacing;
        varying float vFade;
        void main() {
          float shimmer = 0.8 + 0.2 * sin(uTime * 0.5 + vAlong * 4.0);
          float a = pow(max(vFacing, 0.0), 2.0) * smoothstep(0.0, 0.6, vAlong) * smoothstep(1.0, 0.9, vAlong) * shimmer * vFade * 0.2;
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
    });
    const slant = new Vector3(SUN_DIR.x, 0, SUN_DIR.z).normalize();
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * CLEARING.radius;
      const x = CLEARING.x + Math.cos(a) * r;
      const z = CLEARING.z + Math.sin(a) * r;
      const ground = terrainHeight(x, z);
      const length = 36 + rand() * 12;
      const shaft = new Mesh(geometry, material);
      // Hang from the canopy, leaning away from the sun (light travels away from it)
      shaft.position.set(x + slant.x * length * 0.45, ground + length, z + slant.z * length * 0.45);
      shaft.scale.set(0.6 + rand() * 0.8, length, 0.6 + rand() * 0.8);
      shaft.lookAt(shaft.position.x + slant.x, shaft.position.y, shaft.position.z + slant.z);
      shaft.rotateX(-0.42);
      shaft.frustumCulled = false;
      root.add(shaft);
    }
    return root;
  }, [count]);

  return <primitive object={group} />;
}

function Pollen({ count }: { count: number }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * CLEARING.radius * 1.2;
      const x = CLEARING.x + Math.cos(a) * r;
      const z = CLEARING.z + Math.sin(a) * r;
      positions.set([x, terrainHeight(x, z) + 1 + rand() * 26, z], i * 3);
      phases[i] = rand() * 100;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new BufferAttribute(phases, 1));
    const material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: world.uTime },
      vertexShader: /* glsl */ `
        uniform float uTime;
        attribute float aPhase;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.21 + aPhase) * 1.6;
          p.y += sin(uTime * 0.13 + aPhase * 1.7) * 1.2;
          p.z += cos(uTime * 0.17 + aPhase) * 1.6;
          vec4 mv = viewMatrix * vec4(p, 1.0);
          float dist = -mv.z;
          gl_PointSize = clamp(90.0 / dist, 1.0, 7.0);
          vAlpha = smoothstep(120.0, 30.0, dist) * (0.5 + 0.5 * sin(uTime * 1.3 + aPhase * 3.0));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vAlpha * 0.8;
          gl_FragColor = vec4(vec3(1.0, 0.93, 0.7) * a, a);
        }
      `,
    });
    const p = new Points(geometry, material);
    p.frustumCulled = false;
    return p;
  }, [count]);

  return <primitive object={points} />;
}

export function CanopyDive({ leaves, rays, pollen }: { leaves: number; rays: number; pollen: number }) {
  // Wind, light and pollen all move on the shared clock (shaders.ts); nothing to do per frame.
  return (
    <group>
      <LensLeaves count={leaves} />
      <GodRays count={rays} />
      <Pollen count={pollen} />
    </group>
  );
}
