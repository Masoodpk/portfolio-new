"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, Color, DirectionalLight, HemisphereLight, Mesh, ShaderMaterial, SphereGeometry } from "three";
import { daylight, MOON_DIR, updateDaylight } from "./daylight";
import { brushTexture, NOISE_GLSL, world } from "./shaders";

/**
 * The painted sky, moving through the day with the scroll (see daylight.ts):
 * a soft gradient from horizon to zenith, long brushed cloud bands and a
 * glow around the sun. At night: a deep teal sky, a few stars, and a
 * painted moon with monsoon clouds drifting across it, their edges lit
 * silver. The horizon colour matches the far fog, so distant ridges
 * dissolve into it.
 */
export function Sky() {
  const domeRef = useRef<Mesh>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const sunRef = useRef<DirectionalLight>(null);
  const backgroundRef = useRef<Color>(null);

  const dome = useMemo(
    () => ({
      geometry: new SphereGeometry(4500, 48, 24),
      material: new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        uniforms: {
          uHorizon: { value: daylight.horizon },
          uZenith: { value: daylight.zenith },
          uGlow: { value: daylight.glow },
          uClouds: { value: daylight.clouds },
          uSunDir: { value: daylight.sunDir },
          uMoonDir: { value: MOON_DIR },
          uNight: daylight.uNight,
          uBrush: { value: brushTexture() },
          uTime: world.uTime,
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uHorizon, uZenith, uGlow, uClouds, uSunDir, uMoonDir;
          uniform sampler2D uBrush;
          uniform float uTime, uNight;
          varying vec3 vDir;
          ${NOISE_GLSL}
          float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
          void main() {
            vec3 dir = normalize(vDir);
            float h = clamp(dir.y, 0.0, 1.0);
            vec3 color = mix(uHorizon, uZenith, smoothstep(0.0, 0.55, h));
            float stroke = texture2D(uBrush, vec2(atan(dir.x, -dir.z) * 2.0, h * 3.2)).r;

            // Stars: sparse, soft, only high up and only at night
            vec3 cell = floor(dir * 160.0);
            float star = step(0.993, hash3(cell)) * smoothstep(0.42, 0.1, length(fract(dir * 160.0) - 0.5));
            color += vec3(0.85, 0.9, 1.0) * star * uNight * smoothstep(0.12, 0.4, h) * (0.6 + 0.4 * sin(uTime * 2.0 + hash3(cell) * 40.0));

            // Sun glow, fading out after sunset
            float sun = max(dot(dir, uSunDir), 0.0);
            color += uGlow * (pow(sun, 6.0) * 0.28 + pow(sun, 120.0) * 0.5) * (1.0 - uNight);

            // The moon: a painted disc with soft grey seas, and a wide halo
            float m = dot(dir, uMoonDir);
            vec3 side = normalize(cross(uMoonDir, vec3(0.0, 1.0, 0.0)));
            vec3 up = cross(side, uMoonDir);
            vec2 mp = vec2(dot(dir, side), dot(dir, up)) / 0.034;
            float disc = smoothstep(1.0, 0.93, length(mp));
            float seas = wFbm(mp * 1.6 + 3.0);
            vec3 moon = mix(vec3(0.98, 0.95, 0.85), vec3(0.72, 0.74, 0.76), smoothstep(0.45, 0.7, seas) * 0.7);
            float halo = pow(max(m, 0.0), 220.0) * 0.55 + pow(max(m, 0.0), 22.0) * 0.18;
            color += vec3(0.7, 0.82, 0.9) * halo * uNight;
            color = mix(color, moon, disc * uNight);

            // Brushed cloud bands, drifting; heavier for the monsoon
            vec2 p = vec2(atan(dir.x, -dir.z) * 2.2 + uTime * (0.004 + uNight * 0.006), h * 9.0);
            float clouds = wFbm(vec2(p.x * 1.2, p.y * 3.2));
            float brush = texture2D(uBrush, vec2(p.x * 0.9, p.y * 0.35)).r;
            float cover = 0.5 - uNight * 0.1;
            float band = smoothstep(cover, cover + 0.28, clouds + (brush - 0.5) * 0.35) * smoothstep(0.02, 0.12, h) * (1.0 - smoothstep(0.35, 0.7, h));
            // Clouds near the sun or moon catch its light at their edges
            float lit = pow(max(dot(dir, uSunDir), 0.0), 8.0) * (1.0 - uNight) + pow(max(m, 0.0), 60.0) * uNight;
            vec3 cloudColor = uClouds + vec3(1.0, 0.95, 0.85) * lit * 0.5;
            color = mix(color, cloudColor, band * (0.55 + uNight * 0.3));

            // Brush texture over the whole sky
            color *= 0.94 + stroke * 0.12;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    }),
    [],
  );

  useFrame(({ camera }, delta) => {
    // The world clock: one shared time uniform for wind, water, mist and clouds.
    world.uTime.value += Math.min(delta, 0.1);
    updateDaylight(Math.min(delta, 0.1));
    // The dome follows the camera so it never comes close.
    domeRef.current?.position.copy(camera.position);
    backgroundRef.current?.copy(daylight.horizon);
    const hemi = hemiRef.current;
    if (hemi) {
      hemi.color.copy(daylight.hemiSky);
      hemi.groundColor.copy(daylight.hemiGround);
      hemi.intensity = daylight.hemiIntensity;
    }
    const sun = sunRef.current;
    if (sun) {
      sun.color.copy(daylight.sun);
      sun.intensity = daylight.sunIntensity;
      sun.position.copy(daylight.sunDir).multiplyScalar(800);
    }
  });

  return (
    <>
      <color ref={backgroundRef} attach="background" args={[daylight.horizon]} />
      <mesh ref={domeRef} geometry={dome.geometry} material={dome.material} frustumCulled={false} renderOrder={-1} />
      <hemisphereLight ref={hemiRef} args={[daylight.hemiSky, daylight.hemiGround, daylight.hemiIntensity]} />
      <directionalLight ref={sunRef} color={daylight.sun} intensity={daylight.sunIntensity} position={daylight.sunDir.clone().multiplyScalar(800)} />
    </>
  );
}
