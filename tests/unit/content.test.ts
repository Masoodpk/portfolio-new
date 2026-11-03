import { describe, expect, it } from "vitest";
import { chapters, projects, skillCategories, skills } from "@/data/content";
import { SHOTS } from "@/lib/cameraPath";

describe("content integrity", () => {
  it("has unique skill ids and only references existing skills", () => {
    const ids = skills.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const skill of skills) {
      for (const related of skill.related) expect(ids).toContain(related);
    }
  });

  it("has unique project slugs with a cover visual and https links", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const project of projects) {
      expect(project.visuals.length).toBeGreaterThan(0);
      for (const link of project.links) expect(link.href).toMatch(/^https:\/\//);
    }
  });

  it("has unique navigation ids", () => {
    const ids = chapters.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("design data", () => {
  it("gives every skill one of the five categories", () => {
    // Each category has its own ink in the Skills section.
    expect(skillCategories).toHaveLength(5);
    const ids = skillCategories.map((c) => c.id);
    for (const skill of skills) expect(ids).toContain(skill.category);
  });

  it("gives every chapter at least one camera shot, in chapter order", () => {
    const order = chapters.map((c) => c.id);
    for (const id of order) expect(SHOTS.some((s) => s.chapter === id), id).toBe(true);
    const sequence = SHOTS.map((s) => order.indexOf(s.chapter) + s.at / 10);
    expect([...sequence].sort((a, b) => a - b)).toEqual(sequence);
  });
});
