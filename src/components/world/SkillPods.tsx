"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  CylinderGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  SpriteMaterial,
  Vector3,
} from "three";
import { skills } from "@/data/content";
import { cameraAt } from "@/lib/cameraPath";
import { chapterProgress } from "@/lib/journey";
import { GIANT_TREE } from "@/lib/scenes";
import { terrainHeight } from "@/lib/geography";
import { butterflyGeometry } from "./foliage";
import { wingMaterial } from "./Wildlife";
import { world } from "./shaders";

/**
 * The skills, hanging from the ancient tree as glowing seed pods.
 *
 * Each skill gets a moment in the Skills chapter (spread from 15% to 90%).
 * Its pod hangs where the camera will be looking at that moment, between
 * the camera and the trunk, so pods light up one after another as the
 * camera circles. Each label appears in serif as its pod lights, then fades
 * as the camera moves on. Decorative: the skills are listed in the page too.
 */

const FIRST = 0.15;
const LAST = 0.9;

function glowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,250,210,1)");
  g.addColorStop(0.25, "rgba(233,242,122,0.55)");
  g.addColorStop(1, "rgba(233,242,122,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

export function SkillPods() {
  const pods = useMemo(() => {
    const centre = new Vector3(GIANT_TREE.x, 0, GIANT_TREE.z);
    const cam = new Vector3();
    return skills.map((skill, i) => {
      const at = FIRST + (i / Math.max(1, skills.length - 1)) * (LAST - FIRST);
      cameraAt("skills", at, cam);
      // Between the camera and the trunk, a little to one side, at about eye height
      const dir = new Vector3(cam.x - centre.x, 0, cam.z - centre.z).normalize();
      dir.applyAxisAngle(new Vector3(0, 1, 0), (i % 2 ? 1 : -1) * 0.38);
      const x = centre.x + dir.x * 15;
      const z = centre.z + dir.z * 15;
      const ground = terrainHeight(x, z);
      const y = Math.max(ground + 6, cam.y + (i % 3) * 3.5 - 1);
      return { skill, at, position: new Vector3(x, y, z) };
    });
  }, []);

  const { podGeometry, vineGeometry, glow } = useMemo(
    () => ({
      podGeometry: new SphereGeometry(0.75, 14, 10).scale(0.8, 1.25, 0.8),
      vineGeometry: new CylinderGeometry(0.06, 0.08, 8, 4, 1, true).translate(0, 4.6, 0),
      glow: glowTexture(),
    }),
    [],
  );

  const podRefs = useRef<(Mesh | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const materials = useMemo(
    () =>
      pods.map(
        () =>
          new MeshStandardMaterial({
            color: new Color("#c5d86d"),
            emissive: new Color("#e9f27a"),
            emissiveIntensity: 0.1,
            roughness: 0.6,
          }),
      ),
    [pods],
  );
  const glowMaterials = useMemo(
    () => pods.map(() => new SpriteMaterial({ map: glow, color: "#e9f27a", transparent: true, blending: AdditiveBlending, depthWrite: false, opacity: 0 })),
    [pods, glow],
  );
  const vine = useMemo(() => new MeshLambertMaterial({ color: "#3f5530" }), []);

  useFrame(() => {
    const p = chapterProgress("skills");
    pods.forEach((pod, i) => {
      const lit = Math.min(1, Math.max(0, (p - pod.at + 0.03) / 0.05));
      const label = Math.min(lit, 1 - Math.min(1, Math.max(0, (p - pod.at - 0.1) / 0.06)));
      materials[i].emissiveIntensity = 0.1 + lit * 1.1;
      glowMaterials[i].opacity = lit * 0.5;
      const el = labelRefs.current[i];
      if (el) {
        el.style.opacity = String(label);
        el.style.transform = `translateY(${(1 - label) * 8}px)`;
      }
      const mesh = podRefs.current[i];
      if (mesh) mesh.position.y = Math.sin(world.uTime.value * 0.8 + i) * 0.25; // a gentle sway on its vine
    });
  });

  return (
    <group>
      {pods.map((pod, i) => (
        <group key={pod.skill.id} position={pod.position}>
          <mesh geometry={vineGeometry} material={vine} />
          <mesh ref={(m) => void (podRefs.current[i] = m)} geometry={podGeometry} material={materials[i]} />
          <sprite material={glowMaterials[i]} scale={[6, 6, 1]} />
          <Html position={[0, -1.8, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div
              ref={(el) => void (labelRefs.current[i] = el)}
              aria-hidden="true"
              className="scene-label whitespace-nowrap text-center opacity-0 transition-none"
            >
              <span className="on-scene font-display block text-2xl italic text-mist">{pod.skill.name}</span>
              <span className="on-scene eyebrow block text-[0.6rem] text-firefly/90">
                {pod.skill.usage === "professional" ? "Used at work" : "Studied & personal"}
              </span>
            </div>
          </Html>
        </group>
      ))}
      <TreeButterflies />
    </group>
  );
}

/** Two big butterflies (a Blue Mormon and a Malabar Banded Peacock) circling the trunk. */
function TreeButterflies() {
  const ref = useRef<InstancedMesh>(null);
  const { geometry, material } = useMemo(() => {
    const geometry = butterflyGeometry();
    geometry.setAttribute("aPhase", new InstancedBufferAttribute(new Float32Array([0.1, 0.6]), 1));
    return { geometry, material: wingMaterial() };
  }, []);
  const dummy = useMemo(() => new Object3D(), []);
  const ground = useMemo(() => terrainHeight(GIANT_TREE.x, GIANT_TREE.z), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = world.uTime.value;
    for (let i = 0; i < 2; i++) {
      const a = t * (0.32 + i * 0.07) + i * Math.PI;
      const r = 11 + Math.sin(t * 0.5 + i) * 2.5;
      dummy.position.set(GIANT_TREE.x + Math.cos(a) * r, ground + 14 + i * 9 + Math.sin(t * 0.9 + i * 2) * 3, GIANT_TREE.z + Math.sin(a) * r);
      dummy.rotation.set(0, -a, 0); // fly along the circle
      dummy.scale.setScalar(2.2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, new Color(i === 0 ? "#3e6fd8" : "#2fa7a0"));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometry, material, 2]} frustumCulled={false} />;
}
