"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { NoToneMapping, SRGBColorSpace } from "three";
import { reportProgress } from "@/lib/worldState";
import { CameraRig } from "./CameraRig";
import { Canopy } from "./Canopy";
import { Effects, type Tier } from "./Effects";
import { Mist } from "./Mist";
import { Mountains } from "./Mountains";
import { Name3D } from "./Name3D";
import { River } from "./River";
import { Sky } from "./Sky";
import { Terrain } from "./Terrain";
import { Understory } from "./Understory";
import { Wildlife } from "./Wildlife";
import { CanopyDive } from "./CanopyDive";
import { GiantTree } from "./GiantTree";
import { SkillPods } from "./SkillPods";
import { ProjectCanvases } from "./ProjectCanvases";
import { Waterfall } from "./Waterfall";
import { JourneyLedges } from "./JourneyLedges";
import { NightForest } from "./NightForest";

/** Resolution per quality tier. The paint filter smooths detail, so it doesn't need full resolution. */
const DPR: Record<Tier, number> = { 0: 1, 1: 1.25, 2: 1.5 };

/** World detail fixed at load: phones and small screens get a lighter forest. */
function pickDetail() {
  const small = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  return small
    ? { small, terrain: 220, near: 3000, palms: 80, understory: 0.45, wildlife: 0.5, leaves: 10, rays: 8, pollen: 260, mist: 7, spray: 450, rain: 1200, fireflies: 180, fungi: 40, tier: 0 as Tier }
    : { small, terrain: 360, near: 6500, palms: 200, understory: 1, wildlife: 1, leaves: 18, rays: 16, pollen: 700, mist: 12, spray: 900, rain: 2000, fireflies: 320, fungi: 70, tier: 2 as Tier };
}

/**
 * The painted world: one fixed full-screen canvas behind the page.
 * Quality adapts while it runs (drei's PerformanceMonitor): if frames drop,
 * the tier steps down (lower resolution, gentler paint filter, no depth of
 * field); if there's headroom again, it steps back up.
 */
export default function Scene() {
  const detail = useMemo(() => pickDetail(), []);
  // Loading milestones for the painted-leaf loader
  useEffect(() => reportProgress(0.4), []);
  const [tier, setTier] = useState<Tier>(detail.tier);
  const maxTier: Tier = detail.small ? 1 : 2;

  return (
    <Canvas
      dpr={DPR[tier]}
      // Opaque canvas: soft leaf edges write partial alpha, which must not let the page show through.
      gl={{ alpha: false, antialias: false, powerPreference: "high-performance", toneMapping: NoToneMapping, outputColorSpace: SRGBColorSpace }}
      camera={{ fov: 40, near: 2, far: 9000, position: [0, 100, 600] }}
      // The page scrolls over the canvas; the canvas itself never takes the pointer.
      style={{ pointerEvents: "none" }}
      onCreated={() => reportProgress(0.65)}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setTier((t) => Math.max(0, t - 1) as Tier)}
        onIncline={() => setTier((t) => Math.min(maxTier, t + 1) as Tier)}
      />
      <Sky />
      <Mountains />
      <Terrain segments={detail.terrain} />
      <River />
      <Waterfall spray={detail.spray} />
      <JourneyLedges />
      <Canopy near={detail.near} palms={detail.palms} />
      <Understory density={detail.understory} />
      <Wildlife density={detail.wildlife} />
      <CanopyDive leaves={detail.leaves} rays={detail.rays} pollen={detail.pollen} />
      <GiantTree />
      <SkillPods />
      <ProjectCanvases />
      <Mist count={detail.mist} />
      <NightForest rain={detail.rain} fireflies={detail.fireflies} fungi={detail.fungi} />
      <Suspense fallback={null}>
        <Name3D />
        <Ready />
      </Suspense>
      <CameraRig />
      <Effects tier={tier} />
    </Canvas>
  );
}

/**
 * Mounts once everything suspended (the name's font) has loaded; after a
 * few drawn frames (shaders compiled, the paint filter warmed up) the
 * forest is ready and the loader can step aside.
 */
function Ready() {
  const frames = useRef(0);
  useEffect(() => reportProgress(0.85), []);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 6) reportProgress(1);
  });
  return null;
}
