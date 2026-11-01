"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Menu, X } from "lucide-react";
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
    document.body.style.overflow = "hidden";
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
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ${
        scrolled || open
          ? "border-b border-line bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
        <a
          href={sectionHref("home")}
          className="group flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="font-display-wide text-lg leading-none">{profile.initials}</span>
          {/* Visible text stays in the accessible name (WCAG 2.5.3 label-in-name). */}
          <span className="sr-only">, {profile.name}, home</span>
          <span className="hidden h-4 w-px bg-line-strong sm:block" aria-hidden="true" />
          <span className="label-mono hidden text-subtle transition-colors group-hover:text-fg sm:block">
            {profile.title}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={sectionHref(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative block px-3 py-2 text-sm transition-colors ${
                      isActive ? "text-fg" : "text-subtle hover:text-fg"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 -bottom-px h-px origin-left bg-accent transition-transform duration-500 ease-out-expo ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={profile.cv.href}
            download={profile.cv.fileName}
            className="hidden min-h-10 items-center gap-2 border border-line-strong px-4 text-sm transition-colors hover:border-accent hover:text-accent sm:inline-flex"
          >
            <Download className="size-4" aria-hidden="true" />
            Download CV
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center border border-line-strong lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-line bg-ink lg:hidden"
      >
        <nav aria-label="Mobile" className="container-page flex min-h-full flex-col justify-between py-8">
          <ol className="flex flex-col">
            {navItems.map((item, i) => (
              <li key={item.id} className="border-b border-line">
                <a
                  href={sectionHref(item.id)}
                  onClick={() => setOpen(false)}
                  aria-current={active === item.id ? "true" : undefined}
                  className="flex items-baseline gap-4 py-4"
                >
                  <span className="label-mono text-accent">{String(i).padStart(2, "0")}</span>
                  <span className="font-display-regular text-4xl">{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col gap-4">
            <a
              href={profile.cv.href}
              download={profile.cv.fileName}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-accent text-sm font-medium text-ink"
            >
              <Download className="size-4" aria-hidden="true" />
              Download CV
            </a>
            <a href={`mailto:${profile.email}`} className="label-mono text-center text-subtle">
              {profile.email}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
