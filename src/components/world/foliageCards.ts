import { BufferAttribute, BufferGeometry, CanvasTexture, CylinderGeometry, SRGBColorSpace, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Trees, ferns and grass built from painted cards: quads carrying a painted
 * image of a branch spray, a leaf cluster, a fern frond or a grass tuft,
 * cut out by its alpha. Many overlapping cards make foliage that reads as
 * real branches and fronds, with sky and shadow showing through the gaps.
 *
 * The images are painted once on a canvas atlas (2 × 2 cells), in greys:
 * each plant's instance colour gives it its green (or autumn brown).
 * Cards get "volume" normals (pointing out from the crown or plant centre),
 * so light falls across a whole crown softly instead of card by card.
 */

/* ─── The painted atlas ──────────────────────────────────────────────────── */

export const CELL = { needles: 0, leaves: 1, fern: 2, grass: 3 } as const;

/**
 * Overall tone of the foliage materials: the painted cards are light, and a
 * crown's sunlit top (normals pointing up) would otherwise glare near-white
 * when seen from above.
 */
export const FOLIAGE_TONE = "#cfcfcf";
type Cell = (typeof CELL)[keyof typeof CELL];

let atlas: CanvasTexture | null = null;

/** Seeded random for repeatable painting. */
function random(start: number) {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

const grey = (v: number, a = 1) => `rgba(${v},${v},${v},${a})`;

/** A conifer branch spray: a twig from left to right with side twigs, all bristling with needles. */
function paintNeedles(ctx: CanvasRenderingContext2D, S: number) {
  const rand = random(7);
  ctx.lineCap = "round";
  const twig = (x0: number, y0: number, angle: number, length: number, depth: number) => {
    const steps = Math.max(6, Math.floor(length / 7));
    let x = x0;
    let y = y0;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const nx = x + Math.cos(angle) * (length / steps);
      const ny = y + Math.sin(angle) * (length / steps) + t * 0.6; // droops a little
      // Needles: short strokes either side, lighter towards the tips
      const shade = 120 + t * 110 + rand() * 25;
      ctx.lineWidth = 1.6;
      for (const side of [-1, 1]) {
        for (let k = 0; k < 2; k++) {
          const a = angle + side * (0.9 + rand() * 0.4) - 0.35;
          const l = (12 + rand() * 10) * (1 - t * 0.35) * (depth ? 0.8 : 1);
          ctx.strokeStyle = grey(Math.min(250, shade + k * 10), 0.95);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
          ctx.stroke();
        }
      }
      if (!depth && i % 3 === 1 && t < 0.85) {
        twig(x, y, angle + (rand() < 0.5 ? -1 : 1) * (0.55 + rand() * 0.3), length * (0.38 - t * 0.2), 1);
      }
      x = nx;
      y = ny;
    }
    ctx.strokeStyle = grey(70);
    ctx.lineWidth = depth ? 1.5 : 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  twig(6, S * 0.48, -0.02, S * 0.95, 0);
}

/** A cluster of broad leaves: pointed ovals with a midrib, radiating, darker inside. */
function paintLeaves(ctx: CanvasRenderingContext2D, S: number) {
  const rand = random(19);
  for (let i = 0; i < 70; i++) {
    const r = Math.sqrt(rand()) * S * 0.36;
    const a = rand() * Math.PI * 2;
    const x = S / 2 + Math.cos(a) * r;
    const y = S / 2 + Math.sin(a) * r;
    const len = 34 + rand() * 26;
    const wid = len * (0.36 + rand() * 0.12);
    const out = r / (S * 0.36); // lighter at the edge of the cluster
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + (rand() - 0.5) * 0.9);
    const tone = 110 + out * 110 + rand() * 30;
    ctx.fillStyle = grey(Math.min(245, tone));
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.quadraticCurveTo(0, -wid, len / 2, 0);
    ctx.quadraticCurveTo(0, wid, -len / 2, 0);
    ctx.fill();
    // Light on one half, a midrib down the centre
    ctx.fillStyle = grey(255, 0.18);
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.quadraticCurveTo(0, -wid, len / 2, 0);
    ctx.fill();
    ctx.strokeStyle = grey(80, 0.6);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.lineTo(len / 2, 0);
    ctx.stroke();
    ctx.restore();
  }
}

/** A fern frond: a tapering rachis with paired, lobed pinnae, along x. */
function paintFern(ctx: CanvasRenderingContext2D, S: number) {
  const rand = random(31);
  const cy = S / 2;
  const n = 30;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const x = 20 + t * (S - 40);
    const len = Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.95)) * S * 0.42 * (1 - t * 0.25);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(x, cy);
      ctx.rotate(side * (1.2 - t * 0.25)); // pinnae sweep towards the tip
      // A pinna: a row of small rounded lobes, lighter at its tip
      const lobes = Math.max(3, Math.floor(len / 9));
      for (let k = 0; k < lobes; k++) {
        const s = k / lobes;
        const px = s * len;
        const w = (1 - s * 0.7) * 7;
        ctx.fillStyle = grey(Math.min(245, 120 + s * 90 + t * 20 + rand() * 15));
        ctx.beginPath();
        ctx.ellipse(px, -w * 0.4, w * 0.9, w, 0.5, 0, Math.PI * 2);
        ctx.ellipse(px, w * 0.4, w * 0.9, w, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = grey(90, 0.7);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len * 0.95, 0);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.strokeStyle = grey(80);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(4, cy);
  ctx.lineTo(S - 12, cy);
  ctx.stroke();
}

