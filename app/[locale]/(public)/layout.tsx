import Link from "next/link";

import { supportedLocale } from "@/lib/content/catalog";

const publicNavigation = [
  ["博客", "blog"],
  ["项目", "projects"],
  ["精选项目", "curated"],
  ["关于", "about"],
  ["搜索", "search"],
] as const;

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-canvas text-ink min-h-screen overflow-x-hidden">
      <header className="border-line bg-canvas border-b">
        <div className="max-w-site mx-auto flex min-h-16 flex-wrap items-center justify-between gap-x-4 px-4 sm:px-6 lg:px-8">
          <Link
            className="focus-visible:ring-brand tracking-eyebrow text-brand focus-visible:ring-offset-canvas min-h-11 py-3 text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
            href={`/${supportedLocale}`}
          >
            LAWSON
          </Link>
          <nav
            aria-label="公开导航"
            className="flex flex-wrap items-center gap-x-1"
          >
            {publicNavigation.map(([label, path]) => (
              <Link
                className="focus-visible:ring-brand text-muted hover:text-ink focus-visible:ring-offset-canvas min-h-11 px-3 py-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                href={`/${supportedLocale}/${path}`}
                key={path}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-line bg-surface border-t">
        <div className="max-w-site mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:px-8">
          <div>
            <p className="tracking-eyebrow text-brand font-extrabold">LAWSON</p>
            <p className="text-muted mt-3 max-w-md leading-7">
              记录 AI 工具、工程实践与值得长期维护的技术系统。
            </p>
          </div>
          <div>
            <p className="text-sm font-bold">保持联系</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
              <a
                className="focus-visible:ring-brand outline-none focus-visible:ring-2"
                href="https://github.com/lawson"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
              <a
                className="focus-visible:ring-brand outline-none focus-visible:ring-2"
                href="https://www.linkedin.com/in/lawson/"
                rel="noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
              <a
                className="focus-visible:ring-brand outline-none focus-visible:ring-2"
                href="mailto:lawson@example.com"
              >
                邮箱
              </a>
              <Link
                className="focus-visible:ring-brand outline-none focus-visible:ring-2"
                href="/rss.xml"
              >
                RSS
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
