/**
 * Maps hero scroll progress (0–1) to the hand's animation state.
 *
 * Clip facts (measured from hand_snap_v2.glb):
 *  - "Snap" is 1.2s: preparation 0–0.58s, tension 0.58–0.75s,
 *    release at ~0.78s (middle finger peaks at 46 rad/s), hold until 1.2s.
 *  - "Recovery" is 0.5s and starts from the Snap end pose.
 *
 * Scroll scrubs the preparation and tension. Crossing SNAP_TRIGGER plays the
 * release in real time — a snap scrubbed at scroll speed reads as slow motion.
 */
export const SNAP_CLIP = {
  duration: 1.2,
  tensionEnd: 0.75,
  release: 0.783,
} as const;

export const RECOVERY_DURATION = 0.5;

export const SNAP_TRIGGER = 0.62;
const BUILD_START = 0.06;
const RECOVERY_START = 0.8;

export type HandPose = {
  /** Where the Snap clip should be when the scroll is the only input */
  snapTarget: number;
  /** Whether the real-time release should be playing */
  triggered: boolean;
  /** Recovery clip time */
  recoveryTime: number;
  /** 0 = Snap pose, 1 = Recovery pose */
  recoveryWeight: number;
  /** Whole-hand rotation, radians */
  rotationY: number;
  rotationX: number;
  rotationZ: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (v: number, start: number, end: number) => clamp01((v - start) / (end - start));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function poseAt(progress: number): HandPose {
  const p = clamp01(progress);

  const build = easeInOutCubic(range(p, BUILD_START, SNAP_TRIGGER));
  const recovery = range(p, RECOVERY_START, 1);
  // The turn happens during the build-up, so the snap lands facing the viewer.
  const turn = easeInOutCubic(range(p, 0, SNAP_TRIGGER));

  return {
    snapTarget: build * SNAP_CLIP.tensionEnd,
    triggered: p >= SNAP_TRIGGER,
    recoveryTime: easeOutCubic(recovery) * RECOVERY_DURATION,
    recoveryWeight: recovery > 0 ? 1 : 0,
    rotationY: lerp(-0.9, 0.25, turn) + 0.12 * recovery,
    rotationX: lerp(0.18, -0.05, turn),
    rotationZ: lerp(-0.12, 0.08, turn),
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Progress for a pinned section: 0 when its top hits the viewport top, 1 when its bottom does. */
export function pinnedProgress(rectTop: number, rectHeight: number, viewportHeight: number) {
  const travel = rectHeight - viewportHeight;
  if (travel <= 0) return 0;
  return clamp01(-rectTop / travel);
}

/** Progress for an unpinned stage: 0 as it enters the bottom, 1 once its top reaches 15% of the viewport. */
export function passThroughProgress(rectTop: number, viewportHeight: number) {
  return clamp01((viewportHeight * 0.95 - rectTop) / (viewportHeight * 0.8));
}
