"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DoubleSide,
  IcosahedronGeometry,
  InstancedMesh,
  MeshLambertMaterial,
  Object3D,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { fbm, terrainHeight } from "@/lib/geography";
import { GIANT_TREE } from "@/lib/scenes";
import { blocksPath } from "@/lib/forest";
import { buttressTrunkGeometry } from "./foliage";
import { FOLIAGE_TONE, foliageAtlas, leafyCrownGeometry } from "./foliageCards";
import { paint } from "./shaders";

/**
 * CHAPTER 4 · THE ANCIENT TREE: a giant banyan in its own glade.
 * Several trunks twisted together with buttress roots, great branches
 * reaching out, a layered leafy crown, aerial roots hanging to the ground,
 * moss on the bark and orchids along the branches. All built in code.
 */

let seed = 101;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

/** Bark that turns mossy towards the ground and in patches. */
function barkColours(geo: BufferGeometry, ground: number) {
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const bark = new Color("#5a4b3b");
  const barkLight = new Color("#7b6a55");
  const moss = new Color("#5d7f3a");
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = fbm(x * 0.15 + z * 0.15, y * 0.08, 3);
    c.copy(bark).lerp(barkLight, n);
    const mossy = Math.max(1 - (y - ground) / 14, 0) * 0.8 + (n > 0.62 ? 0.5 : 0);
    c.lerp(moss, Math.min(1, mossy));
    c.toArray(colors, i * 3);
  }
  geo.setAttribute("color", new BufferAttribute(colors, 3));
  return geo;
}

export type Branch = { curve: CatmullRomCurve3; tip: Vector3 };

/** The banyan's layout: trunk base, branches and where crowns and roots go. Deterministic. */
export function banyanLayout() {
  seed = 101;
  const ground = terrainHeight(GIANT_TREE.x, GIANT_TREE.z);
  const base = new Vector3(GIANT_TREE.x, ground, GIANT_TREE.z);
  const branches: Branch[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 + rand() * 0.4;
    const start = base.clone().add(new Vector3(0, 26 + rand() * 18, 0));
    const reach = 16 + rand() * 12;
    const dir = new Vector3(Math.cos(angle), 0, Math.sin(angle));
    const mid = start.clone().addScaledVector(dir, reach * 0.5).add(new Vector3(0, 6 + rand() * 4, 0));
    const tip = start.clone().addScaledVector(dir, reach).add(new Vector3(0, 10 + rand() * 8, 0));
    branches.push({ curve: new CatmullRomCurve3([start, mid, tip]), tip });
  }
  return { ground, base, branches };
}

