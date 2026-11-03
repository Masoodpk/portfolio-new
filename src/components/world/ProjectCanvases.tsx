"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, CanvasTexture, Group, MeshLambertMaterial, PlaneGeometry, SRGBColorSpace } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { projects, type Project } from "@/data/content";
import { PROJECT_FRAMES, projectHover } from "@/lib/scenes";
import { mossyRockGeometry } from "./foliage";
import { paint } from "./shaders";

/**
 * CHAPTER 5 · THE RIVER: each project as a large framed canvas standing on
 * a mossy rock by the water, with its picture painted on (the Kuwahara pass
 * turns the screenshot into paint). Hovering the project's card on the page
 * tilts its canvas slightly (and the river ripples, see River.tsx).
 */

const W = 19;
const H = 11.9;

/** Paint a project's canvas: its cover image (or a sketch of the interface) and a title band. */
function paintCanvas(project: Project, image: HTMLImageElement | null) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#efe6d0";
  ctx.fillRect(0, 0, 1024, 640);
  if (image) {
    // Cover-fit the screenshot, top-aligned
    const scale = Math.max(1024 / image.naturalWidth, 540 / image.naturalHeight);
    ctx.drawImage(image, (1024 - image.naturalWidth * scale) / 2, 0, image.naturalWidth * scale, image.naturalHeight * scale);
  } else {
    // A hand-drawn sketch of a dashboard (the real product UI is confidential)
    ctx.fillStyle = "#24453a";
    ctx.fillRect(0, 0, 150, 540);
    ctx.fillStyle = "#f2c14e";
    ctx.fillRect(28, 40, 70, 18);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i === 1 ? "#c5d86d" : "#5c7a66";
      ctx.fillRect(28, 100 + i * 50, 94, 12);
    }
    ctx.fillStyle = "#d9ccb0";
    ctx.fillRect(180, 30, 810, 40);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === 0 ? "#f2c14e" : "#c9bb9c";
      ctx.fillRect(180 + i * 205, 100, 185, 90);
    }
    ctx.strokeStyle = "#2f5a3c";
    ctx.lineWidth = 6;
    ctx.beginPath();
    [0, 0.2, 0.15, 0.45, 0.4, 0.7, 0.62, 0.9].forEach((v, i) => ctx.lineTo(200 + i * 100, 470 - v * 210));
    ctx.stroke();
  }
  // The title band, like a label painted on the bottom of the canvas
  ctx.fillStyle = "rgba(30, 59, 44, 0.92)";
  ctx.fillRect(0, 540, 1024, 100);
  ctx.fillStyle = "#f3efe4";
  ctx.font = "italic 600 58px 'Cormorant Garamond', Georgia, serif";
  ctx.fillText(project.name, 36, 608);
  ctx.font = "500 24px 'DM Sans', sans-serif";
  ctx.fillStyle = "#c5d86d";
  ctx.textAlign = "right";
  ctx.fillText(project.stack.slice(0, 3).join(" · "), 990, 604);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function Canvas3D({ index }: { index: number }) {
  const frame = PROJECT_FRAMES[index];
  const project = projects[index];
  const tiltRef = useRef<Group>(null);

  const parts = useMemo(() => {
    const border = 0.45;
    const wood = mergeGeometries([
      new BoxGeometry(W + border * 2, border, 0.4).translate(0, H / 2 + border / 2, 0),
      new BoxGeometry(W + border * 2, border, 0.4).translate(0, -H / 2 - border / 2, 0),
      new BoxGeometry(border, H, 0.4).translate(-W / 2 - border / 2, 0, 0),
      new BoxGeometry(border, H, 0.4).translate(W / 2 + border / 2, 0, 0),
      // Two legs, like an easel set on the rock
      new BoxGeometry(0.5, 5, 0.5).translate(-W / 3, -H / 2 - 2.2, -0.4),
      new BoxGeometry(0.5, 5, 0.5).translate(W / 3, -H / 2 - 2.2, -0.4),
    ])!;
    return {
      wood,
      woodMaterial: paint(new MeshLambertMaterial({ color: "#6b4f34" }), { strokeScale: 0.4, cloudShadows: false }),
      plane: new PlaneGeometry(W, H),
      canvasMaterial: new MeshLambertMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.12 }),
      rock: mossyRockGeometry(),
      rockMaterial: paint(new MeshLambertMaterial({ vertexColors: true, flatShading: true }), { strokeScale: 0.25 }),
    };
  }, []);

  // Paint the canvas once its image has loaded (or straight away for a sketch).
  useEffect(() => {
    const cover = project.visuals.find((v) => v.kind === "image");
    const apply = (image: HTMLImageElement | null) => {
      parts.canvasMaterial.map = paintCanvas(project, image);
      parts.canvasMaterial.emissiveMap = parts.canvasMaterial.map;
      parts.canvasMaterial.needsUpdate = true;
    };
    if (!cover || cover.kind !== "image") {
      document.fonts.ready.then(() => apply(null));
      return;
    }
    const image = new Image();
    image.onload = () => document.fonts.ready.then(() => apply(image));
    image.src = cover.src;
  }, [parts, project]);

  // Hover: lean back a touch and turn towards the river
  useFrame((_, delta) => {
    const g = tiltRef.current;
    if (!g) return;
    const on = projectHover.slug === frame.slug ? 1 : 0;
    const k = 1 - Math.exp(-delta * 4);
    g.rotation.x += (-0.08 * on - g.rotation.x) * k;
    g.rotation.z += ((index % 2 ? 0.05 : -0.05) * on - g.rotation.z) * k;
  });

  return (
    <group position={frame.position} rotation={[0, frame.rotationY, 0]}>
      <mesh geometry={parts.rock} material={parts.rockMaterial} scale={[8, 3.4, 5]} position={[0, -0.6, 0]} />
      <group ref={tiltRef} position={[0, 2.2 + H / 2 + 2.6, 0]}>
        <mesh geometry={parts.wood} material={parts.woodMaterial} />
        <mesh geometry={parts.plane} material={parts.canvasMaterial} position={[0, 0, 0.21]} />
      </group>
    </group>
  );
}

export function ProjectCanvases() {
  return (
    <group>
      {PROJECT_FRAMES.map((_, i) => (
        <Canvas3D key={PROJECT_FRAMES[i].slug} index={i} />
      ))}
    </group>
  );
}
