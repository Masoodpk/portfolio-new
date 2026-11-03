import { FOG_GLSL } from "@/components/fx/PaintedFog";
import { CanvasTexture, Color, RepeatWrapping, SRGBColorSpace, Vector3, type Material, type Texture, type WebGLProgramParametersWithUniforms } from "three";

/**
 * Shared GLSL and uniforms that make the world look painted.
 *
 * - Brush strokes: a procedurally painted stroke texture, projected onto
 *   every surface in world space (triplanar). It varies the colour like
 *   gouache and nudges the normals so light breaks into strokes instead of
 *   smooth gradients. The Kuwahara post-process (fx/) then turns pixels
 *   into paint.
 * - Painted fog: distance + height fog. Low valleys hold thick mist, and far
 *   layers shift from green-grey mist to sky blue (aerial perspective).
 * - Wind: foliage sways with gusts that roll across the canopy.
 * - Cloud shadows: a slow drifting pattern darkens the ground and trees.
 */

/** Direction towards the sun: low in the south-west, raking light across the peaks' faces. */
export const SUN_DIR = new Vector3(-0.7, 0.5, 0.5).normalize();

export { FOG_GLSL };

export const world = {
  uTime: { value: 0 },
  uFogNear: { value: new Color("#9fbfb0") },
  uFogFar: { value: new Color("#b5d3da") },
  uFogDensity: { value: 0.00042 },
  uFogBase: { value: 10 },
  uFogFalloff: { value: 0.009 },
  uBrush: { value: null as Texture | null },
  uLeaves: { value: null as Texture | null },
};

/* ─── The brush-stroke texture ───────────────────────────────────────────── */

/**
 * Paints a tileable sheet of short, mostly diagonal strokes in greys around
 * 50%, like dry gouache on paper. Made once, on the client.
 */
