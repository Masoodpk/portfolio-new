"use client";

import { useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { MathUtils, Mesh, MeshLambertMaterial } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { profile } from "@/data/content";
import { NAME } from "@/lib/cameraPath";
import { chapterProgress } from "@/lib/journey";
import { capturing } from "@/lib/worldState";
import { paint } from "./shaders";

const FONT = "/fonts/cormorant-garamond.typeface.json";

/**
 * The giant name standing in the forest in front of the main peak. From the
 * opening shot it faces the camera squarely and reads like flat type laid
 * over the painting; as the camera pushes forward and swings past, it turns
 * to show its bevelled depth and slides out of frame.
 * Font: Cormorant Garamond, converted by `npm run typeface`. (Built with
 * TextGeometry directly: drei's <Text3D> still passes the old `height`
 * option, which current three.js ignores in favour of `depth`.)
 */
export function Name3D() {
  const font = useLoader(FontLoader, FONT);
  const ref = useRef<Mesh>(null);
  // Stills are painted without the name: the page sets its own title over them.
  const capture = useMemo(() => capturing(), []);

  // Stays in the world while the camera is in front of it or flying over it
  // (it slides out of the frame naturally); hidden only once it is behind the
  // camera, and in the final wide shot (where the Contact panel would cut it in half).
  // Narrow (portrait) screens: a smaller name so it still fits the opening shot.
  const aspect = useThree((s) => s.size.width / s.size.height);
  const scale = Math.min(1, 0.52 + aspect * 0.5);

  // It opens as flat, plain white type over the mountains; as the visitor
  // starts to scroll it gains its depth and bevel and settles into its
  // painted colour, while the camera swings round to show it in 3D.
  useFrame(({ camera }) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = camera.position.z > NAME.position.z - 25 && chapterProgress("contact") < 0.3 && !capture;
    const solid = MathUtils.smootherstep(chapterProgress("home"), 0.02, 0.32);
    mesh.scale.set(scale, scale, scale * (0.015 + 0.985 * solid));
    const material = mesh.material as MeshLambertMaterial;
    material.emissiveIntensity = MathUtils.lerp(1.1, 0.22, solid);
  });

  const geometry = useMemo(() => {
    const geo = new TextGeometry(profile.name, {
      font,
      size: NAME.size,
      depth: NAME.size * 0.2,
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: NAME.size * 0.03,
      bevelSize: NAME.size * 0.016,
      bevelSegments: 3,
    });
    geo.center();
    return geo;
  }, [font]);

  const material = useMemo(
    () =>
      paint(new MeshLambertMaterial({ color: "#fbf8f0", emissive: "#fffdf6" }), {
        strokes: 0.4,
        strokeScale: 0.11,
        cloudShadows: false,
        fog: 0.35,
      }),
    [],
  );

  return <mesh ref={ref} geometry={geometry} material={material} position={NAME.position} rotation={[0, NAME.rotationY, 0]} scale={[scale, scale, scale * 0.015]} />;
}

useLoader.preload(FontLoader, FONT);
