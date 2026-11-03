import { NextResponse, type NextRequest } from "next/server";
import { projects } from "@/data/content";

const slugs = new Set(projects.map((project) => project.slug));

/**
 * Unknown case-study URLs get a real 404 status. Without this, the
 * partially prerendered route would stream the not-found UI with a 200.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !slugs.has(decodeURIComponent(slug))) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/projects/:slug",
};
