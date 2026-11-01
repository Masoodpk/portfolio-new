import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "group/button relative inline-flex min-h-12 items-center justify-center gap-3 whitespace-nowrap px-6 text-sm font-medium tracking-tight transition-[background-color,color,border-color] duration-300 ease-out-expo";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-ink hover:bg-fg",
  secondary: "border border-line-strong text-fg hover:border-fg hover:bg-fg hover:text-ink",
  ghost: "px-0 text-fg underline-offset-8 hover:text-accent",
};

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: Variant;
  icon?: ReactNode;
};

/**
 * Anchor styled as a button. Plain <a> keeps in-page hash links,
 * downloads and external links working without client JS.
 */
export function ButtonLink({
  variant = "primary",
  icon,
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      <span>{children}</span>
      {icon ? (
        <span
          aria-hidden="true"
          className="transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5"
        >
          {icon}
        </span>
      ) : null}
    </a>
  );
}
