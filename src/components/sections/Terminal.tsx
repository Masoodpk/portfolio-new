"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { completeCommand, runCommand, type TerminalLine } from "@/lib/terminal";

type Entry = { id: number; command: string; lines: TerminalLine[] };

const QUICK_COMMANDS = ["help", "about", "experience", "skills", "projects", "contact"];
const PROMPT = "masood@portfolio:~$";

export function Terminal() {
  const inputId = useId();
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: 0, command: "", lines: [{ kind: "muted", text: 'Type "help" and press Enter — or tap a command below.' }] },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const nextId = useRef(1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [entries]);

  const execute = (command: string) => {
    const result = runCommand(command);
    const entry: Entry = { id: nextId.current++, command, lines: result.lines };
    setEntries((previous) => (result.clear ? [] : [...previous, entry]));
    if (command.trim()) setHistory((previous) => [...previous, command.trim()]);
    setHistoryIndex(null);
    setValue("");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    execute(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      const completed = completeCommand(value);
      if (completed) {
        event.preventDefault();
        setValue(completed);
      }
    } else if (event.key === "ArrowUp" && history.length > 0) {
      event.preventDefault();
      const index = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setValue(history[index]);
    } else if (event.key === "ArrowDown" && historyIndex !== null) {
      event.preventDefault();
      const index = historyIndex + 1;
      if (index >= history.length) {
        setHistoryIndex(null);
        setValue("");
      } else {
        setHistoryIndex(index);
        setValue(history[index]);
      }
    }
  };

  return (
    <div className="overflow-hidden border border-line bg-[#0d0d0f] font-mono text-[0.8125rem] leading-relaxed shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]">
      <div className="flex items-center gap-4 border-b border-line px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-accent" />
        </div>
        <p className="flex-1 truncate text-center text-xs text-subtle">masood@portfolio — zsh</p>
        <span className="w-[2.625rem]" aria-hidden="true" />
      </div>

      {/* The whole body focuses the input on click, like a real terminal. */}
      <div className="p-4 md:p-6" onClick={() => inputRef.current?.focus()}>
        <div
          ref={outputRef}
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
          className="h-[18rem] overflow-y-auto pr-2 [scrollbar-width:thin] md:h-[20rem]"
        >
          {entries.map((entry) => (
            <div key={entry.id} className="mb-4">
              {entry.command !== "" || entry.id > 0 ? (
                <p className="text-fg">
                  <span className="text-accent">{PROMPT}</span> {entry.command}
                </p>
              ) : null}
              {entry.lines.map((line, i) => (
                <Line key={i} line={line} />
              ))}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-2 flex items-center gap-2 border-t border-line pt-4">
          <label htmlFor={inputId} className="shrink-0 text-accent">
            {PROMPT}
            <span className="sr-only"> Type a command, for example help</span>
          </label>
          <input
            ref={inputRef}
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={64}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-fg caret-accent outline-none placeholder:text-subtle"
            placeholder="help"
          />
        </form>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3 md:px-6">
        {QUICK_COMMANDS.map((command) => (
          <button
            key={command}
            type="button"
            onClick={() => execute(command)}
            className="min-h-9 border border-line-strong px-3 text-xs text-muted transition-colors hover:border-accent hover:text-fg"
          >
            {command}
          </button>
        ))}
      </div>
    </div>
  );
}

function Line({ line }: { line: TerminalLine }) {
  switch (line.kind) {
    case "heading":
      return <p className="mt-1 text-fg">{line.text}</p>;
    case "muted":
      return <p className="text-subtle">{line.text}</p>;
    case "error":
      return <p className="text-accent-soft">{line.text}</p>;
    case "item":
      return (
        <p className="grid grid-cols-[minmax(0,9rem)_1fr] gap-x-4 text-muted">
          <span className="truncate text-subtle">{line.label}</span>
          <span>{line.text}</span>
        </p>
      );
    case "link":
      return (
        <p>
          <a
            href={line.href}
            download={line.download}
            target={line.external ? "_blank" : undefined}
            rel={line.external ? "noopener noreferrer" : undefined}
            className="text-fg underline decoration-line-strong underline-offset-4 hover:text-accent hover:decoration-accent"
          >
            → {line.label}
          </a>
        </p>
      );
    default:
      return <p className="text-muted">{line.text}</p>;
  }
}
