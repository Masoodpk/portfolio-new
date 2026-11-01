"use client";

import { useMemo, useState } from "react";
import { skillCategories, skills, type SkillCategory } from "@/content/skills";
import {
  CENTER,
  GRAPH,
  hubLabelPosition,
  hubPosition,
  layoutSkills,
  relatedEdges,
  toPercent,
} from "@/lib/skills-layout";

type Filter = SkillCategory | "all";

const usageLabel = {
  professional: "Used professionally",
  learning: "Studied & personal projects",
} as const;

/**
 * Interactive technology map. Lines are SVG; nodes are real buttons layered
 * on top so they are focusable, labelled and keyboard operable.
 */
export function SkillsGraph() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState("vue");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const positions = useMemo(() => layoutSkills(skills), []);
  const edges = useMemo(() => relatedEdges(skills), []);
  const selected = skills.find((s) => s.id === selectedId) ?? skills[0];
  const focusId = hoverId ?? selectedId;
  const focus = skills.find((s) => s.id === focusId);
  const connected = new Set([focusId, ...(focus?.related ?? []), ...skills.filter((s) => s.related.includes(focusId)).map((s) => s.id)]);

  const inFilter = (category: SkillCategory) => filter === "all" || filter === category;
  const categoryLabel = (id: SkillCategory) => skillCategories.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-8">
        <div role="group" aria-label="Filter skills by category" className="flex flex-wrap gap-2">
          {(["all", ...skillCategories.map((c) => c.id)] as Filter[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={`label-mono min-h-9 border px-3 transition-colors ${
                filter === id
                  ? "border-accent bg-accent text-ink"
                  : "border-line-strong text-muted hover:border-fg hover:text-fg"
              }`}
            >
              {id === "all" ? "All" : categoryLabel(id)}
            </button>
          ))}
        </div>

        <div className="relative mt-8 aspect-[1000/600] w-full select-none">
          <svg
            viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`}
            className="absolute inset-0 size-full"
            fill="none"
            aria-hidden="true"
          >
            {/* Spokes: centre → category hubs → skills */}
            {skillCategories.map((category) => {
              const hub = hubPosition(category.id);
              const active = inFilter(category.id);
              return (
                <g key={category.id} className="transition-opacity duration-500" opacity={active ? 1 : 0.2}>
                  <line x1={CENTER.x} y1={CENTER.y} x2={hub.x} y2={hub.y} stroke="#26262a" />
                  {skills
                    .filter((s) => s.category === category.id)
                    .map((s) => {
                      const p = positions.get(s.id)!;
                      return <line key={s.id} x1={hub.x} y1={hub.y} x2={p.x} y2={p.y} stroke="#26262a" />;
                    })}
                  <circle cx={hub.x} cy={hub.y} r="4" fill="#3a3a40" />
                </g>
              );
            })}

            {/* Relationships between technologies, lit up for the focused skill */}
            {edges.map(([a, b]) => {
              const pa = positions.get(a)!;
              const pb = positions.get(b)!;
              const lit = a === focusId || b === focusId;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke={lit ? "#ff5f1f" : "#3a3a40"}
                  strokeWidth={lit ? 1.5 : 1}
                  strokeDasharray={lit ? "6 6" : "2 6"}
                  className={lit ? "skill-edge-lit" : ""}
                  opacity={lit ? 1 : 0.35}
                />
              );
            })}

            <circle cx={CENTER.x} cy={CENTER.y} r="38" stroke="#3a3a40" />
            <circle cx={CENTER.x} cy={CENTER.y} r="3" fill="#ff5f1f" />
          </svg>

          {/* Labels for the centre and hubs */}
          <span
            className="label-mono pointer-events-none absolute -translate-x-1/2 translate-y-8 text-subtle"
            style={toPercent(CENTER)}
            aria-hidden="true"
          >
            Web apps
          </span>
          {skillCategories.map((category) => {
            const hub = hubLabelPosition(category.id);
            return (
              <span
                key={category.id}
                aria-hidden="true"
                className={`label-mono pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-ink px-1.5 transition-opacity duration-500 ${
                  inFilter(category.id) ? "text-subtle" : "text-subtle opacity-20"
                }`}
                style={toPercent(hub)}
              >
                {category.label}
              </span>
            );
          })}

          {/* Skill nodes */}
          {skills.map((skill) => {
            const p = positions.get(skill.id)!;
            const isSelected = skill.id === selectedId;
            const dimmed = !inFilter(skill.category) || (focusId && !connected.has(skill.id) && hoverId !== null);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => setSelectedId(skill.id)}
                onMouseEnter={() => setHoverId(skill.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(skill.id)}
                onBlur={() => setHoverId(null)}
                aria-pressed={isSelected}
                aria-label={`${skill.name}, ${usageLabel[skill.usage]}`}
                className={`group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 px-2 py-1 transition-opacity duration-300 ${
                  dimmed ? "opacity-25" : "opacity-100"
                }`}
                style={toPercent(p)}
              >
                <span
                  aria-hidden="true"
                  className={`block size-3 rounded-full transition-transform duration-300 group-hover:scale-125 ${
                    skill.usage === "professional" ? "bg-accent" : "border border-muted bg-ink"
                  } ${isSelected ? "scale-150 shadow-[0_0_0_6px_rgb(255_95_31/0.18)]" : ""}`}
                />
                <span
                  className={`whitespace-nowrap text-xs transition-colors lg:text-sm ${
                    isSelected ? "text-fg" : "text-muted group-hover:text-fg"
                  }`}
                >
                  {skill.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <aside
        aria-live="polite"
        className="flex flex-col border-t border-line pt-8 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
      >
        <p className="label-mono text-subtle">{categoryLabel(selected.category)}</p>
        <h3 className="font-display-regular mt-4 text-4xl text-fg">{selected.name}</h3>
        <p
          className={`label-mono mt-5 inline-flex items-center gap-2 ${
            selected.usage === "professional" ? "text-accent" : "text-muted"
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${
              selected.usage === "professional" ? "bg-accent" : "border border-muted"
            }`}
          />
          {usageLabel[selected.usage]}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-muted">{selected.note}</p>
        {selected.related.length > 0 ? (
          <>
            <p className="label-mono mt-10 text-subtle">Works alongside</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {selected.related.map((id) => {
                const other = skills.find((s) => s.id === id);
                if (!other) return null;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(id)}
                      className="border border-line-strong px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-fg"
                    >
                      {other.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
        <p className="mt-auto hidden pt-10 text-sm text-subtle lg:block">
          Select any technology to see how I use it.
        </p>
      </aside>
    </div>
  );
}
