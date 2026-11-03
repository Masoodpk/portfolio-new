import { Effect, EffectAttribute } from "postprocessing";
import { Uniform } from "three";

/**
 * A painterly Kuwahara filter. For every pixel it looks at four quadrants
 * of its neighbourhood and keeps the average colour of the calmest one (the
 * lowest variance). Flat areas become patches of paint, while edges stay
 * crisp, like brush strokes laid side by side.
 *
 * Twist: the sampling grid is rotated by a slowly varying noise field, so
 * the strokes run in different directions across the image instead of all
 * lining up with the screen (a cheap stand-in for the anisotropic version).
 *
 * `radius` is in pixels of the render target: ~3–4 keeps leaves and edges
 * clear while still reading as paint; `strength` blends with the original.
 */
const fragment = /* glsl */ `
  uniform float radius;
  uniform float strength;

  float kHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float kNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(kHash(i), kHash(i + vec2(1, 0)), u.x), mix(kHash(i + vec2(0, 1)), kHash(i + vec2(1, 1)), u.x), u.y);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float angle = kNoise(uv * vec2(5.0, 3.5)) * 3.14159;
    float c = cos(angle), s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    vec2 step = texelSize * radius / 2.0;

    // Four overlapping quadrants, 3 × 3 samples each, weighted by a soft
    // falloff so the result is smooth paint rather than square blocks.
    vec4 m0 = vec4(0.0), m1 = vec4(0.0), m2 = vec4(0.0), m3 = vec4(0.0);
    vec3 s0 = vec3(0.0), s1 = vec3(0.0), s2 = vec3(0.0), s3 = vec3(0.0);
    for (int j = 0; j <= 2; j++) {
      for (int i = 0; i <= 2; i++) {
        vec2 o = rot * vec2(float(i), float(j));
        float w = exp(-dot(o, o) * 0.22);
        vec2 a = o * step;
        vec2 b = vec2(-o.y, o.x) * step;
        vec3 col;
        col = texture2D(inputBuffer, uv + a).rgb;  m0 += vec4(col * w, w); s0 += col * col * w;
        col = texture2D(inputBuffer, uv + b).rgb;  m1 += vec4(col * w, w); s1 += col * col * w;
        col = texture2D(inputBuffer, uv - a).rgb;  m2 += vec4(col * w, w); s2 += col * col * w;
        col = texture2D(inputBuffer, uv - b).rgb;  m3 += vec4(col * w, w); s3 += col * col * w;
      }
    }
    vec3 a0 = m0.rgb / m0.a, a1 = m1.rgb / m1.a, a2 = m2.rgb / m2.a, a3 = m3.rgb / m3.a;
    float v0 = dot(s0 / m0.a - a0 * a0, vec3(1.0));
    float v1 = dot(s1 / m1.a - a1 * a1, vec3(1.0));
    float v2 = dot(s2 / m2.a - a2 * a2, vec3(1.0));
    float v3 = dot(s3 / m3.a - a3 * a3, vec3(1.0));

    // Blend the quadrants by how calm they are (soft minimum), not a hard
    // pick: no flicker, no stair-steps along edges.
    float k = 60.0;
    float w0 = exp(-v0 * k), w1 = exp(-v1 * k), w2 = exp(-v2 * k), w3 = exp(-v3 * k);
    vec3 painted = (a0 * w0 + a1 * w1 + a2 * w2 + a3 * w3) / max(w0 + w1 + w2 + w3, 1e-5);
    outputColor = vec4(mix(inputColor.rgb, painted, strength), inputColor.a);
  }
`;

export class KuwaharaEffect extends Effect {
  constructor({ radius = 4, strength = 0.9 } = {}) {
    super("KuwaharaEffect", fragment, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map([
        ["radius", new Uniform(radius)],
        ["strength", new Uniform(strength)],
      ]),
    });
  }

  get radius() {
    return this.uniforms.get("radius")!.value as number;
  }

  set radius(value: number) {
    this.uniforms.get("radius")!.value = value;
  }
}
