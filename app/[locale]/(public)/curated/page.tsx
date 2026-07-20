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
    ).values(),
  ];
  const filteredProjects = projects.filter(
    (project) =>
      (!week || project.metadata.week === week) &&
      (!topic || project.tags.some((tag) => tag.slug === topic)),
  );
  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          CURATED REPOSITORIES
        </p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
          精选项目
        </h1>
        <p className="text-muted mt-6 max-w-2xl text-lg leading-8">
          按主题与收录周整理值得关注的 GitHub
          项目，并记录它们解决的问题和适用场景。
        </p>
        <dl className="border-line mt-10 grid gap-6 border-y py-6 sm:grid-cols-2">
          <div>
            <dt className="font-bold">按周</dt>
            <dd className="mt-2 flex flex-wrap gap-3">
              {weeks.map((item) => (
                <Link
                  className="text-muted underline"
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
            <dt className="font-bold">按主题</dt>
            <dd className="mt-2 flex flex-wrap gap-3">
              {topics.map(([slug, label]) => (
                <Link
                  className="text-muted underline"
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
          <p className="text-muted mt-6">
            当前筛选：{week ?? "全部周"} · {topic ?? "全部主题"}
          </p>
        ) : null}
        <div className="mt-12 grid gap-4">
          {filteredProjects.map((project) => (
            <article
              className="border-line bg-surface border p-6 sm:p-8"
              key={project.slug}
            >
              <p className="text-muted text-sm">
                {project.metadata.week} · 收录于 {project.metadata.collectedAt}
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                <Link
                  className="focus-visible:ring-brand outline-none focus-visible:ring-2"
                  href={`/${locale}/curated/${project.slug}`}
                >
                  {project.title}
                </Link>
              </h2>
              <p className="text-muted mt-4 leading-7">{project.summary}</p>
              <p className="text-muted mt-4 leading-7">
                解决问题：{project.metadata.problem}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    className="text-accent rounded-full border px-3 py-1 text-xs font-semibold"
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
