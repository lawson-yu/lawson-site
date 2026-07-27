import Link from "next/link";

import { cn } from "@/lib/utils";

export type ContentFilterOption = {
  count?: number;
  href: string;
  label: string;
  slug: string;
};

export function ContentFilterBar({
  activeSlug,
  allHref,
  allLabel = "全部",
  ariaLabel,
  emptyLabel = "暂无标签",
  options,
}: {
  activeSlug?: string;
  allHref: string;
  allLabel?: string;
  ariaLabel: string;
  emptyLabel?: string;
  options: ContentFilterOption[];
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="border-line bg-surface-raised grid gap-4 border-y py-5 min-[768px]:grid-cols-[8rem_1fr] min-[768px]:items-start min-[992px]:py-6"
    >
      <p className="text-muted font-mono text-xs font-bold tracking-[0.12em]">
        TAGS
      </p>
      <div className="flex min-w-0 flex-wrap gap-2">
        <Link
          aria-current={!activeSlug ? "page" : undefined}
          className={filterClass(!activeSlug)}
          href={allHref}
        >
          {allLabel}
        </Link>
        {options.map((option) => (
          <Link
            aria-current={activeSlug === option.slug ? "page" : undefined}
            className={filterClass(activeSlug === option.slug)}
            href={option.href}
            key={option.slug}
          >
            <span>{option.label}</span>
            {typeof option.count === "number" ? (
              <span className="text-current/60">{option.count}</span>
            ) : null}
          </Link>
        ))}
        {!options.length ? (
          <span className="text-muted min-h-11 py-3 text-sm">{emptyLabel}</span>
        ) : null}
      </div>
    </nav>
  );
}

function filterClass(active: boolean) {
  return cn(
    "rounded-control border px-4 py-2 font-mono text-xs font-bold tracking-[0.08em] outline-none transition-colors duration-150",
    "inline-flex min-h-11 max-w-full items-center gap-2 [overflow-wrap:anywhere]",
    active
      ? "border-brand bg-brand text-canvas"
      : "border-line bg-surface text-muted hover:border-brand/50 hover:text-brand focus-visible:ring-brand focus-visible:ring-2",
  );
}
