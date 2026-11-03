"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, DoubleSide, InstancedMesh, MeshLambertMaterial, Object3D } from "three";
import { terrainHeight } from "@/lib/geography";
import { plantUnderstory, type Plant } from "@/lib/forest";
import { cardFernGeometry, FOLIAGE_TONE, foliageAtlas, grassTuftGeometry } from "./foliageCards";
import { broadleafGeometry, flowerHeadsGeometry, flowerStemsGeometry, logGeometry, mossyRockGeometry, mushroomGeometry } from "./foliage";
import { paint } from "./shaders";

/** Ferns: mostly fresh greens, a few dried to bronze. */
const FERN_GREENS = ["#5d8a4f", "#6f9a58", "#7fa65f", "#8fb46a", "#6b9447", "#a8845a", "#b49060"].map((c) => new Color(c));
const GRASS = ["#9cb85a", "#a9bf62", "#8aa84e", "#b9c06a"].map((c) => new Color(c));
const LEAF_GREENS = ["#2f5a3c", "#3d6a3a", "#4f7f3f", "#6b9447"].map((c) => new Color(c));
const CAPS = ["#d9b26a", "#c98a4b", "#e8dcc4", "#e39bb0", "#c8452f"].map((c) => new Color(c));
/** Kerala wildflowers: ixora red and orange, balsam pink, wild daisy white, golden yellow, orchid purple. */
const BLOSSOMS = ["#d8342a", "#f07a2a", "#ec7fb0", "#f6f1e4", "#f2c14e", "#a678c8"].map((c) => new Color(c));

const uniform = (s: number, squash = 1): [number, number, number] => [s, s * squash, s];

