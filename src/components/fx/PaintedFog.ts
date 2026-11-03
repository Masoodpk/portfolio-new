/**
 * Painted fog: distance + height fog for every world material and shader.
 * Low valleys hold thick mist (density grows below uFogBase), and the fog
 * colour shifts from green-grey mist nearby to sky blue far away, so layers
 * recede like a landscape painting's aerial perspective.
 * The uniforms live in world/shaders.ts (`world`) so later stages can move
 * them through the day.
 */
export const FOG_GLSL = /* glsl */ `
  uniform vec3 uFogNear;
  uniform vec3 uFogFar;
  uniform float uFogDensity;
  uniform float uFogBase;
  uniform float uFogFalloff;
  vec3 paintedFog(vec3 color, vec3 worldPos) {
    float dist = distance(worldPos, cameraPosition);
    float low = exp(-max(worldPos.y - uFogBase, 0.0) * uFogFalloff);
    float amount = 1.0 - exp(-dist * uFogDensity * (0.5 + 1.2 * low));
    vec3 fogColor = mix(uFogNear, uFogFar, smoothstep(250.0, 2400.0, dist));
    return mix(color, fogColor, clamp(amount, 0.0, 1.0));
  }
`;

