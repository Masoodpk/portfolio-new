import type { Skill, SkillCategory } from "@/content/skills";

/** Graph coordinates live in a 1000 × 600 space and are rendered as percentages. */
export const GRAPH = { width: 1000, height: 600 } as const;

export type Point = { x: number; y: number };

export const CENTER: Point = { x: 500, y: 290 };

const HUBS: Record<SkillCategory, Point> = {
  frontend: { x: 230, y: 165 },
  languages: { x: 770, y: 165 },
  apis: { x: 190, y: 455 },
  tools: { x: 500, y: 455 },
  styling: { x: 810, y: 455 },
};

const RADIUS = 120;

export function hubPosition(category: SkillCategory): Point {
  return HUBS[category];
}

/** Category label sits on the centre-facing side of its hub, clear of the skills. */
export function hubLabelPosition(category: SkillCategory): Point {
  const hub = HUBS[category];
  const angle = Math.atan2(CENTER.y - hub.y, CENTER.x - hub.x);
  return { x: hub.x + Math.cos(angle) * 34, y: hub.y + Math.sin(angle) * 34 };
}

/**
 * Places each category's skills on an arc around its hub, opening away from
 * the centre so labels don't collide with the hub-to-centre spokes.
 */
export function layoutSkills(skills: readonly Skill[]): Map<string, Point> {
  const positions = new Map<string, Point>();
  const byCategory = new Map<SkillCategory, Skill[]>();
  for (const skill of skills) {
    const list = byCategory.get(skill.category) ?? [];
    list.push(skill);
    byCategory.set(skill.category, list);
  }

  for (const [category, list] of byCategory) {
    const hub = HUBS[category];
    const away = Math.atan2(hub.y - CENTER.y, hub.x - CENTER.x);
    const spread = Math.min(Math.PI * 1.1, (list.length - 1) * 0.95);
    list.forEach((skill, i) => {
      const t = list.length === 1 ? 0 : i / (list.length - 1) - 0.5;
      const angle = away + t * spread;
      positions.set(skill.id, {
        x: Math.round(hub.x + Math.cos(angle) * RADIUS),
        y: Math.round(hub.y + Math.sin(angle) * RADIUS * 0.8),
      });
    });
  }
  return positions;
}

/** Unique undirected edges from each skill's `related` list. */
export function relatedEdges(skills: readonly Skill[]): [string, string][] {
  const ids = new Set(skills.map((s) => s.id));
  const seen = new Set<string>();
  const edges: [string, string][] = [];
  for (const skill of skills) {
    for (const other of skill.related) {
      if (!ids.has(other)) continue;
      const key = [skill.id, other].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([skill.id, other]);
    }
  }
  return edges;
}

export const toPercent = (p: Point) => ({
  left: `${(p.x / GRAPH.width) * 100}%`,
  top: `${(p.y / GRAPH.height) * 100}%`,
});