export function GiantTree() {
  const crowns = useRef<InstancedMesh>(null);
  const orchids = useRef<InstancedMesh>(null);

  const tree = useMemo(() => {
    const layout = banyanLayout();
    const { ground, base, branches } = layout;

    // Trunks: five twisted together, plus great buttress roots
    const trunks = Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2;
      const t = new CylinderGeometry(1.6, 2.6, GIANT_TREE.height, 9, 12, true).translate(0, GIANT_TREE.height / 2, 0);
      const pos = t.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const y = pos.getY(v);
        const twist = y * 0.035 + a;
        const r = 2.2 * (1 - y / GIANT_TREE.height) + 0.6;
        pos.setX(v, pos.getX(v) + Math.cos(twist) * r);
        pos.setZ(v, pos.getZ(v) + Math.sin(twist) * r);
      }
      t.computeVertexNormals();
      return t.translate(base.x, ground - 1, base.z).toNonIndexed();
    });
    const buttress = buttressTrunkGeometry().scale(6, 14, 6).translate(base.x, ground - 1, base.z).toNonIndexed();
    const limbs = branches.map((b) => new TubeGeometry(b.curve, 16, 1.3, 7, false).toNonIndexed());

    // Aerial roots: a few from the inner part of each branch, down to the
    // ground, thin and slightly swaying, never where the camera flies
    const roots: BufferGeometry[] = [];
    branches.forEach((b) => {
      for (let k = 0; k < 3; k++) {
        const top = b.curve.getPoint(0.18 + rand() * 0.4);
        const x = top.x + (rand() - 0.5) * 2;
        const z = top.z + (rand() - 0.5) * 2;
        const bottom = terrainHeight(x, z) - 0.5;
        const len = top.y - bottom;
        if (blocksPath(x, z, 7, top.y)) continue;
        const thick = 0.08 + rand() * 0.14;
        const root = new CylinderGeometry(thick * 0.6, thick * (len > 25 ? 2.2 : 1.2), len, 5, 3, true).translate(x, bottom + len / 2, z);
        // A gentle sway of the line, so they don't read as poles
        const pos = root.attributes.position;
        for (let v = 0; v < pos.count; v++) {
          const f = (pos.getY(v) - bottom) / len;
          pos.setX(v, pos.getX(v) + Math.sin(f * Math.PI) * (rand() - 0.5) * 1.2);
        }
        root.computeVertexNormals();
        roots.push(root.toNonIndexed());
      }
    });

    const wood = barkColours(mergeGeometries([...trunks, buttress, ...limbs, ...roots])!, ground);
    wood.deleteAttribute("uv");

    // Crowns: clusters at every branch tip and along the upper branches, plus a high centre
    const crowns: { p: Vector3; r: number }[] = [{ p: base.clone().add(new Vector3(0, GIANT_TREE.height + 4, 0)), r: 16 }];
    branches.forEach((b) => {
      crowns.push({ p: b.tip.clone().add(new Vector3(0, 4, 0)), r: 11 + rand() * 4 });
      crowns.push({ p: b.curve.getPoint(0.55).add(new Vector3(0, 7, 0)), r: 8 + rand() * 3 });
    });

    // Orchids: little pink and white sprays along the branches
    const orchidSpots = branches.flatMap((b) =>
      Array.from({ length: 6 }, () => b.curve.getPoint(0.15 + rand() * 0.8).add(new Vector3((rand() - 0.5) * 2, 1.2, (rand() - 0.5) * 2))),
    );
    return { wood, crowns, orchidSpots };
  }, []);

  const materials = useMemo(
    () => ({
      wood: paint(new MeshLambertMaterial({ vertexColors: true }), { strokeScale: 0.18, cloudShadows: false }),
      crown: (() => {
        const m = paint(new MeshLambertMaterial({ map: foliageAtlas(), color: FOLIAGE_TONE, vertexColors: true, alphaTest: 0.5, side: DoubleSide }), {
          wind: true,
          swayHeight: 0.3,
          swayScale: 0.02,
          strokes: 0.35,
          strokeScale: 0.2,
          foliage: true,
        });
        return m;
      })(),
      orchid: paint(new MeshLambertMaterial({ emissive: "#2a1520" }), { strokes: 0.4, strokeScale: 2, cloudShadows: false }),
    }),
    [],
  );
  const geometries = useMemo(() => ({ crown: leafyCrownGeometry(), orchid: new IcosahedronGeometry(0.45, 0) }), []);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const greens = ["#5d8a45", "#6b9447", "#7fa650"].map((c) => new Color(c));
    tree.crowns.forEach((c, i) => {
      // The card crown's centre sits at 0.7 of its height and is 0.28 tall:
      // scale it so the crown is c.r across and about 0.6 c.r high, centred on c.p
      const tall = (c.r * 0.6) / 0.28;
      dummy.position.set(c.p.x, c.p.y - 0.7 * tall, c.p.z);
      dummy.rotation.set(0, i * 1.3, 0);
      dummy.scale.set(c.r, tall, c.r);
      dummy.updateMatrix();
      crowns.current!.setMatrixAt(i, dummy.matrix);
      crowns.current!.setColorAt(i, greens[i % greens.length]);
    });
    const pinks = ["#e39bb0", "#f4efe6", "#c870a8"].map((c) => new Color(c));
    tree.orchidSpots.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.rotation.set(i, i * 2, 0);
      dummy.scale.setScalar(0.8 + (i % 3) * 0.3);
      dummy.updateMatrix();
      orchids.current!.setMatrixAt(i, dummy.matrix);
      orchids.current!.setColorAt(i, pinks[i % pinks.length]);
    });
    for (const m of [crowns, orchids]) {
      m.current!.instanceMatrix.needsUpdate = true;
      if (m.current!.instanceColor) m.current!.instanceColor.needsUpdate = true;
    }
  }, [tree]);

  return (
    <group>
      <mesh geometry={tree.wood} material={materials.wood} />
      <instancedMesh ref={crowns} args={[geometries.crown, materials.crown, tree.crowns.length]} frustumCulled={false} />
      <instancedMesh ref={orchids} args={[geometries.orchid, materials.orchid, tree.orchidSpots.length]} frustumCulled={false} />
    </group>
  );
}
