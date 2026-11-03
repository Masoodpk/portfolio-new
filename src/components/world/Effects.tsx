"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DepthOfField, EffectComposer, ToneMapping, wrapEffect } from "@react-three/postprocessing";
import { ToneMappingMode, type DepthOfFieldEffect } from "postprocessing";
import { KuwaharaEffect } from "@/components/fx/KuwaharaEffect";
import { PaperGrainEffect } from "@/components/fx/PaperGrain";
import { cameraFocus } from "./CameraRig";

const PaintStrokes = wrapEffect(KuwaharaEffect);
const PaperGrain = wrapEffect(PaperGrainEffect);

export type Tier = 0 | 1 | 2;

/** Per quality tier: Kuwahara radius (px), multisampling (smooth leaf edges) and depth of field. */
const TIERS = {
  0: { kuwahara: 2.5, msaa: 0, dof: false },
  1: { kuwahara: 3, msaa: 2, dof: false },
  2: { kuwahara: 3.5, msaa: 4, dof: true },
} as const;

/**
 * The painting pass, in order:
 * 1. Depth of field (top tier only): focused on what the camera looks at,
 *    so foreground rocks and leaves blur softly.
 * 2. Kuwahara: pixels become paint strokes.
 * 3. ACES tone mapping.
 * 4. Paper, grain, colour grade and vignette.
 */
export function Effects({ tier }: { tier: Tier }) {
  const settings = TIERS[tier];
  const dof = useRef<DepthOfFieldEffect>(null);

  useFrame(() => {
    if (dof.current?.target) dof.current.target.copy(cameraFocus);
  });

  return (
    <EffectComposer multisampling={settings.msaa} enableNormalPass={false}>
      {settings.dof ? <DepthOfField ref={dof} target={[0, 0, 0]} worldFocusRange={420} bokehScale={2.2} height={540} /> : null}
      <PaintStrokes radius={settings.kuwahara} strength={0.85} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <PaperGrain strength={1} />
    </EffectComposer>
  );
}