/** Write one instanced mesh's matrices (and colours) from a list of plants. */
function place(mesh: InstancedMesh, list: readonly Plant[], scale: (p: Plant) => [number, number, number], color?: (p: Plant) => Color, lift = 0) {
  const dummy = new Object3D();
  list.forEach((p, i) => {
    dummy.position.set(p.x, p.ground + lift, p.z);
    dummy.rotation.set(0, p.rot, 0);
    dummy.scale.set(...scale(p));
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    if (color) mesh.setColorAt(i, color(p));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

/**
 * The forest floor: a small world of its own around every stretch where the
 * camera flies low. Ferns (painted frond cards, some dried to bronze), grass
 * tufts, broad-leaved plants (elephant ear, wild banana),
 * mossy rocks, fallen logs, clusters of mushrooms and wildflowers. All instanced; nothing
 * planted in the camera's corridor.
 */
export function Understory({ density }: { density: number }) {
  const plants = useMemo(() => plantUnderstory(density), [density]);
  // Grass tufts: a few around each fern and flower, on the ground beside them
  const tufts = useMemo(
    () =>
      [...plants.ferns, ...plants.flowers].flatMap((p, i) =>
        [0, 1].map((k) => {
          const a = p.rot + k * 2.6 + i;
          const x = p.x + Math.cos(a) * (2.2 + p.size * 2);
          const z = p.z + Math.sin(a) * (2.2 + p.size * 2);
          return { ...p, x, z, ground: terrainHeight(x, z), rot: a, hue: (p.hue * 3.7 + k * 0.31) % 1 };
        }),
      ),
    [plants],
  );

  const ferns = useRef<InstancedMesh>(null);
  const grass = useRef<InstancedMesh>(null);
  const broadleaves = useRef<InstancedMesh>(null);
  const rocks = useRef<InstancedMesh>(null);
  const logs = useRef<InstancedMesh>(null);
  const mushrooms = useRef<InstancedMesh>(null);
  const stems = useRef<InstancedMesh>(null);
  const blossoms = useRef<InstancedMesh>(null);

  const geometries = useMemo(
    () => ({
      fern: cardFernGeometry(),
      grass: grassTuftGeometry(),
      broadleaf: broadleafGeometry(),
      rock: mossyRockGeometry(),
      log: logGeometry(),
      mushroom: mushroomGeometry(),
      stems: flowerStemsGeometry(),
      blossoms: flowerHeadsGeometry(),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      fern: (() => {
        const m = paint(new MeshLambertMaterial({ map: foliageAtlas(), color: FOLIAGE_TONE, vertexColors: true, alphaTest: 0.5, side: DoubleSide }), {
          wind: true,
          swayHeight: 0,
          swayScale: 0.1,
          strokes: 0.3,
          strokeScale: 0.5,
          foliage: true,
        });
        return m;
      })(),
      broadleaf: paint(new MeshLambertMaterial({ side: 2 }), { wind: true, swayHeight: 0.3, swayScale: 0.18, strokeScale: 0.35 }),
      rock: paint(new MeshLambertMaterial({ vertexColors: true, flatShading: true }), { strokeScale: 0.4 }),
      log: paint(new MeshLambertMaterial({ color: "#5a4a36" }), { strokeScale: 0.3, cloudShadows: false }),
      mushroom: paint(new MeshLambertMaterial(), { strokes: 0.6, strokeScale: 1.2, cloudShadows: false }),
      stems: paint(new MeshLambertMaterial({ color: "#4f7f3f" }), { wind: true, swayHeight: 0, swayScale: 0.4, strokes: 0.5, cloudShadows: false }),
      blossoms: paint(new MeshLambertMaterial({ emissive: "#2a1a10" }), { wind: true, swayHeight: 0, swayScale: 0.4, strokes: 0.4, strokeScale: 2, cloudShadows: false }),
    }),
    [],
  );

  useLayoutEffect(() => {
    const pick = (palette: Color[]) => (p: Plant) => palette[Math.floor(p.hue * palette.length * 0.999)];
    place(ferns.current!, plants.ferns, (p) => uniform(1.6 + p.size * 2.4, 0.85), pick(FERN_GREENS));
    place(grass.current!, tufts, (p) => uniform(0.9 + p.size * 1.3, 0.8 + p.size * 0.6), pick(GRASS), -0.1);
    place(broadleaves.current!, plants.broadleaves, (p) => uniform(2 + p.size * 2.6), pick(LEAF_GREENS));
    place(rocks.current!, plants.rocks, (p) => uniform(0.8 + p.size * 2.4), undefined, -0.2);
    place(logs.current!, plants.logs, (p) => uniform(9 + p.size * 8, 0.9));
    place(mushrooms.current!, plants.mushrooms, (p) => uniform(0.25 + p.size * 0.45), pick(CAPS));
    place(stems.current!, plants.flowers, (p) => uniform(1.6 + p.size * 1.6));
    place(blossoms.current!, plants.flowers, (p) => uniform(1.6 + p.size * 1.6), pick(BLOSSOMS));
  }, [plants, tufts]);

  return (
    <group>
      <instancedMesh ref={ferns} args={[geometries.fern, materials.fern, plants.ferns.length]} frustumCulled={false} />
      <instancedMesh ref={grass} args={[geometries.grass, materials.fern, tufts.length]} frustumCulled={false} />
      <instancedMesh ref={broadleaves} args={[geometries.broadleaf, materials.broadleaf, plants.broadleaves.length]} frustumCulled={false} />
      <instancedMesh ref={rocks} args={[geometries.rock, materials.rock, plants.rocks.length]} frustumCulled={false} />
      <instancedMesh ref={logs} args={[geometries.log, materials.log, plants.logs.length]} frustumCulled={false} />
      <instancedMesh ref={mushrooms} args={[geometries.mushroom, materials.mushroom, plants.mushrooms.length]} frustumCulled={false} />
      <instancedMesh ref={stems} args={[geometries.stems, materials.stems, plants.flowers.length]} frustumCulled={false} />
      <instancedMesh ref={blossoms} args={[geometries.blossoms, materials.blossoms, plants.flowers.length]} frustumCulled={false} />
    </group>
  );
}
