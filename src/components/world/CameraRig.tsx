"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { easeBetweenShots, positionCurve, SHOTS, targetCurve } from "@/lib/cameraPath";
import { measureShotMoments, reducedMotion, scrollProgress } from "@/lib/journey";

/** How quickly the camera catches up with its target each frame at 60fps (0…1). Lower = heavier. */
const DAMPING = 0.06;
/** Mouse parallax, in world units at 20 m from what the camera looks at (scales with distance). */
const PARALLAX = 0.2;
/** Drone banking: radians of roll per radian/second of turning, and the most it will lean. */
const BANK = 0.35;
const MAX_BANK = 0.12;

/**
 * Portrait screens see less sideways. Widen the lens there (partly) so the
 * wide shots still hold their subject; 1.2 is the aspect the shots are
 * composed for.
 */
const lensFor = (fov: number, aspect: number) =>
  aspect >= 1.2 ? fov : Math.min(72, (2 * Math.atan(Math.tan((fov * Math.PI) / 360) * Math.pow(1.2 / aspect, 0.7)) * 180) / Math.PI);

/** Where the camera is looking (damped). The depth of field focuses here. */
export const cameraFocus = new Vector3();


/**
 * THE SCROLL CAMERA
 *
 * Every frame:
 * 1. Read scroll progress (0…1) and find which two shots it lies between
 *    (each shot's moment is measured from its chapter's section on the page).
 * 2. Ease between them and convert that to a point on the position and
 *    target curves (curve parameter i / (n − 1) is exactly shot i).
 * 3. Add a little mouse parallax, then damp the real camera toward that
 *    point, frame-rate independently, so motion is heavy and never snaps.
 * 4. Bank into turns like a drone: roll follows how fast the heading changes.
 *
 * With reduced motion the camera cuts between the shots instead of flying.
 */
export function CameraRig() {
  const moments = useRef<number[]>(SHOTS.map((_, i) => i / (SHOTS.length - 1)));
  const pointer = useRef({ x: 0, y: 0, ex: 0, ey: 0 });
  const state = useRef({ pos: new Vector3(), look: new Vector3(), ready: false, heading: 0, roll: 0 });
  const temp = useRef({ pos: new Vector3(), look: new Vector3(), right: new Vector3(), up: new Vector3(), dir: new Vector3() });

  // Re-measure where each shot happens whenever the page's layout changes.
  useEffect(() => {
    const measure = () => {
      moments.current = measureShotMoments();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    const onPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  useFrame((frame, delta) => {
    const camera = frame.camera as PerspectiveCamera;
    const dt = Math.min(delta, 0.1);
    const still = reducedMotion();
    const t = temp.current;
    const s = state.current;

    // 1–2: scroll progress → curve parameter
    const progress = scrollProgress();
    const m = moments.current;
    let i = 0;
    while (i < m.length - 2 && progress > m[i + 1]) i++;
    const span = Math.max(1e-6, m[i + 1] - m[i]);
    const local = Math.min(1, Math.max(0, (progress - m[i]) / span));
    const eased = still ? Math.round(local) : easeBetweenShots(local);
    const u = (i + eased) / (SHOTS.length - 1);
    positionCurve.getPoint(u, t.pos);
    targetCurve.getPoint(u, t.look);
    const fov = lensFor(SHOTS[i].fov + (SHOTS[i + 1].fov - SHOTS[i].fov) * eased, camera.aspect);

    // 3: mouse parallax across the view, scaled to the distance being looked at
    if (!still) {
      const p = pointer.current;
      const ease = 1 - Math.exp(-dt * 3);
      p.ex += (p.x - p.ex) * ease;
      p.ey += (p.y - p.ey) * ease;
      const distance = t.pos.distanceTo(t.look);
      const amount = PARALLAX * Math.max(1, distance / 20);
      t.dir.subVectors(t.look, t.pos).normalize();
      t.right.crossVectors(t.dir, camera.up).normalize();
      t.up.crossVectors(t.right, t.dir).normalize();
      t.pos.addScaledVector(t.right, p.ex * amount).addScaledVector(t.up, -p.ey * amount);
    }

    // Damp toward the target (snap on the first frame and for reduced motion)
    const k = 1 - Math.pow(1 - DAMPING, dt * 60);
    if (!s.ready || still) {
      s.pos.copy(t.pos);
      s.look.copy(t.look);
    } else {
      s.pos.lerp(t.pos, k);
      s.look.lerp(t.look, k);
    }
    camera.position.copy(s.pos);
    camera.lookAt(s.look);
    cameraFocus.copy(s.look);

    // 4: bank into turns (heading change per second → roll), damped as well
    const heading = Math.atan2(s.look.x - s.pos.x, s.look.z - s.pos.z);
    let turn = heading - s.heading;
    turn = Math.atan2(Math.sin(turn), Math.cos(turn)); // wrap to −π…π
    s.heading = heading;
    const targetRoll = !s.ready || still || dt === 0 ? 0 : Math.max(-MAX_BANK, Math.min(MAX_BANK, (turn / dt) * BANK));
    s.roll += (targetRoll - s.roll) * (1 - Math.pow(1 - 0.04, dt * 60));
    camera.rotateZ(s.roll);
    s.ready = true;

    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov += (fov - camera.fov) * (still ? 1 : k);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
