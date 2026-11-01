import { about, profile } from "@/content/profile";
import { timeline } from "@/content/experience";
import { skillCategories, skills } from "@/content/skills";
import { projects } from "@/content/projects";

/**
 * A tiny, closed command interpreter for the portfolio terminal.
 * It never evaluates input — commands are looked up in a fixed table and
 * every result is plain data rendered as text by React.
 */
export type TerminalLine =
  | { kind: "text"; text: string }
  | { kind: "muted"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "item"; label: string; text: string }
  | { kind: "link"; label: string; href: string; external?: boolean; download?: string }
  | { kind: "error"; text: string };

export type CommandResult = { lines: TerminalLine[]; clear?: boolean };

type Command = {
  description: string;
  run: () => CommandResult;
};

const commands: Record<string, Command> = {
  help: {
    description: "List available commands",
    run: () => ({
      lines: [
        { kind: "heading", text: "Available commands" },
        ...Object.entries(commands).map(
          ([name, command]): TerminalLine => ({ kind: "item", label: name, text: command.description }),
        ),
      ],
    }),
  },
  about: {
    description: "Who I am",
    run: () => ({
      lines: [
        { kind: "heading", text: `${profile.name} — ${profile.title}` },
        { kind: "text", text: about.lead },
        { kind: "muted", text: `Based in ${profile.location}. ${profile.availability}.` },
      ],
    }),
  },
  experience: {
    description: "Career timeline",
    run: () => ({
      lines: [
        { kind: "heading", text: "Experience & education" },
        ...timeline.map(
          (entry): TerminalLine => ({
            kind: "item",
            label: entry.period,
            text: `${entry.role} · ${entry.organization}`,
          }),
        ),
      ],
    }),
  },
  skills: {
    description: "Technologies, grouped",
    run: () => ({
      lines: [
        { kind: "heading", text: "Skills  (* = used professionally)" },
        ...skillCategories.map(
          (category): TerminalLine => ({
            kind: "item",
            label: category.label,
            text: skills
              .filter((s) => s.category === category.id)
              .map((s) => (s.usage === "professional" ? `${s.name}*` : s.name))
              .join(", "),
          }),
        ),
      ],
    }),
  },
  projects: {
    description: "Selected work",
    run: () => ({
      lines: [
        { kind: "heading", text: "Projects" },
        ...projects.flatMap((project): TerminalLine[] => [
          { kind: "item", label: project.index, text: `${project.name} — ${project.tagline} (${project.stack.join(", ")})` },
          { kind: "link", label: `Read the ${project.name} case study`, href: `/projects/${project.slug}` },
        ]),
      ],
    }),
  },
  contact: {
    description: "How to reach me",
    run: () => ({
      lines: [
        { kind: "heading", text: "Let's talk" },
        { kind: "link", label: profile.email, href: `mailto:${profile.email}` },
        ...profile.socials.map(
          (social): TerminalLine => ({ kind: "link", label: `${social.label} — ${social.handle}`, href: social.href, external: true }),
        ),
      ],
    }),
  },
  cv: {
    description: "Download my CV (PDF)",
    run: () => ({
      lines: [
        { kind: "link", label: `Download ${profile.cv.fileName}`, href: profile.cv.href, download: profile.cv.fileName },
      ],
    }),
  },
  clear: {
    description: "Clear the screen",
    run: () => ({ lines: [], clear: true }),
  },
};

const aliases: Record<string, string> = {
  whoami: "about",
  ls: "help",
  "?": "help",
  work: "projects",
  resume: "cv",
  hire: "contact",
};

export const commandNames = Object.keys(commands);

export function runCommand(input: string): CommandResult {
  const raw = input.trim().toLowerCase();
  if (!raw) return { lines: [] };
  // Only the first word matters; arguments are ignored on purpose.
  const name = raw.split(/\s+/)[0].slice(0, 32);
  const command = commands[aliases[name] ?? name];
  if (!command) {
    return {
      lines: [{ kind: "error", text: `command not found: ${name}. Type "help" to see what's available.` }],
    };
  }
  return command.run();
}

/** Completes a partial command when exactly one command matches. */
export function completeCommand(partial: string): string | null {
  const value = partial.trim().toLowerCase();
  if (!value) return null;
  const matches = commandNames.filter((name) => name.startsWith(value));
  return matches.length === 1 ? matches[0] : null;
}