/** A tuft of grass: blades fanning up from the bottom centre, lighter at the tips. */
function paintGrass(ctx: CanvasRenderingContext2D, S: number) {
  const rand = random(43);
  ctx.lineCap = "round";
  for (let i = 0; i < 90; i++) {
    const x0 = S / 2 + (rand() - 0.5) * S * 0.25;
    const lean = (rand() - 0.5) * S * 0.7;
    const h = S * (0.5 + rand() * 0.48);
    const grad = ctx.createLinearGradient(0, S, 0, S - h);
    const tone = 130 + rand() * 60;
    grad.addColorStop(0, grey(tone * 0.6));
    grad.addColorStop(1, grey(Math.min(250, tone + 70)));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2 + rand() * 3;
    ctx.beginPath();
    ctx.moveTo(x0, S);
    ctx.quadraticCurveTo(x0 + lean * 0.2, S - h * 0.6, x0 + lean, S - h);
    ctx.stroke();
  }
}

/** The atlas (made once, on the client): needles | leaves / fern | grass. */
export function foliageAtlas() {
  if (atlas) return atlas;
  const S = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S * 2;
  const ctx = canvas.getContext("2d")!;
  const cells: [(c: CanvasRenderingContext2D, s: number) => void, number, number][] = [
    [paintNeedles, 0, 0],
    [paintLeaves, S, 0],
    [paintFern, 0, S],
    [paintGrass, S, S],
  ];
  for (const [paint, x, y] of cells) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.rect(0, 0, S, S);
    ctx.clip();
    paint(ctx, S);
    ctx.restore();
  }
  atlas = new CanvasTexture(canvas);
  atlas.colorSpace = SRGBColorSpace;
  atlas.anisotropy = 8;
  return atlas;
}

/* ─── Cards ──────────────────────────────────────────────────────────────── */

/** UV rectangle of an atlas cell (with a small inset so cells never bleed). */
function cellUv(cell: Cell) {
  const col = cell % 2;
  const row = Math.floor(cell / 2);
  const inset = 0.004;
  // Canvas row 0 is the top of the texture (v = 1)
  return { u0: col * 0.5 + inset, u1: col * 0.5 + 0.5 - inset, v0: 1 - (row + 1) * 0.5 + inset, v1: 1 - row * 0.5 - inset };
}

type CardPoint = (s: number, t: number) => Vector3;

/**
 * A card bent along a surface: `at(s, t)` gives the position for s along
 * the card (0 base … 1 tip) and t across (−1 … 1). Volume normals point
 * away from `centre` (blended with up by `lift`). `shade` darkens it
 * (vertex colour: inner, shadowed foliage is darker).
 */
