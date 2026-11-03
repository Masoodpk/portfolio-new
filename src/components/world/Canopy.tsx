"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Color, CylinderGeometry, DoubleSide, InstancedMesh, MeshLambertMaterial, Object3D, TubeGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { river, riverAt, scatterTrees, terrainHeight, WORLD, type TreeSpot } from "@/lib/geography";
import { blocksPath } from "@/lib/forest";
import { inGlade } from "@/lib/scenes";
import { buttressTrunkGeometry, palmCrownGeometry, palmTrunkGeometry } from "./foliage";
import { FOLIAGE_TONE, foliageAtlas, leafyCrownGeometry, tieredTreeGeometry } from "./foliageCards";
import { paint } from "./shaders";

/**
 * Foliage colours. The painted cards are grey; these give each tree its
 * green (leafy crowns from deep jungle to sunlit lime, the tiered evergreens
 * a darker blue-green), with the odd flowering tree (ochre, flame red, orchid pink).
 */
const LEAFY = ["#4f7a45", "#5d8a45", "#6b9447", "#7fa650", "#8db75f", "#a2c46a"].map((c) => new Color(c));
const TIERED = ["#41683f", "#4f7a4c", "#5f8a5a", "#3d6247", "#6d9466"].map((c) => new Color(c));
const BLOOMS = [new Color("#f2c14e"), new Color("#d8553a"), new Color("#e8a0b8")];

type Tree = TreeSpot & { emergent: boolean; tiered: boolean };

/** Palms along both riverbanks in the lowlands (arecanut and coconut country). */
function plantPalms(max: number) {
  const palms: { x: number; z: number; ground: number; height: number; lean: number; rot: number; size: number }[] = [];
  const side = new Vector3();
  for (let i = 0; i < 260 && palms.length < max; i++) {
    const t = 0.32 + (i / 260) * 0.66;
    const p = riverAt(t);
    if (p.z < WORLD.cliffZ + 30) continue;
    const tangent = river.getTangentAt(t);
    side.set(-tangent.z, 0, tangent.x).normalize();
    const s = i % 2 ? 1 : -1;
    const r = Math.sin(i * 91.7) * 0.5 + 0.5;
    const off = WORLD.riverHalfWidth * (1.9 + r * 1.6) * s;
    const x = p.x + side.x * off + Math.cos(i * 3.1) * 4;
    const z = p.z + side.z * off + Math.sin(i * 2.3) * 4;
    const ground = terrainHeight(x, z);
    // Palms like flat, wet ground: none on the gorge walls or steep banks
    if (Math.abs(terrainHeight(x + 4, z) - ground) > 2.5 || Math.abs(terrainHeight(x, z + 4) - ground) > 2.5) continue;
    const height = 15 + r * 9;
    if (blocksPath(x, z, 7, ground + height + 4)) continue;
    palms.push({ x, z, ground, height, lean: (r - 0.5) * 0.35 + s * 0.12, rot: i * 1.7, size: 5.5 + r * 2 });
  }
  return palms;
}

/**
 * The rainforest as instanced meshes:
 * - Near the camera's route: broadleaf trees (crowns of painted leaf-cluster
 *   cards on buttressed trunks), tiered evergreens (whorls of painted
 *   branch sprays up a slim trunk), and the odd emergent giant with a wide
 *   umbrella crown. See foliageCards.ts.
 * - Lianas draped from some crowns near the route.
 * - Along the river: palms.
 * - Up in the Ghats the forest is painted onto the terrain (Terrain.tsx).
 * Nothing is planted where it would touch the camera's flight path.
 */
