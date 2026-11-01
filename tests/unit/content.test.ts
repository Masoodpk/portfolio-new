import { describe, expect, it } from "vitest";
import { skills } from "@/content/skills";
import { projects } from "@/content/projects";
import { navItems } from "@/content/navigation";
import { skillCategories } from "@/content/skills";
import { timeline } from "@/content/experience";

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
    const ids = navItems.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("design data", () => {
  it("gives every skill a category that has a particle cluster", () => {
    // The skills stage draws exactly five clusters, one per category, in order.
    expect(skillCategories).toHaveLength(5);
    const ids = skillCategories.map((c) => c.id);
    for (const skill of skills) expect(ids).toContain(skill.category);
  });

  it("places every located career stop on the map", () => {
    for (const entry of timeline) {
      if (!entry.location) continue;
      expect(entry.coordinates, entry.id).toBeDefined();
      expect(Math.abs(entry.coordinates!.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(entry.coordinates!.lon)).toBeLessThanOrEqual(180);
    }
  });
});
