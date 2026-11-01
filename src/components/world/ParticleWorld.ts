import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Line,
  Matrix4,
  NormalBlending,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  type IUniform,
} from "three";
import { clusters, globe, journeyRoad, latLonToVec, portrait, portraitPools, seedSphere, typeShape, waveField } from "./shapes";
import { STAGES, ORIGIN, DESTINATIONS, type StageLayout } from "./stages";
import { TouchTrail } from "./TouchTrail";

const vertexShader = /* glsl */ `
  attribute vec3 aS1;
  attribute vec3 aS2;
  attribute vec3 aS3;
  attribute vec3 aS4;
  attribute vec3 aS5;
  attribute vec4 aRand;
  attribute float aGroup;
  attribute float aShade;

  uniform float uStage;
  uniform float uTime;
  uniform float uIntro;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  uniform float uFocus;
  uniform float uFocusAmount;
  uniform sampler2D uTouch;
  uniform float uPortraitHalfWidth;
  uniform float uDark;

  varying float vDepth;
  varying float vAlpha;
  varying float vTint;
  varying float vFace;
  varying float vTouch;
  varying float vShade;

  float w(float s, float i) { return max(0.0, 1.0 - abs(s - i)); }

  void main() {
    // Each particle runs slightly ahead or behind during a morph (organic
    // feel), but every particle lands exactly on its shape at rest.
    float base = floor(uStage);
    float s = base + smoothstep(aRand.x * 0.4, aRand.x * 0.4 + 0.6, uStage - base);
    vec3 p = position * w(s, 0.0) + aS1 * w(s, 1.0) + aS2 * w(s, 2.0)
           + aS3 * w(s, 3.0) + aS4 * w(s, 4.0) + aS5 * w(s, 5.0);

    // Breathing drift.
    p += 0.012 * sin(uTime * 0.7 + aRand.y * 6.2831 + p.yzx * 3.0);

    // Intro: particles gather from a wide scatter.
    vec3 scatter = (aRand.xyz - 0.5) * 7.0;
    float t = smoothstep(aRand.w * 0.45, aRand.w * 0.45 + 0.55, uIntro);
    p = mix(scatter, p, t);

    float face = w(s, 0.0);

    // Portrait: the cursor's fading trail (TouchTrail) lifts particles out of
    // the face, each in its own direction and depth, then lets them settle.
    vec2 uv = vec2(position.x / (2.0 * uPortraitHalfWidth) + 0.5, position.y * 0.5 + 0.5);
    float touch = texture2D(uTouch, uv).r * face;
    float angle = aRand.x * 6.2831;
    p += vec3(cos(angle) * 0.32 * aRand.z, sin(angle) * 0.32 * aRand.z, 1.1 * (aRand.y - 0.35)) * touch;

    // Other shapes: a gentle push away from the pointer.
    vec3 away = p - uPointer;
    float push = smoothstep(0.38, 0.0, length(away));
    p += normalize(away + 1e-5) * uPointerStrength * push * push * 0.22 * (1.0 - face);

    // Hero portrait: darker parts of the photo get bigger dots (a halftone).
    // On dark paper the dots are drawn a touch larger so the face carries.
    float portraitSize = mix(1.0, (0.35 + aShade * 1.15) * mix(1.0, 1.22, uDark), face) * (1.0 + touch * 0.5);

    // Skills stage: the focused category's cluster grows, the rest recede.
    float focus = w(s, 3.0) * uFocusAmount;
    float inFocus = 1.0 - step(0.5, abs(aGroup - uFocus));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.6 + aRand.z * 0.8) * (1.0 + focus * inFocus * 0.7) * portraitSize / -mv.z;
    // Depth fades points toward the background; the flat portrait keeps its ink.
    vDepth = smoothstep(2.6, 5.4, -mv.z) * (1.0 - face);
    vFace = face;
    vTouch = touch;
    vShade = aShade;
    // Colour drifts from cobalt to violet across each shape.
    vTint = smoothstep(-1.1, 1.1, p.x * 0.8 + p.y * 0.6);
    vAlpha = t * mix(1.0, 0.3 + inFocus * 0.7, focus);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColor2;
  uniform vec3 uFade;
  uniform float uFadeAmount;
  uniform vec3 uInk;
  uniform float uDark;
  uniform float uOpacity;
  varying float vDepth;
  varying float vAlpha;
  varying float vTint;
  varying float vFace;
  varying float vTouch;
  varying float vShade;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.32, r);
    vec3 accent = mix(uColor, uColor2, vTint);
    // Light theme: the portrait is printed in ink with a hint of cobalt.
    // Dark theme: it's lit in the site's cobalt-to-violet, with the brightest
    // parts of the photo (forehead, cheeks, nose) running to warm white.
    vec3 printed = mix(uInk, uColor, 0.18);
    vec3 lit = mix(accent, uInk, smoothstep(0.35, 1.0, vShade) * 0.75);
    vec3 color = mix(accent, mix(printed, lit, uDark), vFace);
    // Particles stirred by the cursor flare: into colour on paper, toward
    // white on dark (where the face is already in colour).
    vec3 flare = mix(accent, uInk, uDark * 0.65);
    color = mix(color, flare, clamp(vTouch * 1.6, 0.0, 0.9));
    color = mix(color, uFade, vDepth * uFadeAmount);
    float strength = mix(0.85 - vDepth * 0.5, mix(0.95, 1.0, uDark), vFace);
    gl_FragColor = vec4(color, edge * vAlpha * uOpacity * strength);
  }
`;

