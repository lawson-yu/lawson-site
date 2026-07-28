import Link from "next/link";

import { BookOpenText, FolderKanban, Gem, Tags } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/author/blog", label: "博客", icon: BookOpenText },
  { href: "/author/project", label: "个人项目", icon: FolderKanban },
  { href: "/author/curated", label: "精选项目", icon: Gem },
];

export function AuthorSidebar({
  active,
}: {
  active: "blog" | "project" | "curated" | "tags";
}) {
  return (
    <aside className="border-line bg-surface flex h-dvh w-56 shrink-0 flex-col border-r px-4 py-6">
      <Link
        className="px-3 text-lg font-extrabold tracking-tight"
        href="/author/blog"
      >
        LAWSON / AUTHOR
      </Link>
      <nav aria-label="内容类别" className="mt-10 grid gap-1">
        {items.map((item) => {
          const selected =
            active === (item.href.split("/").at(-1) as typeof active);
          const Icon = item.icon;
          return (
            <Link
              aria-current={selected ? "page" : undefined}
              className={cn(
                "text-muted hover:text-ink flex min-h-11 items-center gap-3 border-l-2 border-transparent px-3 text-sm font-bold",
                selected && "border-action bg-canvas text-ink",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-line mt-auto grid gap-3 border-t pt-5">
        <Link
          aria-current={active === "tags" ? "page" : undefined}
          className={cn(
            "text-muted hover:text-ink flex min-h-11 items-center gap-3 border-l-2 border-transparent px-3 text-sm font-bold",
            active === "tags" && "border-action bg-canvas text-ink",
          )}
          href="/author/tags"
        >
          <Tags aria-hidden="true" size={17} />
          待确认标签
        </Link>
        <form action="/auth/logout" method="post">
          <button
            className="text-muted hover:text-ink min-h-11 px-3 text-sm font-bold"
            type="submit"
          >
            退出登录
          </button>
        </form>
      </div>
    </aside>
  );
}
