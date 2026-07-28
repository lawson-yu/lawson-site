import Link from "next/link";
import { Suspense } from "react";

import { PublicNavigation } from "@/app/[locale]/(public)/_components/public-navigation";
import { supportedLocale } from "@/lib/content/catalog";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-canvas text-ink min-h-screen overflow-x-clip">
      <header className="fixed inset-x-0 top-3 z-50 px-3 sm:px-6">
        <div className="bg-canvas/54 max-w-site shadow-floating-header ring-header-ring relative mx-auto flex min-h-16 items-center justify-between gap-x-4 rounded-[var(--radius-control)] px-4 font-mono ring-1 backdrop-blur-2xl sm:px-5 lg:px-6">
          <Link
            className="focus-visible:ring-brand tracking-eyebrow text-brand focus-visible:ring-offset-canvas relative z-10 min-h-11 py-3 text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
            href={`/${supportedLocale}`}
          >
            LAWSON
          </Link>
          <Suspense fallback={null}>
            <PublicNavigation locale={supportedLocale} />
          </Suspense>
        </div>
      </header>
      <div className="pt-20 sm:pt-24">{children}</div>
      <footer className="bg-inverse text-inverse-ink">
        <div className="max-w-site mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:px-8">
          <div>
            <p className="tracking-eyebrow font-extrabold">LAWSON</p>
            <p className="text-inverse-ink mt-3 max-w-md leading-7">
              记录 AI 工具、工程实践与值得长期维护的技术系统。
            </p>
          </div>
          <div>
            <p className="text-sm font-bold">保持联系</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
              <a
                className="focus-visible:ring-accent outline-none focus-visible:ring-2"
                href="https://github.com/lawson"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
              <a
                className="focus-visible:ring-accent outline-none focus-visible:ring-2"
                href="https://www.linkedin.com/in/lawson/"
                rel="noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
              <a
                className="focus-visible:ring-accent outline-none focus-visible:ring-2"
                href="mailto:lawson@example.com"
              >
                邮箱
              </a>
              <Link
                className="focus-visible:ring-accent outline-none focus-visible:ring-2"
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
