import {
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DodecahedronGeometry,
  ExtrudeGeometry,
  IcosahedronGeometry,
  Shape,
  ShapeGeometry,
  SphereGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Geometry for the forest's plants, built in code (no model files). Every
 * builder returns one merged BufferGeometry in local units, standing on
 * y = 0, so it can be instanced and scaled per plant. Shapes are kept
 * simple and a little faceted; the painted material and the Kuwahara
 * filter do the rest.
 */

/**
 * A frond: a ribbon along a gently arching midrib, with leaflets (a zigzag
 * edge) on both sides. `arch` lifts it, `droop` pulls the tip down.
 * Grows along +x from the origin, length 1.
 */
function frond({ segments = 14, width = 0.16, arch = 0.25, droop = 0.55, leaflets = true } = {}) {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = Math.sin(t * Math.PI * 0.7) * arch - t * t * droop;
    // Leaflets: every other row reaches further out, giving a serrated edge.
    const reach = Math.sin(Math.PI * Math.min(1, t * 1.15)) * width * (leaflets && i % 2 === 1 ? 1.45 : 0.85);
    const back = leaflets && i % 2 === 1 ? 0.03 : 0; // leaflets sweep back a little
    positions.push(t - back, y, -reach, t, y + 0.01, 0, t - back, y, reach);
    if (i < segments) {
      const a = i * 3;
      indices.push(a, a + 3, a + 1, a + 1, a + 3, a + 4, a + 1, a + 4, a + 2, a + 2, a + 4, a + 5);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Rotate a geometry about y (radians) and tilt it about z, then return it. */
function turn(geo: BufferGeometry, yaw: number, tilt = 0) {
  return geo.rotateZ(tilt).rotateY(yaw);
}

/** A palm crown: eleven long drooping fronds from the top of the trunk. */
export function palmCrownGeometry() {
  const parts = Array.from({ length: 11 }, (_, i) => {
    const f = frond({ segments: 18, width: 0.11, arch: 0.2, droop: 0.75 });
    return turn(f, (i / 11) * Math.PI * 2 + (i % 2) * 0.25, 0.15 + (i % 3) * 0.12);
  });
  return mergeGeometries(parts)!;
}

/** A broad, heart-shaped leaf (elephant ear / wild banana) on a stalk. */
function broadLeaf() {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.35, 0.05, 0.42, 0.55, 0, 1);
  shape.bezierCurveTo(-0.42, 0.55, -0.35, 0.05, 0, 0);
  const blade = new ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: false, curveSegments: 6 });
  // Lay the blade out from the stalk tip and let it bend downwards.
  blade.rotateX(-Math.PI / 2);
  const pos = blade.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const along = -pos.getZ(i); // 0 at the stalk, 1 at the tip
    pos.setY(i, pos.getY(i) - along * along * 0.35 + Math.abs(pos.getX(i)) * 0.12);
  }
  blade.translate(0, 0.9, 0);
  blade.computeVertexNormals();
  const stalk = new CylinderGeometry(0.012, 0.02, 0.9, 4, 1, true).translate(0, 0.45, 0);
  return mergeGeometries([blade, stalk.toNonIndexed()])!;
}

/** A clump of broad leaves on stalks, about 1 unit tall. */
export function broadleafGeometry() {
  const parts = Array.from({ length: 5 }, (_, i) => {
    const leaf = broadLeaf();
    leaf.rotateX(0.25 + (i % 2) * 0.2);
    leaf.scale(1, 0.85 + (i % 3) * 0.12, 1);
    return leaf.rotateY((i / 5) * Math.PI * 2);
  });
  return mergeGeometries(parts)!;
}

/** A rainforest trunk: tapered, with four buttress roots flaring at its foot. Height 1. */
export function buttressTrunkGeometry() {
  const trunk = new CylinderGeometry(0.42, 0.75, 1, 7, 3, true).translate(0, 0.5, 0);
  const fin = new Shape();
  fin.moveTo(0, 0);
  fin.lineTo(3.2, 0);
  fin.quadraticCurveTo(0.8, 0.02, 0.35, 0.16);
  fin.lineTo(0, 0.2);
  const fins = Array.from({ length: 4 }, (_, i) => {
    const f = new ExtrudeGeometry(fin, { depth: 0.16, bevelEnabled: false, curveSegments: 4 });
    f.translate(0, 0, -0.08);
    return f.rotateY((i / 4) * Math.PI * 2 + 0.4);
  });
  return mergeGeometries([trunk.toNonIndexed(), ...fins])!;
}