const arcVertex = /* glsl */ `
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const arcFragment = /* glsl */ `
  uniform float uDraw;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uColor;
  varying float vT;
  void main() {
    if (vT > uDraw) discard;
    float pulse = 0.55 + 0.45 * smoothstep(0.0, 0.08, fract(vT * 3.0 - uTime * 0.35));
    gl_FragColor = vec4(uColor, uOpacity * pulse);
  }
`;

export type WorldOptions = {
  /** Fewer particles and a lower pixel ratio for phones */
  compact: boolean;
  land: Int16Array;
  initials: string;
  fontFamily: string;
  theme: WorldTheme;
  /** portrait-points.bin; without it the hero shows a planet */
  portrait?: Int16Array;
  count: number;
  shapes: WorldShapes;
};

export type WorldShapes = Record<"hero" | "initials" | "road" | "clusters" | "wave" | "globe", Float32Array> & {
  shade: Float32Array;
};

/** Particle count: enough for the portrait to read; other shapes reuse them freely. */
export const particleCount = (compact: boolean) => (compact ? 9000 : 20000);

const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Builds every shape one at a time, yielding between them, so start-up never
 * blocks the page for long (each shape is a short task, not one big one).
 */
export async function buildShapes(
  options: Pick<WorldOptions, "compact" | "land" | "initials" | "fontFamily" | "portrait" | "theme">,
): Promise<{ count: number; shapes: WorldShapes }> {
  const count = particleCount(options.compact);
  const pools = options.portrait ? portraitPools(options.portrait) : null;
  // Hero shape: the portrait when its points loaded, otherwise a seed planet.
  const face = pools ? portrait(count, options.theme.dark ? pools.dark : pools.paper) : null;
  const hero = face?.positions ?? seedSphere(count);
  const shade = face?.shade ?? new Float32Array(count).fill(0.5);
  await yieldToMain();
  const initials = typeShape(count, options.initials, `800 290px ${options.fontFamily}`);
  await yieldToMain();
  const road = journeyRoad(count);
  const clusterShape = clusters(count);
  await yieldToMain();
  const wave = waveField(count);
  await yieldToMain();
  const globeShape = globe(count, options.land);
  await yieldToMain();
  return { count, shapes: { hero, shade, initials, road, clusters: clusterShape, wave, globe: globeShape } };
}

/** Colours read from the page's CSS tokens, so the world follows light/dark. */
export type WorldTheme = { color: string; color2: string; ink: string; background: string; arc: string; dark: boolean };

type Uniforms = Record<string, IUniform>;

export class ParticleWorld {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(32, 1, 0.1, 60);
  private group = new Group();
  private uniforms: Uniforms;
  private geometry: BufferGeometry;
  private count: number;
  private portraitData: { paper: Int16Array; dark: Int16Array } | null;
  private portraitDark: boolean | null = null;
  private material: ShaderMaterial;
  private arcUniforms: Uniforms;
  private arcs = new Group();
  private raycaster = new Raycaster();
  private plane = new Plane(new Vector3(0, 0, 1), 0);
  private pointerNdc = new Vector2(10, 10);
  private pointerTarget = 0;
  private stage = 0;
  private stageTarget = 0;
  private trail = new TouchTrail();
  private pointerActive = false;
  private focusTarget = 0;
  private layout: StageLayout = { ...STAGES[0] };
  private baseOpacity: number;
  private spin = 0;
  private start = performance.now();
  private last = performance.now();
  private running = false;
  private width = 1;
  private height = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    private options: WorldOptions,
  ) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    // Phones: text and particles share a narrow screen, so keep dots quieter.
    this.baseOpacity = options.compact ? 0.55 : 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.compact ? 1.5 : 2));
    this.camera.position.set(0, 0, 4.4);
    this.scene.add(this.group);

    const { count, shapes } = options;
    const geometry = new BufferGeometry();
    this.portraitData = options.portrait ? portraitPools(options.portrait) : null;
    geometry.setAttribute("position", new BufferAttribute(shapes.hero, 3));
    geometry.setAttribute("aShade", new BufferAttribute(shapes.shade, 1));
    this.geometry = geometry;
    this.count = count;
    geometry.setAttribute("aS1", new BufferAttribute(shapes.initials, 3));
    geometry.setAttribute("aS2", new BufferAttribute(shapes.road, 3));
    geometry.setAttribute("aS3", new BufferAttribute(shapes.clusters, 3));
    geometry.setAttribute("aS4", new BufferAttribute(shapes.wave, 3));
    geometry.setAttribute("aS5", new BufferAttribute(shapes.globe, 3));
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
    geometry.setAttribute("aRand", new BufferAttribute(rand, 4));
    // Matches clusters(): particle i belongs to group i % 5.
    const group = new Float32Array(count);
    for (let i = 0; i < count; i++) group[i] = i % 5;
    geometry.setAttribute("aGroup", new BufferAttribute(group, 1));

    this.uniforms = {
      uStage: { value: 0 },
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uSize: { value: options.compact ? 10 : 11 },
      uPixelRatio: { value: this.renderer.getPixelRatio() },
      uPointer: { value: new Vector3(10, 10, 10) },
      uPointerStrength: { value: 0 },
      uFocus: { value: -1 },
      uTouch: { value: this.trail.texture },
      uPortraitHalfWidth: { value: this.portraitHalfWidth() },
      uInk: { value: new Color(options.theme.ink) },
      uDark: { value: options.theme.dark ? 1 : 0 },
      uFocusAmount: { value: 0 },
      uColor: { value: new Color(options.theme.color) },
      uColor2: { value: new Color(options.theme.color2) },
      uFade: { value: new Color(options.theme.background) },
      uFadeAmount: { value: 0.75 },
      uOpacity: { value: this.baseOpacity },
    };
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
    });
    this.applyFade(options.theme.dark);
    this.portraitDark = options.theme.dark;
    const points = new Points(geometry, this.material);
    points.frustumCulled = false;
    this.group.add(points);

    this.arcUniforms = {
      uDraw: { value: 0 },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: new Color(options.theme.arc) },
    };
    this.buildArcs();
    this.group.add(this.arcs);

    this.resize();
  }

  /** Flight paths from Kozhikode to each destination city, drawn on the globe stage. */
  private buildArcs() {
    const material = new ShaderMaterial({
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
      uniforms: this.arcUniforms,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
    });
    const from = new Vector3(...latLonToVec(ORIGIN.lat, ORIGIN.lon, 1.005));
    for (const city of DESTINATIONS) {
      const to = new Vector3(...latLonToVec(city.lat, city.lon, 1.005));
      const segments = 64;
      const positions = new Float32Array((segments + 1) * 3);
      const ts = new Float32Array(segments + 1);
      const lift = 0.12 + from.distanceTo(to) * 0.35;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = from.clone().lerp(to, t).normalize().multiplyScalar(1.005 + Math.sin(Math.PI * t) * lift);
        positions.set([p.x, p.y, p.z], i * 3);
        ts[i] = t;
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(positions, 3));
      geometry.setAttribute("aT", new BufferAttribute(ts, 1));
      this.arcs.add(new Line(geometry, material));
    }
  }

  setTheme(theme: WorldTheme) {
    (this.uniforms.uColor.value as Color).set(theme.color);
    (this.uniforms.uColor2.value as Color).set(theme.color2);
    (this.uniforms.uInk.value as Color).set(theme.ink);
    this.uniforms.uDark.value = theme.dark ? 1 : 0;
    (this.uniforms.uFade.value as Color).set(theme.background);
    (this.arcUniforms.uColor.value as Color).set(theme.arc);
    this.applyFade(theme.dark);
    this.applyPortrait(theme.dark);
  }

  /** Half the portrait's width in shape units (its height is always 2). */
  private portraitHalfWidth() {
    const pool = this.portraitData?.paper;
    if (!pool) return 1;
    let max = 0;
    for (let i = 0; i < pool.length; i += 3) max = Math.max(max, Math.abs(pool[i]));
    return max / 10000 || 1;
  }

  /** Light themes draw the photo's shadows; dark themes draw its light. */
  private applyPortrait(dark: boolean) {
    if (!this.portraitData || this.portraitDark === dark) return;
    this.portraitDark = dark;
    const face = portrait(this.count, dark ? this.portraitData.dark : this.portraitData.paper);
    const position = this.geometry.getAttribute("position") as BufferAttribute;
    const shade = this.geometry.getAttribute("aShade") as BufferAttribute;
    (position.array as Float32Array).set(face.positions);
    (shade.array as Float32Array).set(face.shade);
    position.needsUpdate = true;
    shade.needsUpdate = true;
  }

  private applyFade(dark: boolean) {
    this.uniforms.uFadeAmount.value = dark ? 0.55 : 0.75;
  }

  /** Highlights one skills cluster (category index), or none. */
  setFocus(group: number | null) {
    if (group !== null) this.uniforms.uFocus.value = group;
    this.focusTarget = group === null ? 0 : 1;
  }

  /** Continuous stage index: 0 = hero … 5 = globe. */
  setStage(stage: number) {
    this.stageTarget = Math.max(0, Math.min(STAGES.length - 1, stage));
  }

  /** Pointer in normalised device coordinates (-1…1); pass null when it leaves. */
  setPointer(x: number | null, y = 0) {
    if (x === null) {
      this.pointerTarget = 0;
      this.pointerActive = false;
      this.trail.lift();
      return;
    }
    this.pointerActive = true;
    this.pointerNdc.set(x, y);
    this.pointerTarget = 1;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  play() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.renderer.setAnimationLoop(this.frame);
  }

  pause() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  dispose() {
    this.pause();
    this.trail.dispose();
    this.group.traverse((object) => {
      const item = object as Points;
      item.geometry?.dispose();
      (item.material as ShaderMaterial | undefined)?.dispose?.();
    });
    this.renderer.dispose();
  }

  private frame = () => {
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 1 / 20);
    this.last = now;
    const time = (now - this.start) / 1000;

    // Ease the stage so scroll jumps still morph smoothly.
    this.stage += (this.stageTarget - this.stage) * (1 - Math.exp(-dt * 4.5));
    const u = this.uniforms;
    u.uStage.value = this.stage;
    u.uTime.value = time;
    u.uIntro.value = Math.min(1, u.uIntro.value + dt / 2.4);
    u.uPointerStrength.value += (this.pointerTarget - u.uPointerStrength.value) * (1 - Math.exp(-dt * 6));
    u.uFocusAmount.value += (this.focusTarget - u.uFocusAmount.value) * (1 - Math.exp(-dt * 5));

    // Blend the layout (position, scale, tilt) between neighbouring stages.
    const i = Math.floor(this.stage);
    const f = this.stage - i;
    const a = STAGES[i];
    const b = STAGES[Math.min(i + 1, STAGES.length - 1)];
    const ease = f * f * (3 - 2 * f);
    const portrait = this.width < this.height * 0.9;
    for (const key of ["x", "y", "scale", "tiltX", "spinSpeed", "opacity"] as const) {
      const from = portrait ? (a.mobile?.[key] ?? a[key]) : a[key];
      const to = portrait ? (b.mobile?.[key] ?? b[key]) : b[key];
      this.layout[key] = from + (to - from) * ease;
    }

    u.uOpacity.value = this.baseOpacity * this.layout.opacity;
    // Spin freely, or turn towards a stage's fixed facing (front for type and
    // road, the Arabian Sea for the globe). Facing eases in with the stage.
    const globeWeight = Math.max(0, 1 - Math.abs(this.stage - 5));
    const faceWeight = (a.face === undefined ? 0 : 1 - ease) + (b.face === undefined ? 0 : ease);
    let face = a.face ?? b.face ?? 0;
    if (a.face !== undefined && b.face !== undefined) face += shortestAngle(a.face, b.face) * ease;
    face += Math.sin(time * 0.25) * 0.12 * globeWeight;
    this.spin += dt * this.layout.spinSpeed;
    this.spin += shortestAngle(this.spin, face) * (1 - Math.exp(-dt * 5 * faceWeight));
    this.spin %= Math.PI * 2;

    const g = this.group;
    g.position.set(this.layout.x, this.layout.y, 0);
    g.scale.setScalar(this.layout.scale);
    g.rotation.y = this.spin;
    g.rotation.x = this.layout.tiltX;
    g.updateMatrixWorld();

    // Pointer → local space of the group.
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hit = new Vector3();
    if (this.raycaster.ray.intersectPlane(this.plane, hit)) {
      const local = hit.applyMatrix4(new Matrix4().copy(g.matrixWorld).invert());
      (u.uPointer.value as Vector3).copy(local);
      // Paint the trail in portrait UV space while the face is on screen.
      if (this.pointerActive && this.stage < 0.6) {
        this.trail.add(local.x / (2 * u.uPortraitHalfWidth.value) + 0.5, local.y * 0.5 + 0.5);
      }
    }

    const arc = this.arcUniforms;
    arc.uTime.value = time;
    arc.uOpacity.value = globeWeight * 0.9 * u.uOpacity.value;
    arc.uDraw.value += ((globeWeight > 0.6 ? 1 : 0) - arc.uDraw.value) * (1 - Math.exp(-dt * 1.6));
    this.arcs.visible = globeWeight > 0.01;

    this.trail.update(dt);
    this.renderer.render(this.scene, this.camera);
  };
}

/** Signed difference from angle a to angle b, wrapped to (-π, π]. */
function shortestAngle(a: number, b: number) {
  const d = (b - a) % (Math.PI * 2);
  return d > Math.PI ? d - Math.PI * 2 : d < -Math.PI ? d + Math.PI * 2 : d;
}
