"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AuthorSidebar } from "./author-sidebar";

function activeFromPathname(pathname: string): "blog" | "project" | "curated" {
  if (pathname.startsWith("/author/project")) return "project";
  if (pathname.startsWith("/author/curated")) return "curated";
  return "blog";
}

export function AuthorShell({ children }: { children: ReactNode }) {
  const active = activeFromPathname(usePathname());
  return (
    <div className="lg:flex">
      <div className="hidden lg:block">
        <AuthorSidebar active={active} />
      </div>
      <header className="border-line bg-surface flex min-h-14 items-center justify-between border-b px-4 lg:hidden">
        <Link className="font-extrabold" href={`/author/${active}`}>
          LAWSON / AUTHOR
        </Link>
        <nav aria-label="内容类别" className="flex gap-3 text-sm font-bold">
          <Link
            className={active === "blog" ? "text-ink" : "text-muted"}
            href="/author/blog"
          >
            博客
          </Link>
          <Link
            className={active === "project" ? "text-ink" : "text-muted"}
            href="/author/project"
          >
            项目
          </Link>
          <Link
            className={active === "curated" ? "text-ink" : "text-muted"}
            href="/author/curated"
          >
            精选
          </Link>
        </nav>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