export function Canopy({ near, palms: palmCount }: { near: number; palms: number }) {
  const leafy = useRef<InstancedMesh>(null);
  const tiered = useRef<InstancedMesh>(null);
  const trunks = useRef<InstancedMesh>(null);
  const poles = useRef<InstancedMesh>(null);
  const palmTrunks = useRef<InstancedMesh>(null);
  const palmCrowns = useRef<InstancedMesh>(null);

  const forest = useMemo(() => {
    const spots = scatterTrees(near, 0);
    const nearTrees: Tree[] = [];
    for (const t of spots.near) {
      const emergent = t.hue > 0.9;
      // Tiered evergreens grow more the higher the ground; the lowlands stay mostly broadleaf
      const tiered = !emergent && (t.hue * 7.31) % 1 < 0.3 + Math.min(1, Math.max(0, t.ground / 140)) * 0.45;
      const tree = emergent ? { ...t, height: t.height * 1.55, crown: t.crown * 1.6, emergent, tiered } : { ...t, emergent, tiered };
      // The ancient tree stands alone in its glade.
      if (inGlade(tree.x, tree.z)) continue;
      // Leave a clearing wherever the camera passes through the canopy, with
      // headroom above it, so the camera never skims a crown either.
      if (blocksPath(tree.x, tree.z, tree.crown * (emergent ? 1.5 : 1.15) + 8, tree.ground + tree.height + tree.crown, 10)) continue;
      nearTrees.push(tree);
    }
    return {
      near: nearTrees,
      leafy: nearTrees.filter((t) => !t.tiered),
      tiered: nearTrees.filter((t) => t.tiered),
      palms: plantPalms(palmCount),
    };
  }, [near, palmCount]);

  // Lianas: draped from the underside of some crowns near the route, in a
  // sagging S-curve down to the forest floor. One merged mesh.
  const lianas = useMemo(() => {
    const tubes: TubeGeometry[] = [];
    forest.leafy.forEach((tree, i) => {
      if (tree.hue < 0.12 || tree.hue > 0.3 || i % 2) return;
      if (!blocksPath(tree.x, tree.z, 90, 1e5)) return; // only where the camera can see them
      const top = tree.ground + tree.height - tree.crown * 0.35;
      const a = tree.rot;
      const out = tree.crown * 0.7;
      const start = new Vector3(tree.x + Math.cos(a) * out, top, tree.z + Math.sin(a) * out);
      const end = new Vector3(start.x + Math.cos(a) * 4, tree.ground + 0.3, start.z + Math.sin(a) * 4);
      if (blocksPath(end.x, end.z, 4, top)) return;
      const mid = start.clone().lerp(end, 0.5).add(new Vector3(Math.cos(a + 1.4) * 3, -2, Math.sin(a + 1.4) * 3));
      const low = start.clone().lerp(end, 0.8).add(new Vector3(Math.cos(a - 1.2) * 1.5, 0, Math.sin(a - 1.2) * 1.5));
      tubes.push(new TubeGeometry(new CatmullRomCurve3([start, mid, low, end]), 14, 0.07 + tree.hue * 0.2, 4, false));
    });
    return tubes.length ? mergeGeometries(tubes) : null;
  }, [forest]);

  const geometries = useMemo(
    () => ({
      leafy: leafyCrownGeometry(),
      tiered: tieredTreeGeometry(),
      trunk: buttressTrunkGeometry(),
      pole: new CylinderGeometry(0.5, 1, 1, 6, 1, true).translate(0, 0.5, 0),
      palmTrunk: palmTrunkGeometry(),
      palmCrown: palmCrownGeometry(),
    }),
    [],
  );

  const materials = useMemo(
    () => ({
      foliage: (() => {
        const m = paint(new MeshLambertMaterial({ map: foliageAtlas(), color: FOLIAGE_TONE, vertexColors: true, alphaTest: 0.5, side: DoubleSide }), {
          wind: true,
          swayHeight: 0.3,
          swayScale: 0.025,
          strokes: 0.35,
          strokeScale: 0.2,
          foliage: true,
        });
        return m;
      })(),
      trunk: paint(new MeshLambertMaterial({ color: "#4f4031" }), { strokeScale: 0.14, cloudShadows: false }),
      palmTrunk: paint(new MeshLambertMaterial({ color: "#7a6a52" }), { strokeScale: 0.3, cloudShadows: false }),
      palmCrown: paint(new MeshLambertMaterial({ color: "#5f8f3e", side: DoubleSide }), { wind: true, swayHeight: 0, swayScale: 0.12, strokeScale: 0.2 }),
      liana: paint(new MeshLambertMaterial({ color: "#3f5530" }), { strokeScale: 0.5, cloudShadows: false }),
    }),
    [],
  );

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const color = new Color();

    // Broadleaf trees: a leafy crown on a buttressed trunk
    forest.leafy.forEach((tree, i) => {
      const flat = tree.emergent ? 0.7 : 1; // emergents spread wide and flat, like umbrellas
      dummy.position.set(tree.x, tree.ground, tree.z);
      dummy.rotation.set(0, tree.rot, 0);
      dummy.scale.set(tree.crown, (tree.height / 0.7) * flat, tree.crown);
      dummy.updateMatrix();
      leafy.current!.setMatrixAt(i, dummy.matrix);
      const bloom = tree.hue > 0.975;
      color.copy(bloom ? BLOOMS[Math.floor(tree.hue * 1000) % BLOOMS.length] : LEAFY[Math.floor(((tree.hue * 13.7) % 1) * LEAFY.length * 0.999)]);
      leafy.current!.setColorAt(i, color);
      const girth = tree.crown * (tree.emergent ? 0.16 : 0.12);
      dummy.position.set(tree.x, tree.ground - 0.6, tree.z);
      dummy.scale.set(girth, tree.height * 0.82 + 0.6, girth);
      dummy.updateMatrix();
      trunks.current!.setMatrixAt(i, dummy.matrix);
    });

    // Tiered evergreens: sprays in whorls up a straight, slim trunk
    forest.tiered.forEach((tree, i) => {
      const height = tree.height + tree.crown * 0.9;
      const width = tree.crown * 2.4;
      dummy.position.set(tree.x, tree.ground - 0.3, tree.z);
      dummy.rotation.set(0, tree.rot, 0);
      dummy.scale.set(width, height, width);
      dummy.updateMatrix();
      tiered.current!.setMatrixAt(i, dummy.matrix);
      tiered.current!.setColorAt(i, color.copy(TIERED[Math.floor(((tree.hue * 17.3) % 1) * TIERED.length * 0.999)]));
      const r = Math.max(0.25, width * 0.014);
      dummy.scale.set(r, height * 0.96, r);
      dummy.updateMatrix();
      poles.current!.setMatrixAt(i, dummy.matrix);
    });

    forest.palms.forEach((palm, i) => {
      dummy.position.set(palm.x, palm.ground - 0.3, palm.z);
      dummy.rotation.set(palm.lean, palm.rot, palm.lean * 0.5);
      dummy.scale.set(1.3, palm.height, 1.3);
      dummy.updateMatrix();
      palmTrunks.current!.setMatrixAt(i, dummy.matrix);
      // Crown at the top of the leaning trunk
      const top = new Vector3(0, palm.height, 0).applyEuler(dummy.rotation);
      dummy.position.set(palm.x + top.x, palm.ground + top.y, palm.z + top.z);
      dummy.rotation.set(0, palm.rot, 0);
      dummy.scale.setScalar(palm.size);
      dummy.updateMatrix();
      palmCrowns.current!.setMatrixAt(i, dummy.matrix);
    });

    for (const mesh of [leafy, tiered, trunks, poles, palmTrunks, palmCrowns]) {
      mesh.current!.instanceMatrix.needsUpdate = true;
      if (mesh.current!.instanceColor) mesh.current!.instanceColor.needsUpdate = true;
    }
  }, [forest]);

  return (
    <group>
      <instancedMesh ref={leafy} args={[geometries.leafy, materials.foliage, forest.leafy.length]} frustumCulled={false} />
      <instancedMesh ref={tiered} args={[geometries.tiered, materials.foliage, forest.tiered.length]} frustumCulled={false} />
      <instancedMesh ref={trunks} args={[geometries.trunk, materials.trunk, forest.leafy.length]} frustumCulled={false} />
      <instancedMesh ref={poles} args={[geometries.pole, materials.trunk, forest.tiered.length]} frustumCulled={false} />
      <instancedMesh ref={palmTrunks} args={[geometries.palmTrunk, materials.palmTrunk, forest.palms.length]} frustumCulled={false} />
      <instancedMesh ref={palmCrowns} args={[geometries.palmCrown, materials.palmCrown, forest.palms.length]} frustumCulled={false} />
      {lianas ? <mesh geometry={lianas} material={materials.liana} /> : null}
    </group>
  );
}
