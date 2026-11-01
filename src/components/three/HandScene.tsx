"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, invalidate, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import {
  type AnimationAction,
  AnimationMixer,
  Box3,
  LoopOnce,
  MathUtils,
  Vector3,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import { poseAt, SNAP_CLIP } from "./hand-timeline";

export const HAND_MODEL_URL = "/models/hand.glb";

/** Mutable state shared between the DOM (scroll, pointer) and the render loop. */
export type HandController = {
  progress: number;
  pointerX: number;
  pointerY: number;
};

type HandSceneProps = {
  controller: RefObject<HandController>;
  active: boolean;
  compact: boolean;
  /** Called after the first frame with a way to request frames, so DOM code never imports R3F */
  onReady: (requestFrame: () => void) => void;
  onSnapChange: (snapped: boolean) => void;
};

export default function HandScene({ controller, active, compact, onReady, onSnapChange }: HandSceneProps) {
  return (
    <Canvas
      frameloop={active ? "demand" : "never"}
      dpr={compact ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 30, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.25} />
      {/* Warm key from upper right */}
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#fff1e6" />
      {/* Brand-orange rim from behind */}
      <directionalLight position={[-4, 1.5, -3]} intensity={4} color="#ff5f1f" />
      {/* Faint cool fill so shadows aren't dead */}
      <directionalLight position={[-3, -2, 4]} intensity={0.35} color="#b8c4ff" />

      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[2, 3, 4]} scale={[4, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={3} position={[-4, 0, -3]} scale={[2, 6, 1]} color="#ff5f1f" />
        <Lightformer form="ring" intensity={0.6} position={[0, -4, 2]} scale={3} color="#8a95ff" />
      </Environment>

      <Suspense fallback={null}>
        <Hand controller={controller} onReady={onReady} onSnapChange={onSnapChange} />
      </Suspense>
    </Canvas>
  );
}

function Hand({
  controller,
  onReady,
  onSnapChange,
}: Pick<HandSceneProps, "controller" | "onReady" | "onSnapChange">) {
  // Draco off (asset uses meshopt, whose decoder ships with three — no CDN fetch).
  const { scene, animations } = useGLTF(HAND_MODEL_URL, false, true);
  const group = useRef<Group>(null);
  const state = useRef({ t: 0, snapped: false, readyFired: false });

  // Normalise size and centre on the hand, so the rig's units don't matter.
  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = 2.6 / Math.max(size.y, 1e-6);
    return { scale: s, offset: center.multiplyScalar(-s) };
  }, [scene]);

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      // Skinned bounds lag behind bone motion; never cull the only object on screen.
      mesh.frustumCulled = false;
      const material = mesh.material as MeshStandardMaterial;
      material.envMapIntensity = 0.7;
    });
  }, [scene]);

  const rig = useRef<{ mixer: AnimationMixer; snap: AnimationAction; recovery: AnimationAction } | null>(
    null,
  );

  useEffect(() => {
    const m = new AnimationMixer(scene);
    const setup = (name: string) => {
      const clip = animations.find((a) => a.name === name);
      if (!clip) throw new Error(`Hand model is missing the "${name}" animation`);
      const action = m.clipAction(clip);
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      action.paused = true;
      return action;
    };
    rig.current = { mixer: m, snap: setup("Snap"), recovery: setup("Recovery") };
    invalidate();
    return () => {
      m.stopAllAction();
      rig.current = null;
    };
  }, [scene, animations]);

  useFrame((_, rawDelta) => {
    if (!rig.current) return;
    const { mixer, snap, recovery } = rig.current;
    const input = controller.current;
    const delta = Math.min(rawDelta, 1 / 30);
    const pose = poseAt(input.progress);
    const s = state.current;

    // Snap playhead: scrubbed during build-up, real time once triggered.
    const end = SNAP_CLIP.duration - 1e-3;
    if (pose.triggered) {
      s.t = Math.min(end, Math.max(s.t, SNAP_CLIP.tensionEnd) + delta);
    } else {
      s.t = MathUtils.damp(s.t, pose.snapTarget, 12, delta);
    }

    const released = s.t >= SNAP_CLIP.release;
    if (released !== s.snapped) {
      s.snapped = released;
      onSnapChange(released);
    }

    // Recovery only takes over once the snap has fully played.
    const recoveryWeight = s.t >= end - 0.01 ? pose.recoveryWeight : 0;
    snap.time = s.t;
    snap.setEffectiveWeight(1 - recoveryWeight);
    recovery.time = Math.min(pose.recoveryTime, recovery.getClip().duration - 1e-3);
    recovery.setEffectiveWeight(recoveryWeight);
    mixer.update(0);

    let moving = pose.triggered ? s.t < end : Math.abs(s.t - pose.snapTarget) > 1e-4;

    const g = group.current;
    if (g) {
      const targetY = pose.rotationY + input.pointerX * 0.12;
      const targetX = pose.rotationX + input.pointerY * 0.08;
      g.rotation.y = MathUtils.damp(g.rotation.y, targetY, 6, delta);
      g.rotation.x = MathUtils.damp(g.rotation.x, targetX, 6, delta);
      g.rotation.z = MathUtils.damp(g.rotation.z, pose.rotationZ, 6, delta);
      moving ||=
        Math.abs(g.rotation.y - targetY) > 1e-4 ||
        Math.abs(g.rotation.x - targetX) > 1e-4 ||
        Math.abs(g.rotation.z - pose.rotationZ) > 1e-4;
    }

    if (!s.readyFired) {
      s.readyFired = true;
      onReady(() => invalidate());
    }
    // Demand mode: keep rendering only while something is still settling.
    if (moving) invalidate();
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={scale} position={offset} />
    </group>
  );
}

useGLTF.preload(HAND_MODEL_URL, false, true);
