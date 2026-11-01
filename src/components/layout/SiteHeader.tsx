"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowDownToLine } from "lucide-react";
import { navItems } from "@/content/navigation";
import { profile } from "@/content/profile";
import { useActiveSection } from "@/lib/use-active-section";

const sectionIds = navItems.map((item) => item.id);

export function SiteHeader() {
  // Section links are in-page anchors on the home page and "/#id" everywhere else.
  const onHome = usePathname() === "/";
  const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const activeSection = useActiveSection(sectionIds);
  const active = onHome ? activeSection : null;

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: lock scroll, close on Escape, keep focus inside while open.
  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const menu = menuRef.current;
    document.documentElement.style.overflow = "hidden";
    menu?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !menu || !toggle) return;
      const focusable = [toggle, ...menu.querySelectorAll<HTMLElement>("a")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ${
        scrolled && !open ? "border-b border-line bg-paper/75 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
        <a
          href={sectionHref("home")}
          onClick={() => setOpen(false)}
          className={`relative z-10 font-display text-[1.75rem] leading-none tracking-tight transition-colors ${
            open ? "text-paper" : "text-ink"
          }`}
        >
          {profile.name}
          <span className="sr-only">, home</span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-paper-raised/70 p-1 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={sectionHref(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                      isActive ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative z-10 flex items-center gap-2">
          <a
            href={profile.cv.href}
            download={profile.cv.fileName}
            className="hidden min-h-11 items-center gap-2 rounded-full bg-cobalt px-5 text-sm font-semibold text-paper transition-colors hover:bg-cobalt-deep sm:inline-flex"
          >
            <ArrowDownToLine className="size-4" aria-hidden="true" />
            Download CV
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={`inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 text-sm font-semibold transition-colors lg:hidden ${
              open ? "border-paper/40 text-paper" : "border-line-strong bg-paper/60 text-ink backdrop-blur-md"
            }`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" className="relative block h-2.5 w-4">
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-all duration-500 ease-out-expo ${
                  open ? "top-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-all duration-500 ease-out-expo ${
                  open ? "top-1/2 -rotate-45" : "top-full"
                }`}
              />
            </span>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={menuRef} hidden={!open} className="fixed inset-0 overflow-y-auto bg-cobalt text-paper lg:hidden">
        <nav
          aria-label="Mobile"
          className="container-page flex min-h-full flex-col justify-between pb-10 pt-[calc(var(--header-h)+2rem)]"
        >
          <ol className="flex flex-col">
            {navItems.map((item, i) => (
              <li key={item.id} className="border-b border-paper/20">
                <a
                  href={sectionHref(item.id)}
                  onClick={() => setOpen(false)}
                  aria-current={active === item.id ? "true" : undefined}
                  className="flex items-baseline justify-between py-4"
                >
                  <span className="font-display text-[clamp(2.75rem,12vw,4.5rem)]">{item.label}</span>
                  <span className="eyebrow text-paper/75">{String(i).padStart(2, "0")}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col gap-4">
            <a
              href={profile.cv.href}
              download={profile.cv.fileName}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-paper text-sm font-semibold text-cobalt"
            >
              <ArrowDownToLine className="size-4" aria-hidden="true" />
              Download CV
            </a>
            <a href={`mailto:${profile.email}`} className="text-center text-sm text-paper/85 underline-offset-4 hover:underline">
              {profile.email}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
