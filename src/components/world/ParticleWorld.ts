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
import { clusters, globe, journeyRibbon, latLonToVec, seedSphere, typeShape, waveField } from "./shapes";
import { STAGES, ORIGIN, DESTINATIONS, type StageLayout } from "./stages";

const vertexShader = /* glsl */ `
  attribute vec3 aS1;
  attribute vec3 aS2;
  attribute vec3 aS3;
  attribute vec3 aS4;
  attribute vec3 aS5;
  attribute vec4 aRand;

  uniform float uStage;
  uniform float uTime;
  uniform float uIntro;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uPointer;
  uniform float uPointerStrength;

  varying float vDepth;
  varying float vAlpha;

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

    // Gentle repulsion around the pointer.
    vec3 away = p - uPointer;
    float d = length(away);
    p += normalize(away + 1e-5) * uPointerStrength * smoothstep(0.38, 0.0, d) * 0.22;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.6 + aRand.z * 0.8) / -mv.z;
    vDepth = smoothstep(2.6, 5.4, -mv.z);
    vAlpha = t;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uFade;
  uniform float uOpacity;
  varying float vDepth;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.32, r);
    vec3 color = mix(uColor, uFade, vDepth * 0.75);
    gl_FragColor = vec4(color, edge * vAlpha * uOpacity * (0.85 - vDepth * 0.5));
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
};

type Uniforms = Record<string, IUniform>;

export class ParticleWorld {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(32, 1, 0.1, 60);
  private group = new Group();
  private uniforms: Uniforms;
  private arcUniforms: Uniforms;
  private arcs = new Group();
  private raycaster = new Raycaster();
  private plane = new Plane(new Vector3(0, 0, 1), 0);
  private pointerNdc = new Vector2(10, 10);
  private pointerTarget = 0;
  private stage = 0;
  private stageTarget = 0;
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

    const count = options.compact ? Math.floor(options.land.length / 2 / 2) : options.land.length / 2;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(seedSphere(count), 3));
    geometry.setAttribute("aS1", new BufferAttribute(typeShape(count, options.initials, `800 290px ${options.fontFamily}`), 3));
    geometry.setAttribute("aS2", new BufferAttribute(journeyRibbon(count), 3));
    geometry.setAttribute("aS3", new BufferAttribute(clusters(count), 3));
    geometry.setAttribute("aS4", new BufferAttribute(waveField(count), 3));
    geometry.setAttribute("aS5", new BufferAttribute(globe(count, options.land), 3));
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
    geometry.setAttribute("aRand", new BufferAttribute(rand, 4));

    this.uniforms = {
      uStage: { value: 0 },
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uSize: { value: options.compact ? 10 : 11 },
      uPixelRatio: { value: this.renderer.getPixelRatio() },
      uPointer: { value: new Vector3(10, 10, 10) },
      uPointerStrength: { value: 0 },
      uColor: { value: new Color("#2340ff") },
      uFade: { value: new Color("#f2eee5") },
      uOpacity: { value: this.baseOpacity },
    };
    const points = new Points(
      geometry,
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: this.uniforms,
        transparent: true,
        depthWrite: false,
        blending: NormalBlending,
      }),
    );
    points.frustumCulled = false;
    this.group.add(points);

    this.arcUniforms = {
      uDraw: { value: 0 },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: new Color("#1328c4") },
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

  /** Continuous stage index: 0 = hero … 5 = globe. */
  setStage(stage: number) {
    this.stageTarget = Math.max(0, Math.min(STAGES.length - 1, stage));
  }

  /** Pointer in normalised device coordinates (-1…1); pass null when it leaves. */
  setPointer(x: number | null, y = 0) {
    if (x === null) {
      this.pointerTarget = 0;
      return;
    }
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
    this.spin = (this.spin + dt * this.layout.spinSpeed) % (Math.PI * 2);
    // On the globe, turn to face the Arabian Sea between Kerala and the Gulf.
    const globeWeight = Math.max(0, 1 - Math.abs(this.stage - 5));
    const faceGulf = -((62 + 90) * Math.PI) / 180 + Math.sin(time * 0.25) * 0.12;
    let spin = this.spin;
    while (spin - faceGulf > Math.PI) spin -= Math.PI * 2;
    while (faceGulf - spin > Math.PI) spin += Math.PI * 2;

    const g = this.group;
    g.position.set(this.layout.x, this.layout.y, 0);
    g.scale.setScalar(this.layout.scale);
    g.rotation.y = spin + (faceGulf - spin) * globeWeight;
    g.rotation.x = this.layout.tiltX;
    g.updateMatrixWorld();

    // Pointer → local space of the group.
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hit = new Vector3();
    if (this.raycaster.ray.intersectPlane(this.plane, hit)) {
      (u.uPointer.value as Vector3).copy(hit.applyMatrix4(new Matrix4().copy(g.matrixWorld).invert()));
    }

    const arc = this.arcUniforms;
    arc.uTime.value = time;
    arc.uOpacity.value = globeWeight * 0.9;
    arc.uDraw.value += ((globeWeight > 0.6 ? 1 : 0) - arc.uDraw.value) * (1 - Math.exp(-dt * 1.6));
    this.arcs.visible = globeWeight > 0.01;

    this.renderer.render(this.scene, this.camera);
  };
}
