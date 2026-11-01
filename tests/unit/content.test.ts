import { describe, expect, it } from "vitest";
import { skills } from "@/content/skills";
import { projects } from "@/content/projects";
import { navItems } from "@/content/navigation";
import { GRAPH, layoutSkills, relatedEdges } from "@/lib/skills-layout";

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

describe("skills layout", () => {
  it("places every skill inside the graph", () => {
    const positions = layoutSkills(skills);
    expect(positions.size).toBe(skills.length);
    for (const { x, y } of positions.values()) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(GRAPH.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(GRAPH.height);
    }
  });

  it("does not stack two skills on the same spot", () => {
    const points = [...layoutSkills(skills).values()];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
        expect(distance).toBeGreaterThan(40);
      }
    }
  });

  it("deduplicates undirected relationships", () => {
    const edges = relatedEdges(skills);
    const keys = edges.map(([a, b]) => [a, b].sort().join("|"));
    expect(new Set(keys).size).toBe(keys.length);
  });
});
