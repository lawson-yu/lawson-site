import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

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
    <main
      className="max-w-site mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      lang={locale}
    >
      <p className="tracking-eyebrow text-accent text-sm font-bold">
        ABOUT LAWSON
      </p>
      <h1 className="mt-4 max-w-4xl text-5xl leading-none font-extrabold tracking-tight sm:text-7xl">
        把 AI 与工程实践写成可验证的真实经验。
      </h1>
      <div className="text-muted mt-10 grid max-w-4xl gap-8 text-lg leading-8 lg:grid-cols-2">
        <p>
          LAWSON
          记录真实项目中的问题、选择、结果和仍待改进的部分。重点不是追逐概念，而是将工具、系统与工作流放回具体约束中讨论。
        </p>
        <p>
          这里会持续发布工程实践、教程、AI
          工具观察，以及值得深入研究的开源项目。每一篇内容都力求提供清晰的上下文和可追溯的结论。
        </p>
      </div>
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