function card(cell: Cell, at: CardPoint, centre: Vector3, { along = 3, lift = 0.35, shade = 1 } = {}) {
  const uv = cellUv(cell);
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];
  const n = new Vector3();
  for (let i = 0; i <= along; i++) {
    const s = i / along;
    for (const t of [-1, 1]) {
      const p = at(s, t);
      positions.push(p.x, p.y, p.z);
      n.subVectors(p, centre).normalize().lerp(new Vector3(0, 1, 0), lift).normalize();
      normals.push(n.x, n.y, n.z);
      uvs.push(uv.u0 + s * (uv.u1 - uv.u0), t < 0 ? uv.v0 : uv.v1);
      // A touch darker at the base, where the foliage is in its own shade
      const c = shade * (0.72 + s * 0.28);
      colors.push(c, c, c);
    }
    if (i < along) {
      const a = i * 2;
      index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
  geo.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geo.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));
  geo.setIndex(index);
  return geo;
}

/** A flat card centred on `pos`, facing `facing`, `size` across, turned by `spin` in its plane. */
function flatCard(cell: Cell, pos: Vector3, facing: Vector3, size: number, spin: number, centre: Vector3, shade: number) {
  const f = facing.clone().normalize();
  const helper = Math.abs(f.y) > 0.9 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
  const a = new Vector3().crossVectors(f, helper).normalize();
  const b = new Vector3().crossVectors(f, a).normalize();
  const ax = a.clone().multiplyScalar(Math.cos(spin)).addScaledVector(b, Math.sin(spin));
  const bx = b.clone().multiplyScalar(Math.cos(spin)).addScaledVector(a, -Math.sin(spin));
  return card(
    cell,
    (s, t) => pos.clone().addScaledVector(ax, (s - 0.5) * size).addScaledVector(bx, t * size * 0.5),
    centre,
    { along: 1, lift: 0.25, shade },
  );
}

/* ─── Templates (unit sized; instances scale them) ───────────────────────── */

/**
 * A tiered tree, 1 tall: whorls of drooping branch sprays up a straight
 * trunk, widest low down and narrowing to a spire (like the tall evergreen
 * conifers of the hills, and the tiered crowns of many rainforest trees).
 * About 0.3 wide at its base. Trunk drawn separately.
 */
export function tieredTreeGeometry() {
  const parts: BufferGeometry[] = [];
  const tiers = 9;
  const rand = random(5);
  for (let k = 0; k < tiers; k++) {
    const h = k / (tiers - 1);
    const y = 0.22 + h * 0.7;
    const reach = 0.04 + 0.27 * Math.pow(1 - h, 0.85);
    const count = k > tiers - 3 ? 4 : 6;
    for (let j = 0; j < count; j++) {
      const a = (j / count) * Math.PI * 2 + k * 2.4 + rand() * 0.4;
      const dir = new Vector3(Math.cos(a), 0, Math.sin(a));
      const side = new Vector3(-dir.z, 0, dir.x);
      const width = reach * 0.75;
      const droop = reach * (0.35 + rand() * 0.2);
      const centre = new Vector3(0, y - 0.05, 0);
      parts.push(
        card(
          CELL.needles,
          (s, t) =>
            new Vector3(0, y + s * reach * 0.25 - s * s * droop, 0)
              .addScaledVector(dir, 0.01 + s * reach)
              .addScaledVector(side, t * width * 0.5 * (0.6 + s * 0.4))
              .add(new Vector3(0, -Math.abs(t) * width * 0.12, 0)), // sprays curl down at the sides
          centre,
          { along: 3, lift: 0.45, shade: 0.8 + h * 0.2 },
        ),
      );
    }
  }
  // The spire: two crossed upright sprays at the top
  for (const a of [0, Math.PI / 2]) {
    const side = new Vector3(Math.cos(a), 0, Math.sin(a));
    parts.push(card(CELL.needles, (s, t) => new Vector3(0, 0.86 + s * 0.16, 0).addScaledVector(side, t * 0.035 * (1 - s * 0.6)), new Vector3(0, 0.8, 0), { along: 2, lift: 0.5 }));
  }
  return mergeGeometries(parts)!;
}

