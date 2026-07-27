import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { PublicPageHeader } from "@/app/[locale]/(public)/_components/public-page-header";
import { supportedLocale } from "@/lib/content/catalog";

type AboutPageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  alternates: { canonical: "/zh-CN/about" },
  description: "了解 LAWSON 的 AI 与工程实践写作方向和工作方式。",
  title: "关于 | LAWSON",
};

function AboutFallback() {
  return <main className="min-h-screen" />;
}

async function AboutContent({ params }: AboutPageProps) {
  await connection();
  const { locale } = await params;
  if (locale !== supportedLocale) notFound();
  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-12 min-[992px]:py-18 sm:px-6 lg:px-8">
        <PublicPageHeader
          description="写 AI 与工程系统，也把自己的项目公开给真实使用场景检验。"
          eyebrow="ABOUT LAWSON"
          title="把工程判断放在页面上"
        >
          <p className="text-muted font-mono text-xs leading-6">
            作品集 · 技术笔记 · 精选索引
          </p>
        </PublicPageHeader>

        <div className="border-line bg-line mt-12 grid gap-px overflow-hidden border min-[992px]:grid-cols-[minmax(0,0.62fr)_minmax(18rem,0.38fr)]">
          <div className="bg-surface-raised p-6 sm:p-8">
            <div className="grid max-w-3xl gap-8 text-lg leading-8 text-balance min-[768px]:grid-cols-2">
              <p>
                LAWSON
                记录真实项目中的问题、选择、结果和仍待改进的部分。重点不是追逐概念，而是将工具、系统与工作流放回具体约束中讨论。
              </p>
              <p>
                这里会持续发布工程实践、教程、AI
                工具观察，以及值得深入研究的开源项目。每一篇内容都力求提供清晰的上下文和可追溯的结论。
              </p>
            </div>
          </div>
          <aside className="bg-surface p-6 sm:p-8" aria-label="公开页面结构">
            <p className="text-muted font-mono text-xs font-bold tracking-[0.12em]">
              PUBLIC SURFACES
            </p>
            <dl className="mt-8 grid gap-6">
              <div>
                <dt className="font-semibold">博客</dt>
                <dd className="text-muted mt-2 leading-7">
                  记录工程实践、AI 系统和维护判断。
                </dd>
              </div>
              <div>
                <dt className="font-semibold">个人项目</dt>
                <dd className="text-muted mt-2 leading-7">
                  展示真实项目的问题、技术栈和成果。
                </dd>
              </div>
              <div>
                <dt className="font-semibold">精选项目</dt>
                <dd className="text-muted mt-2 leading-7">
                  按周和标签整理外部 GitHub 项目。
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function AboutPage(props: AboutPageProps) {
  return (
    <Suspense fallback={<AboutFallback />}>
      <AboutContent {...props} />
    </Suspense>
  );
}