export function brushTexture() {
  if (world.uBrush.value) return world.uBrush.value;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgb(128,128,128)";
  ctx.fillRect(0, 0, size, size);
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  ctx.lineCap = "round";
  for (let i = 0; i < 2600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const angle = -0.6 + (rand() - 0.5) * 0.9;
    const length = 10 + rand() * 34;
    const width = 2 + rand() * 6;
    const tone = Math.round(70 + rand() * 120);
    ctx.strokeStyle = `rgba(${tone},${tone},${tone},${0.18 + rand() * 0.3})`;
    ctx.lineWidth = width;
    // Draw with wrap-around so the sheet tiles seamlessly.
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        ctx.beginPath();
        ctx.moveTo(x + ox, y + oy);
        ctx.quadraticCurveTo(
          x + ox + Math.cos(angle) * length * 0.5 + (rand() - 0.5) * 6,
          y + oy + Math.sin(angle) * length * 0.5 + (rand() - 0.5) * 6,
          x + ox + Math.cos(angle) * length,
          y + oy + Math.sin(angle) * length,
        );
        ctx.stroke();
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  world.uBrush.value = texture;
  return texture;
}

/**
 * A tileable sheet of overlapping leaves (white on transparent). Crowns use
 * it as a cut-out mask in world space, so their edges break up into leaves
 * and you see layers of foliage through the gaps. About 60% covered, so at
 * a distance (mipmapped) the crown reads as solid again.
 */
export function leavesTexture() {
  if (world.uLeaves.value) return world.uLeaves.value;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  let seed = 23;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 230; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const angle = rand() * Math.PI * 2;
    const length = 26 + rand() * 30;
    const width = length * (0.32 + rand() * 0.14);
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        ctx.save();
        ctx.translate(x + ox, y + oy);
        ctx.rotate(angle);
        // A pointed leaf: two arcs meeting at the tip
        ctx.beginPath();
        ctx.moveTo(-length / 2, 0);
        ctx.quadraticCurveTo(0, -width, length / 2, 0);
        ctx.quadraticCurveTo(0, width, -length / 2, 0);
        ctx.fill();
        ctx.restore();
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  world.uLeaves.value = texture;
  return texture;
}

/* ─── GLSL ───────────────────────────────────────────────────────────────── */

export const NOISE_GLSL = /* glsl */ `
  float wHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float wNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(wHash(i), wHash(i + vec2(1, 0)), u.x), mix(wHash(i + vec2(0, 1)), wHash(i + vec2(1, 1)), u.x), u.y);
  }
  float wFbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += wNoise(p) * a; p *= 2.03; a *= 0.5; }
    return s / 0.9375;
  }
`;

/** Darkening from the clouds' shadows at a world xz position (1 = full sun). */
export const CLOUD_SHADOW_GLSL = /* glsl */ `
  float cloudShade(vec2 xz, float t) {
    float n = wFbm(xz * 0.0028 + vec2(t * 0.006, t * 0.0025));
    return 1.0 - 0.26 * smoothstep(0.52, 0.72, n);
  }
`;

/** World-space triplanar brush sample, 0…1 around 0.5. */
const BRUSH_GLSL = /* glsl */ `
  uniform sampler2D uBrush;
  float brush(vec3 p, vec3 n, float scale) {
    vec3 w = pow(abs(n), vec3(4.0));
    w /= (w.x + w.y + w.z);
    float a = texture2D(uBrush, p.zy * scale).r;
    float b = texture2D(uBrush, p.xz * scale).r;
    float c = texture2D(uBrush, p.xy * scale).r;
    return a * w.x + b * w.y + c * w.z;
  }
`;

const WIND_GLSL = /* glsl */ `
  const vec2 WIND_DIR = normalize(vec2(0.8, -0.6));
  vec2 windOffset(vec2 xz, float t) {
    float gust = 0.5 + 0.5 * sin(dot(xz, WIND_DIR) * 0.018 - t * 1.4);
    gust = gust * gust;
    float base = sin(t * 1.1 + xz.x * 0.05 + xz.y * 0.043);
    return WIND_DIR * (base * 0.35 + gust * 1.1);
  }
`;

type PaintOptions = {
  /** Sway with the wind (foliage) */
  wind?: boolean;
  /** Local height below which nothing sways */
  swayHeight?: number;
  swayScale?: number;
  /** Brush-stroke strength (0 = flat colour) and world-space scale of the strokes */
  strokes?: number;
  strokeScale?: number;
  /** Darken under passing clouds */
  cloudShadows?: boolean;
  /** How much the painted fog applies (1 = fully; the 3D name keeps a little clearer) */
  fog?: number;
  /** Cut the surface into leaves (crowns): world-space scale of the leaf mask, 0 = off */
  leafCut?: number;
  /**
   * Paint a canopy of tree crowns onto the surface where the geometry's
   * `aForest` attribute is 1 (the terrain on the slopes): from afar it reads
   * as dense forest without drawing every tree.
   */
  canopy?: boolean;
  /**
   * Foliage cards: light both faces alike (the cards carry volume normals
   * pointing out of the crown, which must not flip on the back face).
   */
  foliage?: boolean;
};

/**
 * Turns a built-in material (Lambert/Standard) into a painted one: brush
 * strokes, painted fog, and optionally wind and cloud shadows.
 */
export function paint(
  material: Material,
  { wind = false, swayHeight = 0, swayScale = 1, strokes = 1, strokeScale = 0.045, cloudShadows = true, fog = 1, leafCut = 0, canopy = false, foliage = false }: PaintOptions = {},
) {
  brushTexture();
  if (leafCut) {
    leavesTexture();
    material.alphaToCoverage = true;
  }
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, {
      uTime: world.uTime,
      uBrush: world.uBrush,
      uLeaves: world.uLeaves,
      uFogNear: world.uFogNear,
      uFogFar: world.uFogFar,
      uFogDensity: world.uFogDensity,
      uFogBase: world.uFogBase,
      uFogFalloff: world.uFogFalloff,
    });
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uTime;
        varying vec3 vPaintPos;
        varying vec3 vPaintNormal;
        ${canopy ? "attribute float aForest;\nvarying float vForest;" : ""}
        ${WIND_GLSL}`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          mat4 paintModel = modelMatrix * instanceMatrix;
        #else
          mat4 paintModel = modelMatrix;
        #endif
        vec4 paintWorld = paintModel * vec4(position, 1.0);
        ${
          wind
            ? `float bend = max(0.0, position.y - ${swayHeight.toFixed(2)}) * ${swayScale.toFixed(3)};
               transformed.xz += windOffset(paintWorld.xz, uTime) * bend;`
            : ""
        }
        vPaintPos = (paintModel * vec4(transformed, 1.0)).xyz;
        vPaintNormal = normalize(mat3(paintModel) * objectNormal);
        ${canopy ? "vForest = aForest;" : ""}`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uTime;
        varying vec3 vPaintPos;
        varying vec3 vPaintNormal;
        ${NOISE_GLSL}
        ${CLOUD_SHADOW_GLSL}
        ${FOG_GLSL}
        ${BRUSH_GLSL}
        uniform sampler2D uLeaves;
        ${canopy ? "varying float vForest;" : ""}`,
      )
      // Colour: gouache-like variation from the strokes
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float paintStroke = brush(vPaintPos, vPaintNormal, ${strokeScale.toFixed(4)});
        float paintStroke2 = brush(vPaintPos * 0.37 + 11.0, vPaintNormal, ${strokeScale.toFixed(4)});
        diffuseColor.rgb *= mix(1.0, 0.72 + paintStroke * 0.56, ${strokes.toFixed(2)});
        ${
          canopy
            ? `// Crowns about 12 m across: light where a crown bulges, dark in the gaps
               vec2 crownUv = vPaintPos.xz * 0.085;
               float crown0 = wFbm(crownUv);
               float crownX = wFbm(crownUv + vec2(0.12, 0.0));
               float crownZ = wFbm(crownUv + vec2(0.0, 0.12));
               float crownMask = smoothstep(0.38, 0.66, crown0);
               vec3 canopyColor = mix(vec3(0.11, 0.22, 0.16), vec3(0.34, 0.5, 0.28), crownMask);
               diffuseColor.rgb = mix(diffuseColor.rgb, canopyColor * (0.85 + paintStroke * 0.3), vForest * 0.9);
               // Rock: steep ground is bare rock, streaked by gullies running
               // downhill; the high ridges weather to pale granite and scree
               float steepRock = 1.0 - smoothstep(0.42, 0.8, vPaintNormal.y);
               float gully = wFbm(vec2((vPaintPos.x + vPaintPos.z) * 0.085, vPaintPos.y * 0.007));
               float streak = wNoise(vec2((vPaintPos.x - vPaintPos.z) * 0.12, vPaintPos.y * 0.018));
               float highUp = smoothstep(300.0, 480.0, vPaintPos.y);
               // Darker, slaty rock up high, so the snow stands out against it
               vec3 rockColor = mix(vec3(0.3, 0.3, 0.27), vec3(0.6, 0.58, 0.52), smoothstep(0.25, 0.8, streak)) * (1.0 - highUp * 0.3);
               // Rock shows in streaks between green, more of it the higher and steeper
               float rockMask = clamp(steepRock * smoothstep(0.56, 0.7, gully + highUp * 0.2) + highUp * steepRock * 0.3, 0.0, 1.0);
               diffuseColor.rgb = mix(diffuseColor.rgb, rockColor * (0.85 + paintStroke * 0.3), rockMask);
               // Gullies: darker channels down every slope
               diffuseColor.rgb *= 1.0 - steepRock * 0.25 * smoothstep(0.55, 0.3, gully);
               // Scree: a few pale fans of broken rock below the snow
               float pale = highUp * (1.0 - smoothstep(440.0, 480.0, vPaintPos.y)) * smoothstep(0.62, 0.76, wFbm(vPaintPos.xz * 0.013 + 3.0)) * (1.0 - steepRock * 0.4);
               diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.7, 0.68, 0.63) * (0.9 + paintStroke * 0.2), pale * 0.5);
               // Snow on the highest summits: patchy from about 455 m, lying in
               // hollows and gullies and on gentler slopes; the steepest rock stays bare
               float snowLine = 455.0 + (wFbm(vPaintPos.xz * 0.02 + 7.0) - 0.5) * 70.0;
               float snow = smoothstep(snowLine, snowLine + 45.0, vPaintPos.y);
               snow *= smoothstep(0.32, 0.62, vPaintNormal.y + (0.55 - gully) * 0.35);
               // Crisp-edged patches, fuller towards the tops
               snow *= smoothstep(0.42, 0.5, wFbm(vPaintPos.xz * 0.05 + 11.0) + snow * 0.3);
               vec3 snowColor = mix(vec3(0.82, 0.87, 0.95), vec3(1.0), smoothstep(0.2, 0.9, vPaintNormal.y));
               diffuseColor.rgb = mix(diffuseColor.rgb, snowColor * (0.93 + paintStroke * 0.1), snow);`
            : ""
        }
        ${
          leafCut
            ? `{
                vec3 lw = pow(abs(vPaintNormal), vec3(4.0)); lw /= (lw.x + lw.y + lw.z);
                float leaf = texture2D(uLeaves, vPaintPos.zy * ${leafCut.toFixed(4)}).a * lw.x
                           + texture2D(uLeaves, vPaintPos.xz * ${leafCut.toFixed(4)}).a * lw.y
                           + texture2D(uLeaves, vPaintPos.xy * ${leafCut.toFixed(4)}).a * lw.z;
                // Clear gaps are cut; leaf edges fade out through alpha-to-coverage,
                // which the multisampled composer turns into smooth, unpixelated edges.
                if (leaf < 0.28) discard;
                diffuseColor.a = smoothstep(0.3, 0.55, leaf);
                // Light catches the leaf edges
                diffuseColor.rgb *= 0.9 + smoothstep(0.42, 0.9, leaf) * 0.2;
              }`
            : ""
        }`,
      )
      // Light: strokes nudge the normal, so shading breaks into paint marks
      .replace(
        "#include <normal_fragment_begin>",
        `#include <normal_fragment_begin>
        ${foliage ? "#ifdef DOUBLE_SIDED\n normal *= faceDirection;\n#endif" : ""}
        normal = normalize(normal + vec3(paintStroke - 0.5, paintStroke2 - 0.5, paintStroke - paintStroke2) * ${(0.7 * strokes).toFixed(2)});
        ${canopy ? "normal = normalize(normal + (viewMatrix * vec4(vec3(crown0 - crownX, 0.0, crown0 - crownZ) * 7.0, 0.0)).xyz * vForest);" : ""}`,
      )
      .replace(
        "#include <fog_fragment>",
        `${cloudShadows ? "gl_FragColor.rgb *= cloudShade(vPaintPos.xz, uTime);" : ""}
        gl_FragColor.rgb = mix(gl_FragColor.rgb, paintedFog(gl_FragColor.rgb, vPaintPos), ${fog.toFixed(2)});`,
      );
  };
  material.customProgramCacheKey = () => `paint-${wind}-${swayHeight}-${swayScale}-${strokes}-${strokeScale}-${cloudShadows}-${fog}-${leafCut}-${canopy}-${foliage}`;
  return material;
}
