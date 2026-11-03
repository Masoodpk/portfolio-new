import { Effect } from "postprocessing";
import { Uniform, type WebGLRenderer, type WebGLRenderTarget } from "three";

/**
 * The last layer of the painting: colour grading, paper and a soft vignette.
 * - Grade: slightly desaturated, cool teal lifted into the shadows and warm
 *   highlights, like gouache on toned paper.
 * - Paper: a fixed tooth (bumpy texture) plus faint fibres, so the image
 *   sits on paper rather than glass; and a light moving grain.
 * - Vignette: the edges darken gently to hold the eye in the middle.
 * Runs after tone mapping, on display colours.
 */
const fragment = /* glsl */ `
  uniform float time;
  uniform float strength;

  float pHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float pNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(pHash(i), pHash(i + vec2(1, 0)), u.x), mix(pHash(i + vec2(0, 1)), pHash(i + vec2(1, 1)), u.x), u.y);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 c = inputColor.rgb;

    // Grade
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, 1.04);
    c += vec3(0.0, 0.018, 0.03) * (1.0 - l) * strength;   // cool shadows
    c *= mix(vec3(1.0), vec3(1.03, 1.01, 0.96), l);          // warm highlights

    // Paper: tooth and fibres fixed to the screen, grain that shimmers
    vec2 px = uv * resolution;
    float tooth = pNoise(px * 0.35) * 0.6 + pNoise(px * 0.09) * 0.4;
    float fibres = pNoise(vec2(px.x * 0.04, px.y * 0.9));
    float grain = pHash(px + fract(time) * 97.0) - 0.5;
    c *= 1.0 + ((tooth - 0.5) * 0.04 + (fibres - 0.5) * 0.02 + grain * 0.018) * strength;

    // Vignette
    vec2 d = uv - 0.5;
    c *= 1.0 - dot(d, d) * 0.5;

    outputColor = vec4(c, inputColor.a);
  }
`;

export class PaperGrainEffect extends Effect {
  constructor({ strength = 1 } = {}) {
    super("PaperGrainEffect", fragment, {
      uniforms: new Map([
        ["time", new Uniform(0)],
        ["strength", new Uniform(strength)],
      ]),
    });
  }

  update(_renderer: WebGLRenderer, _input: WebGLRenderTarget, deltaTime?: number) {
    this.uniforms.get("time")!.value += deltaTime ?? 0;
  }
}
