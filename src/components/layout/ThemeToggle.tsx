"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.dataset.theme === "dark";

/** Light/dark switch. The new theme spreads in a circle from the button where supported. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Follow the system setting until the visitor picks a theme themselves.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {}
      if (!stored) document.documentElement.dataset.theme = media.matches ? "dark" : "light";
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = dark ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
    };
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      root.style.setProperty("--theme-x", `${rect.left + rect.width / 2}px`);
      root.style.setProperty("--theme-y", `${rect.top + rect.height / 2}px`);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) apply();
    else document.startViewTransition(apply);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors ${className}`}
    >
      {dark ? <Sun className="size-[1.1rem]" aria-hidden="true" /> : <Moon className="size-[1.1rem]" aria-hidden="true" />}
    </button>
  );
}
