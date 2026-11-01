import { describe, expect, it } from "vitest";
import {
  passThroughProgress,
  pinnedProgress,
  poseAt,
  SNAP_CLIP,
  SNAP_TRIGGER,
} from "@/components/three/hand-timeline";

describe("poseAt", () => {
  it("starts relaxed at the top of the page", () => {
    const pose = poseAt(0);
    expect(pose.snapTarget).toBe(0);
    expect(pose.triggered).toBe(false);
    expect(pose.recoveryWeight).toBe(0);
  });

  it("builds tension up to, but never past, the release frame while scrubbing", () => {
    const justBefore = poseAt(SNAP_TRIGGER - 0.001);
    expect(justBefore.triggered).toBe(false);
    expect(justBefore.snapTarget).toBeLessThanOrEqual(SNAP_CLIP.tensionEnd);
    expect(justBefore.snapTarget).toBeLessThan(SNAP_CLIP.release);
  });

  it("triggers the real-time snap at the threshold", () => {
    expect(poseAt(SNAP_TRIGGER).triggered).toBe(true);
  });

  it("is monotonic during the build-up", () => {
    let previous = -1;
    for (let p = 0; p < SNAP_TRIGGER; p += 0.02) {
      const { snapTarget } = poseAt(p);
      expect(snapTarget).toBeGreaterThanOrEqual(previous);
      previous = snapTarget;
    }
  });

  it("finishes in the recovery pose", () => {
    const end = poseAt(1);
    expect(end.recoveryWeight).toBe(1);
    expect(end.recoveryTime).toBeCloseTo(0.5);
  });

  it("clamps out-of-range progress", () => {
    expect(poseAt(-5)).toEqual(poseAt(0));
    expect(poseAt(9)).toEqual(poseAt(1));
  });
});

describe("scroll progress", () => {
  it("maps a pinned section's travel to 0–1", () => {
    expect(pinnedProgress(0, 2000, 800)).toBe(0);
    expect(pinnedProgress(-600, 2000, 800)).toBeCloseTo(0.5);
    expect(pinnedProgress(-5000, 2000, 800)).toBe(1);
    expect(pinnedProgress(0, 500, 800)).toBe(0);
  });

  it("maps an unpinned stage passing through the viewport", () => {
    expect(passThroughProgress(1000, 1000)).toBe(0);
    expect(passThroughProgress(150, 1000)).toBeCloseTo(1);
  });
});
