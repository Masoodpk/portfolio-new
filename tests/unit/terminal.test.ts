import { describe, expect, it } from "vitest";
import { commandNames, completeCommand, runCommand } from "@/lib/terminal";
import { projects } from "@/content/projects";

describe("runCommand", () => {
  it("lists every command in help", () => {
    const { lines } = runCommand("help");
    const listed = lines.filter((l) => l.kind === "item").map((l) => (l.kind === "item" ? l.label : ""));
    expect(listed).toEqual(commandNames);
  });

  it("is case and whitespace insensitive and ignores arguments", () => {
    expect(runCommand("  ABOUT  --verbose ").lines[0]).toMatchObject({ kind: "heading" });
  });

  it("resolves aliases", () => {
    expect(runCommand("whoami")).toEqual(runCommand("about"));
    expect(runCommand("resume")).toEqual(runCommand("cv"));
  });

  it("links every project case study", () => {
    const links = runCommand("projects").lines.filter((l) => l.kind === "link");
    expect(links.map((l) => (l.kind === "link" ? l.href : ""))).toEqual(
      projects.map((p) => `/projects/${p.slug}`),
    );
  });

  it("offers the CV as a download", () => {
    const [line] = runCommand("cv").lines;
    expect(line).toMatchObject({ kind: "link", href: expect.stringMatching(/\.pdf$/) });
  });

  it("returns an error for unknown commands without executing anything", () => {
    const { lines } = runCommand("rm -rf /");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ kind: "error" });
  });

  it("clears the screen", () => {
    expect(runCommand("clear")).toEqual({ lines: [], clear: true });
  });

  it("does nothing for empty input", () => {
    expect(runCommand("   ")).toEqual({ lines: [] });
  });
});

describe("completeCommand", () => {
  it("completes a unique prefix", () => {
    expect(completeCommand("proj")).toBe("projects");
    expect(completeCommand("ex")).toBe("experience");
  });

  it("returns null for ambiguous or unknown prefixes", () => {
    expect(completeCommand("c")).toBeNull(); // contact, cv, clear
    expect(completeCommand("zzz")).toBeNull();
    expect(completeCommand("")).toBeNull();
  });
});
