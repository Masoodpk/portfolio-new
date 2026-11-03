"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DoubleSide, InstancedBufferAttribute, InstancedMesh, MeshLambertMaterial, Object3D, type WebGLProgramParametersWithUniforms } from "three";
import { wildlifeSpots } from "@/lib/forest";
import { terrainHeight } from "@/lib/geography";
import { reducedMotion } from "@/lib/journey";
import { butterflyGeometry, rabbitGeometry, squirrelGeometry } from "./foliage";
import { paint, world } from "./shaders";

/**
 * Life on the forest floor, near wherever the camera flies low:
 * - Butterflies of the Western Ghats (Blue Mormon, Malabar Banded Peacock,
 *   Common Jezebel, Tawny Rajah, Malabar Tree Nymph), wandering on looping
 *   paths; their wings flap in the vertex shader.
 * - Rabbits that sit, nibble and hop about.
 * - Malabar giant squirrels that dash in short bursts and pause.
 * Animals move on the CPU (a few dozen instance matrices a frame).
 * With reduced motion they stay still.
 */

const BUTTERFLY_COLORS = ["#3e6fd8", "#2fa7a0", "#f2c14e", "#e86a2e", "#f4f1e6", "#c8452f"].map((c) => new Color(c));

/** Butterfly wings: each side rotates up and down about the body (needs an `aPhase` instance attribute). */
export function wingMaterial() {
  const wing = new MeshLambertMaterial({ vertexColors: true, side: DoubleSide, emissive: "#1c1c1c" });
  wing.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uTime = world.uTime;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;\nattribute float aPhase;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float flap = sin(uTime * 16.0 + aPhase * 6.2831) * 0.95 + 0.25;
        float side = sign(position.x);
        float ang = flap * side;
        transformed = vec3(position.x * cos(ang), abs(position.x) * sin(ang) + position.y, position.z);`,
      );
  };
  return wing;
}

type Animal = { x: number; z: number; homeX: number; homeZ: number; heading: number; timer: number; hop: number; r: number };

const makeAnimals = (spots: { x: number; z: number; r: number }[]): Animal[] =>
  spots.map((s) => ({ x: s.x, z: s.z, homeX: s.x, homeZ: s.z, heading: s.r * Math.PI * 2, timer: s.r * 4, hop: 0, r: s.r }));

/**
 * One step of a small animal's life: rest, then a burst of hops (or a dash)
 * in a new direction, turning back towards home if it strays too far.
 */
function live(a: Animal, dt: number, { rest, burst, speed, range }: { rest: number; burst: number; speed: number; range: number }) {
  a.timer -= dt;
  if (a.timer <= -burst) {
    a.timer = rest * (0.6 + a.r * 0.8);
    const home = Math.atan2(a.homeX - a.x, a.homeZ - a.z);
    const far = Math.hypot(a.homeX - a.x, a.homeZ - a.z) > range;
    a.heading = far ? home : a.heading + (Math.random() - 0.5) * 2.4;
  }
  const moving = a.timer < 0;
  if (moving) {
    a.x += Math.sin(a.heading) * speed * dt;
    a.z += Math.cos(a.heading) * speed * dt;
    a.hop += dt;
  } else {
    a.hop = 0;
  }
  return moving;
}

export function Wildlife({ density }: { density: number }) {
  const butterflies = useRef<InstancedMesh>(null);
  const rabbits = useRef<InstancedMesh>(null);
  const squirrels = useRef<InstancedMesh>(null);

  const spots = useMemo(
    () => ({
      butterflies: wildlifeSpots(Math.round(90 * density), 11, 6, 30),
      rabbits: makeAnimals(wildlifeSpots(Math.round(26 * density), 23, 9, 30)),
      squirrels: makeAnimals(wildlifeSpots(Math.round(22 * density), 37, 9, 34)),
    }),
    [density],
  );

  const geometries = useMemo(() => {
    const butterfly = butterflyGeometry();
    butterfly.setAttribute("aPhase", new InstancedBufferAttribute(new Float32Array(spots.butterflies.map((b) => b.r)), 1));
    return { butterfly, rabbit: rabbitGeometry(), squirrel: squirrelGeometry() };
  }, [spots]);

  const materials = useMemo(
    () => ({
      wing: wingMaterial(),
      fur: paint(new MeshLambertMaterial({ vertexColors: true }), { strokes: 0.35, strokeScale: 3, cloudShadows: false }),
    }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = butterflies.current!;
    spots.butterflies.forEach((b, i) => mesh.setColorAt(i, BUTTERFLY_COLORS[Math.floor(b.r * BUTTERFLY_COLORS.length * 0.999)]));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [spots]);

  const dummy = useMemo(() => new Object3D(), []);

  useFrame((_, delta) => {
    const still = reducedMotion();
    const dt = still ? 0 : Math.min(delta, 0.1);
    const t = world.uTime.value;

    // Butterflies: looping wander around their spot, a metre or three up
    spots.butterflies.forEach((b, i) => {
      const p = b.r * 20;
      const x = b.x + Math.sin(t * 0.35 + p) * 4 + Math.sin(t * 0.9 + p * 2) * 1.2;
      const z = b.z + Math.cos(t * 0.27 + p) * 4 + Math.cos(t * 1.1 + p) * 1.2;
      const y = b.ground + 1.4 + Math.sin(t * 0.8 + p) * 0.8 + Math.sin(t * 3.1 + p) * 0.15;
      const vx = Math.cos(t * 0.35 + p) * 0.35 * 4;
      const vz = -Math.sin(t * 0.27 + p) * 0.27 * 4;
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, Math.atan2(vx, vz), 0);
      dummy.scale.setScalar(0.85 + b.r * 0.45);
      dummy.updateMatrix();
      butterflies.current!.setMatrixAt(i, dummy.matrix);
    });
    butterflies.current!.instanceMatrix.needsUpdate = true;

    // Rabbits: rest and nibble, then a few hops
    spots.rabbits.forEach((a, i) => {
      const moving = live(a, dt, { rest: 5, burst: 1.2, speed: 2.4, range: 8 });
      const hop = moving ? Math.abs(Math.sin(a.hop * Math.PI * 2.5)) * 0.35 : Math.max(0, Math.sin(t * 6 + a.r * 9)) * 0.02;
      dummy.position.set(a.x, terrainHeight(a.x, a.z) + hop, a.z);
      dummy.rotation.set(moving ? -0.15 : 0, a.heading, 0);
      dummy.scale.setScalar(1.6 + a.r * 0.3);
      dummy.updateMatrix();
      rabbits.current!.setMatrixAt(i, dummy.matrix);
    });
    rabbits.current!.instanceMatrix.needsUpdate = true;

    // Squirrels: quick dashes, then a pause with a twitch
    spots.squirrels.forEach((a, i) => {
      const moving = live(a, dt, { rest: 3.5, burst: 0.7, speed: 5, range: 10 });
      const bob = moving ? Math.abs(Math.sin(a.hop * Math.PI * 6)) * 0.12 : 0;
      const twitch = moving ? 0 : Math.sin(t * 9 + a.r * 20) * 0.08;
      dummy.position.set(a.x, terrainHeight(a.x, a.z) + bob, a.z);
      dummy.rotation.set(0, a.heading + twitch, 0);
      dummy.scale.setScalar(2 + a.r * 0.4);
      dummy.updateMatrix();
      squirrels.current!.setMatrixAt(i, dummy.matrix);
    });
    squirrels.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={butterflies} args={[geometries.butterfly, materials.wing, spots.butterflies.length]} frustumCulled={false} />
      <instancedMesh ref={rabbits} args={[geometries.rabbit, materials.fur, spots.rabbits.length]} frustumCulled={false} />
      <instancedMesh ref={squirrels} args={[geometries.squirrel, materials.fur, spots.squirrels.length]} frustumCulled={false} />
    </group>
  );
}
