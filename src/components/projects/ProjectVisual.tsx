import Image from "next/image";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { Schematic } from "@/components/projects/Schematic";
import type { Project, ProjectVisual as Visual } from "@/data/content";

type Props = {
  project: Project;
  visual: Visual;
  sizes: string;
  preload?: boolean;
};

/** Renders one project visual in the right device frame. */
export function ProjectVisual({ project, visual, sizes, preload = false }: Props) {
  const url = project.links[0]?.label ?? `${project.slug}`;

  if (visual.kind === "schematic") {
    return (
      <BrowserFrame url={`${url} — schematic`}>
        <Schematic kind={visual.schematic} />
      </BrowserFrame>
    );
  }

  if (visual.device === "mobile") {
    return (
      <div className="mx-auto w-full max-w-[18rem] rounded-[2rem] bg-paper-raised p-2.5 shadow-[0_24px_50px_-28px_rgb(47_74_58/0.5)] ring-1 ring-line">
        <div className="overflow-hidden rounded-[1.5rem] bg-paper-raised">
          <Image
            src={visual.src}
            width={visual.width}
            height={visual.height}
            alt={visual.alt}
            sizes="18rem"
            preload={preload}
            className="h-auto w-full"
          />
        </div>
      </div>
    );
  }

  if (visual.device === "long") {
    return (
      <BrowserFrame url={url}>
        {/* Scrollable on its own so keyboard and touch users can explore the full page. */}
        <div
          tabIndex={0}
          role="region"
          aria-label={`Scrollable preview: ${visual.alt}`}
          className="aspect-[16/10] overflow-y-auto overscroll-contain [scrollbar-width:thin]"
        >
          <Image
            src={visual.src}
            width={visual.width}
            height={visual.height}
            alt={visual.alt}
            sizes={sizes}
            className="h-auto w-full"
          />
        </div>
      </BrowserFrame>
    );
  }

  return (
    <BrowserFrame url={url}>
      <Image
        src={visual.src}
        width={visual.width}
        height={visual.height}
        alt={visual.alt}
        sizes={sizes}
        preload={preload}
        className="aspect-[16/10] h-auto w-full object-cover object-top"
      />
    </BrowserFrame>
  );
}
