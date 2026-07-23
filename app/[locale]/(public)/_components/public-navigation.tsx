"use client";

import Link from "next/link";
import { useState } from "react";

const publicNavigation = [
  ["博客", "blog"],
  ["项目", "projects"],
  ["精选项目", "curated"],
  ["关于", "about"],
  ["搜索", "search"],
] as const;

export function PublicNavigation({ locale }: { locale: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        aria-controls="public-navigation"
        aria-expanded={isOpen}
        className="border-line text-ink focus-visible:ring-brand rounded-control min-h-11 border px-3 py-2 font-mono text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 min-[992px]:hidden"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        菜单
      </button>
      <nav
        aria-label="公开导航"
        className={`${
          isOpen ? "flex" : "hidden"
        } border-line bg-canvas absolute inset-x-0 top-full border-b px-4 py-3 min-[992px]:static min-[992px]:flex min-[992px]:border-0 min-[992px]:p-0`}
        id="public-navigation"
      >
        <div className="flex w-full flex-col gap-1 min-[992px]:w-auto min-[992px]:flex-row min-[992px]:items-center">
          {publicNavigation.map(([label, path]) => (
            <Link
              className="text-muted hover:text-ink focus-visible:ring-brand rounded-control min-h-11 px-3 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              href={`/${locale}/${path}`}
              key={path}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
