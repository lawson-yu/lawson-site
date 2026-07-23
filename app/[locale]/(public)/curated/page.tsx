import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { supportedLocale } from "@/lib/content/catalog";
import { listPublishedCuratedProjects } from "@/lib/content/curated";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ topic?: string; week?: string }>;
};

export const metadata: Metadata = {
  alternates: { canonical: "/zh-CN/curated" },
  description: "LAWSON 按主题与收录周整理的 GitHub 精选项目。",
  title: "精选项目 | LAWSON",
};

function CuratedFallback() {
  return <main className="bg-canvas min-h-screen" />;
}

async function CuratedContent({ params, searchParams }: Props) {
  await connection();
  const { locale } = await params;
  const { topic, week } = await searchParams;
  if (locale !== supportedLocale) notFound();
  const projects = await listPublishedCuratedProjects(locale);
  const weeks = [...new Set(projects.map((project) => project.metadata.week))];
  const topics = [
    ...new Map(
      projects.flatMap((project) =>
        project.tags.map((tag) => [tag.slug, tag.label]),
      ),
    ).entries(),
  ];
  const filteredProjects = projects.filter(
    (project) =>
      (!week || project.metadata.week === week) &&
      (!topic || project.tags.some((tag) => tag.slug === topic)),
  );
  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-12 min-[992px]:py-18 sm:px-6 lg:px-8">
        <p className="tracking-eyebrow text-muted font-mono text-xs font-medium">
          CURATED REPOSITORIES
        </p>
        <h1 className="mt-3 text-4xl leading-[1.1] font-light tracking-tight min-[992px]:text-6xl sm:text-5xl">
          精选项目
        </h1>
        <p className="text-muted mt-4 max-w-2xl text-base leading-7">
          按主题与收录周整理值得关注的 GitHub
          项目，并记录它们解决的问题和适用场景。
        </p>
        <dl className="border-line mt-10 grid gap-6 border-y py-6 min-[992px]:mt-16 min-[992px]:grid-cols-[auto_1fr] min-[992px]:items-start">
          <div>
            <dt className="text-muted font-mono text-xs">按周</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {weeks.map((item) => (
                <Link
                  aria-current={week === item ? "page" : undefined}
                  className={`border-line rounded-control border px-3 py-2 font-mono text-xs ${
                    week === item
                      ? "bg-brand text-canvas border-brand"
                      : "bg-surface text-muted"
                  }`}
                  href={`/${locale}/curated?week=${encodeURIComponent(item)}`}
                  key={item}
                >
                  {item}
                </Link>
              ))}
              {!weeks.length ? (
                <span className="text-muted">暂无收录</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-muted font-mono text-xs">按主题</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {topics.map(([slug, label]) => (
                <Link
                  aria-current={topic === slug ? "page" : undefined}
                  className={`border-line rounded-control border px-3 py-2 font-mono text-xs ${
                    topic === slug
                      ? "bg-brand text-canvas border-brand"
                      : "bg-surface text-muted"
                  }`}
                  href={`/${locale}/curated?topic=${encodeURIComponent(slug)}`}
                  key={slug}
                >
                  {label}
                </Link>
              ))}
              {!topics.length ? (
                <span className="text-muted">暂无主题</span>
              ) : null}
            </dd>
          </div>
        </dl>
        {week || topic ? (
          <p className="text-muted mt-6 font-mono text-xs">
            当前筛选：{week ?? "全部周"} · {topic ?? "全部主题"}
          </p>
        ) : null}
        <div className="mt-10 grid gap-x-10 gap-y-10 min-[768px]:grid-cols-2 min-[992px]:mt-16 min-[992px]:grid-cols-3 min-[992px]:gap-y-16">
          {filteredProjects.map((project) => (
            <article className="border-line border-t pt-5" key={project.slug}>
              <p className="text-muted font-mono text-xs">
                {project.metadata.week} · 收录于 {project.metadata.collectedAt}
              </p>
              <h2 className="mt-4 text-2xl leading-tight font-light tracking-tight">
                <Link
                  className="hover:text-muted focus-visible:ring-brand outline-none focus-visible:ring-2"
                  href={`/${locale}/curated/${project.slug}`}
                >
                  {project.title}
                </Link>
              </h2>
              <p className="text-muted mt-3 leading-6">{project.summary}</p>
              <p className="text-muted mt-4 text-sm leading-6">
                解决问题：{project.metadata.problem}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    className="border-line text-muted rounded-control bg-surface border px-2.5 py-1 font-mono text-[11px] leading-4"
                    key={tag.id}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </article>
          ))}
          {!filteredProjects.length ? (
            <p className="text-muted">没有符合条件的精选项目。</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default function CuratedPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<CuratedFallback />}>
      <CuratedContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
