import { CanvasTexture, LinearFilter } from "three";

type Point = { x: number; y: number; age: number; force: number };

const SIZE = 64;
const MAX_AGE = 1.4; // seconds a stroke takes to fade
const RADIUS = 0.075; // of the texture size

const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);

/**
 * A small canvas the cursor paints into, as in Codrops' "Interactive
 * Particles": each move leaves a soft dot that swells and fades, so a stroke
 * becomes a trail. The particle shader reads it to lift and scatter the
 * portrait along the path the cursor took, then lets it settle.
 */
export class TouchTrail {
  readonly texture: CanvasTexture;
  private canvas = document.createElement("canvas");
  private ctx: CanvasRenderingContext2D;
  private points: Point[] = [];
  private last: { x: number; y: number } | null = null;
  private dirty = true;

  constructor() {
    this.canvas.width = this.canvas.height = SIZE;
    this.ctx = this.canvas.getContext("2d")!;
    this.texture = new CanvasTexture(this.canvas);
    this.texture.minFilter = this.texture.magFilter = LinearFilter;
    this.clear();
  }

  /** Adds a point in UV space (0…1); faster strokes leave stronger marks. */
  add(x: number, y: number) {
    let force = 0;
    if (this.last) {
      const d = Math.hypot(x - this.last.x, y - this.last.y);
      if (d < 0.002) return;
      force = Math.min(d * d * 8000, 1);
    }
    this.last = { x, y };
    if (force > 0.02) this.points.push({ x, y, age: 0, force });
  }

  /** Forget the last position so the next stroke doesn't jump from it. */
  lift() {
    this.last = null;
  }

  update(dt: number) {
    if (!this.points.length) {
      if (this.dirty) this.clear();
      return;
    }
    this.clear();
    this.points = this.points.filter((p) => (p.age += dt) < MAX_AGE);
    for (const p of this.points) {
      const t = p.age / MAX_AGE;
      const intensity = (t < 0.3 ? easeOutSine(t / 0.3) : easeOutSine(1 - (t - 0.3) / 0.7)) * p.force;
      const r = SIZE * RADIUS * (0.6 + intensity * 0.6);
      const x = p.x * SIZE, y = (1 - p.y) * SIZE;
      const g = this.ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,255,255,${(0.2 * intensity).toFixed(3)})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.texture.needsUpdate = true;
    this.dirty = true;
  }

  private clear() {
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, SIZE, SIZE);
    this.ctx.globalCompositeOperation = "lighter";
    this.texture.needsUpdate = true;
    this.dirty = false;
  }

  dispose() {
    this.texture.dispose();
  }
}