/** A thin palm trunk, very slightly swollen at the base. Height 1. */
export function palmTrunkGeometry() {
  return new CylinderGeometry(0.11, 0.17, 1, 6, 4, true).translate(0, 0.5, 0);
}

/** A small mushroom: stem and a domed cap. Height about 1. */
export function mushroomGeometry() {
  const stem = new CylinderGeometry(0.12, 0.16, 0.7, 6, 1).translate(0, 0.35, 0);
  const cap = new SphereGeometry(0.42, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.65, 1).translate(0, 0.66, 0);
  return mergeGeometries([stem.toNonIndexed(), cap.toNonIndexed()])!;
}

/** A rock, flattened, with a mossy top (vertex colours: moss above, stone below). */
export function mossyRockGeometry() {
  // Polyhedra are already non-indexed, so each face keeps its own colour.
  const rock = new DodecahedronGeometry(1, 0).scale(1.3, 0.6, 1);
  const pos = rock.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const moss = new Color("#5f8a3c");
  const stone = new Color("#7d7f6c");
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    c.copy(stone).lerp(moss, Math.min(1, Math.max(0, pos.getY(i) * 1.6 + 0.35)));
    c.toArray(colors, i * 3);
  }
  rock.setAttribute("color", new BufferAttribute(colors, 3));
  rock.translate(0, 0.25, 0);
  rock.computeVertexNormals();
  return rock;
}

/** A fallen log lying along x, length 1, with a broken stub of a branch. */
export function logGeometry() {
  const log = new CylinderGeometry(0.06, 0.07, 1, 7, 1).rotateZ(Math.PI / 2).translate(0, 0.06, 0);
  const stub = new CylinderGeometry(0.015, 0.025, 0.12, 5, 1).rotateZ(-0.8).translate(0.2, 0.12, 0);
  return mergeGeometries([log.toNonIndexed(), stub.toNonIndexed()])!;
}

/* ─── Flowers ───────────────────────────────────────────────────────────── */

/** Layout of a wildflower clump: a few stems of different heights, each with a head. */
const CLUMP = [
  [0, 0, 0.75, 0.1],
  [0.18, 0.1, 0.6, -0.2],
  [-0.15, 0.14, 0.68, 0.25],
  [0.08, -0.18, 0.5, -0.1],
  [-0.2, -0.1, 0.55, 0.3],
  [0.22, -0.12, 0.42, 0.15],
] as const;

/** The stems of a wildflower clump (green). Pairs with flowerHeadsGeometry. */
export function flowerStemsGeometry() {
  return mergeGeometries(
    CLUMP.map(([x, z, h, tilt]) => new CylinderGeometry(0.012, 0.018, h, 3, 1, true).translate(0, h / 2, 0).rotateZ(tilt * 0.3).translate(x, 0, z).toNonIndexed()),
  )!;
}

/** The heads of a wildflower clump (tinted per instance: ixora red, balsam pink, daisy white…). */
export function flowerHeadsGeometry() {
  return mergeGeometries(
    CLUMP.map(([x, z, h, tilt]) => new IcosahedronGeometry(0.075, 0).scale(1, 0.7, 1).translate(x + Math.sin(tilt * 0.3) * -h, h, z)),
  )!;
}

/* ─── Animals (stylised, built from simple shapes, coloured per vertex) ─── */

function tinted(geo: BufferGeometry, color: string) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const c = new Color(color);
  const colors = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < g.attributes.position.count; i++) c.toArray(colors, i * 3);
  g.setAttribute("color", new BufferAttribute(colors, 3));
  g.deleteAttribute("uv");
  return g;
}

