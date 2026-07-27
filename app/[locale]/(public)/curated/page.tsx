import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import {
  ContentFilterBar,
  type ContentFilterOption,
} from "@/app/[locale]/(public)/_components/content-filter-bar";
import { PublicPageHeader } from "@/app/[locale]/(public)/_components/public-page-header";
import { supportedLocale } from "@/lib/content/catalog";
import { listPublishedCuratedProjects } from "@/lib/content/curated";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; topic?: string; week?: string }>;
};

function curatedHref(locale: string, filters: { tag?: string; week?: string }) {
  const params = new URLSearchParams();
  if (filters.week) params.set("week", filters.week);
  if (filters.tag) params.set("tag", filters.tag);
  const query = params.toString();
  return `/${locale}/curated${query ? `?${query}` : ""}`;
}

function buildCuratedTagOptions(
  locale: string,
  projects: Awaited<ReturnType<typeof listPublishedCuratedProjects>>,
  week?: string,
): ContentFilterOption[] {
  const tags = new Map<string, { count: number; label: string }>();
  for (const project of projects) {
    for (const tag of project.tags) {
      const current = tags.get(tag.slug);
      tags.set(tag.slug, {
        count: (current?.count ?? 0) + 1,
        label: current?.label ?? tag.label,
      });
    }
  }
  return [...tags.entries()].map(([slug, tag]) => ({
    count: tag.count,
    href: curatedHref(locale, { tag: slug, week }),
    label: tag.label,
    slug,
  }));
}

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
  const { tag, topic, week } = await searchParams;
  if (locale !== supportedLocale) notFound();
  const projects = await listPublishedCuratedProjects(locale);
  const weeks = [...new Set(projects.map((project) => project.metadata.week))];
  const activeTag = tag ?? topic;
  const tagOptions = buildCuratedTagOptions(locale, projects, week);
  const filteredProjects = projects.filter(
    (project) =>
      (!week || project.metadata.week === week) &&
      (!activeTag || project.tags.some((tag) => tag.slug === activeTag)),
  );
  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-12 min-[992px]:py-18 sm:px-6 lg:px-8">
        <PublicPageHeader
          description="按主题与收录周整理值得关注的 GitHub 项目，并记录它们解决的问题和适用场景。"
          eyebrow="CURATED REPOSITORIES"
          title="精选项目"
        >
          <p className="text-muted font-mono text-xs leading-6">
            {filteredProjects.length} / {projects.length} 个精选显示
          </p>
        </PublicPageHeader>

        <dl className="mt-10 grid gap-5 min-[992px]:mt-16">
          <div>
            <dt className="text-muted font-mono text-xs font-bold tracking-[0.12em]">
              WEEKS
            </dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              <Link
                aria-current={!week ? "page" : undefined}
                className={`border-line rounded-control border px-4 py-2 font-mono text-xs font-bold tracking-[0.08em] ${
                  !week
                    ? "bg-brand text-canvas border-brand"
                    : "bg-surface text-muted"
                }`}
                href={curatedHref(locale, { tag: activeTag })}
              >
                全部
              </Link>
              {weeks.map((item) => (
                <Link
                  aria-current={week === item ? "page" : undefined}
                  className={`border-line rounded-control border px-4 py-2 font-mono text-xs font-bold tracking-[0.08em] ${
                    week === item
                      ? "bg-brand text-canvas border-brand"
                      : "bg-surface text-muted"
                  }`}
                  href={curatedHref(locale, { tag: activeTag, week: item })}
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
        </dl>

        <div className="mt-8">
          <ContentFilterBar
            activeSlug={activeTag}
            allHref={curatedHref(locale, { week })}
            ariaLabel="精选项目标签"
            options={tagOptions}
          />
        </div>

        <p className="text-muted mt-6 font-mono text-xs">
          当前筛选：{week ?? "全部周"} · {activeTag ?? "全部标签"}
        </p>

        <div className="mt-10 grid gap-8 min-[768px]:grid-cols-2 min-[992px]:mt-16 min-[992px]:grid-cols-3">
          {filteredProjects.map((project) => (
            <article
              className="border-line bg-surface-raised flex min-h-full flex-col border-t p-6 sm:p-8"
              key={project.slug}
            >
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Link
                    className="border-line text-muted rounded-control bg-surface hover:text-brand focus-visible:ring-brand border px-3 py-1.5 font-mono text-[11px] leading-4 focus-visible:ring-2 focus-visible:outline-none"
                    href={curatedHref(locale, { tag: tag.slug, week })}
                    key={tag.id}
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
              <h2 className="mt-8 text-3xl leading-tight font-semibold tracking-[-0.035em] [overflow-wrap:anywhere]">
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
              <p className="text-muted mt-auto pt-8 font-mono text-xs">
                {project.metadata.week} · 收录于 {project.metadata.collectedAt}
              </p>
            </article>
          ))}
          {!filteredProjects.length ? (
            <p className="text-muted border-line border-t py-10 min-[768px]:col-span-2 min-[992px]:col-span-3">
              没有匹配内容。
              <Link
                className="underline underline-offset-4"
                href={`/${locale}/curated`}
              >
                全部
              </Link>
            </p>
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