/**
 * A broadleaf tree's crown, 1 tall overall (trunk drawn separately): leaf
 * clusters set over a lumpy dome, facing outwards, with a darker inner
 * layer, so it reads as masses of leaves catching the light with deep
 * shade between them. Crown centre at y 0.7, radius 1 across (instances
 * scale x and z to the crown's real radius).
 */
export function leafyCrownGeometry() {
  const parts: BufferGeometry[] = [];
  const rand = random(13);
  const centre = new Vector3(0, 0.7, 0);
  const shell = 58;
  for (let i = 0; i < shell; i++) {
    // Fibonacci points over the upper dome, a few under it
    const yN = 1 - (i + 0.5) / shell * 1.35;
    const r = Math.sqrt(Math.max(0, 1 - yN * yN));
    const a = i * 2.39996;
    const lump = 0.85 + rand() * 0.3;
    const dir = new Vector3(Math.cos(a) * r, yN, Math.sin(a) * r);
    const pos = new Vector3(dir.x * lump, 0.7 + dir.y * 0.28 * lump, dir.z * lump);
    parts.push(flatCard(CELL.leaves, pos, new Vector3(dir.x, dir.y * 2.5, dir.z), 0.62, rand() * 6.28, centre, 0.9 + dir.y * 0.1));
  }
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.25 + rand() * 0.4;
    const pos = new Vector3(Math.cos(a) * r, 0.66 + (rand() - 0.5) * 0.18, Math.sin(a) * r);
    parts.push(flatCard(CELL.leaves, pos, new Vector3(rand() - 0.5, 0.6, rand() - 0.5), 0.7, rand() * 6.28, centre, 0.5));
  }
  // Limbs: from the top of the trunk out into the crown
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const limb = new CylinderGeometry(0.012, 0.03, 0.62, 5, 1, true);
    limb.translate(0, 0.31, 0).rotateZ(-0.9).rotateY(a).translate(0, 0.46, 0);
    const pos = limb.attributes.position;
    limb.setAttribute("color", new BufferAttribute(new Float32Array(pos.count * 3).fill(0.35), 3));
    // Sample a solid spot of the atlas (the fern's rachis), so the alpha cut never bites the limb
    limb.setAttribute("uv", new BufferAttribute(new Float32Array(pos.count * 2).map((_, k) => (k % 2 ? 0.25 : 0.245)), 2));
    parts.push(limb.toNonIndexed().setIndex(null) as BufferGeometry);
  }
  return mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)))!;
}

/** A fern: arching fronds from the centre, each slightly folded along its rachis. About 1 across. */
export function cardFernGeometry() {
  const parts: BufferGeometry[] = [];
  const rand = random(29);
  const centre = new Vector3(0, -0.2, 0);
  const fronds = 10;
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + rand() * 0.4;
    const dir = new Vector3(Math.cos(a), 0, Math.sin(a));
    const side = new Vector3(-dir.z, 0, dir.x);
    const length = 0.75 + rand() * 0.35;
    const rise = 0.45 + rand() * 0.25;
    parts.push(
      card(
        CELL.fern,
        (s, t) =>
          new Vector3(0, Math.sin(s * Math.PI * 0.75) * rise - s * s * 0.35, 0)
            .addScaledVector(dir, s * length)
            .addScaledVector(side, t * 0.22 * length)
            .add(new Vector3(0, -Math.abs(t) * 0.05, 0)), // the frond folds down along its rachis
        centre,
        { along: 5, lift: 0.4, shade: 0.85 + rand() * 0.15 },
      ),
    );
  }
  return mergeGeometries(parts)!;
}

/** A tuft of grass: three crossed upright cards. 1 tall, about 1 across. */
export function grassTuftGeometry() {
  const parts = [0, Math.PI / 3, (2 * Math.PI) / 3].map((a) => {
    const side = new Vector3(Math.cos(a), 0, Math.sin(a));
    // Across the card (s) is across the tuft; t runs from the roots (−1) to the tips (1)
    return card(CELL.grass, (s, t) => new Vector3(0, (t + 1) / 2, 0).addScaledVector(side, s - 0.5), new Vector3(0, -0.5, 0), { along: 1, lift: 0.6 });
  });
  return mergeGeometries(parts)!;
}