/** A rabbit sitting up, facing +z, about 0.6 long. */
export function rabbitGeometry() {
  return mergeGeometries([
    tinted(new SphereGeometry(0.22, 10, 8).scale(1, 0.95, 1.35).translate(0, 0.22, 0), "#8b7356"),
    tinted(new SphereGeometry(0.13, 10, 8).translate(0, 0.38, 0.26), "#8b7356"),
    tinted(new SphereGeometry(0.045, 6, 6).scale(1, 3.4, 0.7).rotateX(-0.25).translate(-0.05, 0.6, 0.22), "#9b8366"),
    tinted(new SphereGeometry(0.045, 6, 6).scale(1, 3.4, 0.7).rotateX(-0.25).rotateZ(-0.2).translate(0.07, 0.6, 0.22), "#9b8366"),
    tinted(new SphereGeometry(0.07, 6, 6).translate(0, 0.25, -0.3), "#f1ece0"),
    tinted(new SphereGeometry(0.02, 4, 4).translate(-0.06, 0.42, 0.37), "#1e1a16"),
    tinted(new SphereGeometry(0.02, 4, 4).translate(0.06, 0.42, 0.37), "#1e1a16"),
  ])!;
}

/** A Malabar giant squirrel: maroon back, cream belly, long dark bushy tail. Facing +z. */
export function squirrelGeometry() {
  return mergeGeometries([
    tinted(new SphereGeometry(0.16, 10, 8).scale(1, 0.9, 1.6).translate(0, 0.18, 0), "#7a3a22"),
    tinted(new SphereGeometry(0.12, 8, 6).scale(0.95, 0.6, 1.4).translate(0, 0.12, 0.02), "#e3c48d"),
    tinted(new SphereGeometry(0.1, 10, 8).translate(0, 0.28, 0.24), "#7a3a22"),
    tinted(new SphereGeometry(0.035, 5, 5).scale(1, 1.6, 0.6).translate(-0.05, 0.38, 0.24), "#4a2416"),
    tinted(new SphereGeometry(0.035, 5, 5).scale(1, 1.6, 0.6).translate(0.05, 0.38, 0.24), "#4a2416"),
    // The tail: a plume curving up and over the back
    tinted(new SphereGeometry(0.11, 8, 6).scale(1, 1, 1.4).translate(0, 0.2, -0.32), "#3f2316"),
    tinted(new SphereGeometry(0.12, 8, 6).scale(1, 1.4, 1).translate(0, 0.42, -0.4), "#4a2a1a"),
    tinted(new SphereGeometry(0.1, 8, 6).scale(1, 1.3, 1).translate(0, 0.65, -0.32), "#d9c7a0"),
    tinted(new SphereGeometry(0.018, 4, 4).translate(-0.05, 0.31, 0.33), "#120d0a"),
    tinted(new SphereGeometry(0.018, 4, 4).translate(0.05, 0.31, 0.33), "#120d0a"),
  ])!;
}

/**
 * A butterfly at rest shape: two wings (fore and hind wing in one outline)
 * either side of a slim body, lying flat in the xz plane, head towards +z.
 * Wings are white at the root and dark at the tips, tinted per instance;
 * the flapping happens in the shader (Wildlife.tsx).
 */
export function butterflyGeometry() {
  const wing = new Shape();
  wing.moveTo(0, 0.06);
  wing.bezierCurveTo(-0.2, 0.42, -0.58, 0.42, -0.5, 0.12);
  wing.bezierCurveTo(-0.46, -0.02, -0.36, -0.06, -0.3, -0.08);
  wing.bezierCurveTo(-0.38, -0.3, -0.2, -0.38, 0, -0.1);
  const left = new ShapeGeometry(wing, 6).rotateX(-Math.PI / 2);
  const right = new ShapeGeometry(wing, 6).rotateX(-Math.PI / 2).scale(-1, 1, 1);
  const wings = mergeGeometries([left.toNonIndexed(), right.toNonIndexed()])!;
  const pos = wings.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const reach = Math.min(1, Math.hypot(pos.getX(i), pos.getZ(i)) / 0.5);
    c.setRGB(1, 1, 1).lerp(new Color("#1a1612"), Math.pow(reach, 2.2) * 0.85);
    c.toArray(colors, i * 3);
  }
  wings.setAttribute("color", new BufferAttribute(colors, 3));
  wings.deleteAttribute("uv");
  const body = tinted(new CylinderGeometry(0.018, 0.012, 0.36, 5, 1).rotateX(Math.PI / 2), "#1a1612");
  body.deleteAttribute("normal");
  body.computeVertexNormals();
  return mergeGeometries([wings, body])!;
}
