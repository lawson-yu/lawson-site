/* eslint-disable @next/next/no-img-element -- Cover URLs become managed media in Ticket 05. */
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
import { listPublishedProjects } from "@/lib/content/projects";

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
};

function buildProjectTagOptions(
  locale: string,
  projects: Awaited<ReturnType<typeof listPublishedProjects>>,
): ContentFilterOption[] {
  const tags = new Map<string, { count: number; label: string }>();
  for (const project of projects) {
    const projectTags = project.tags.length
      ? project.tags.map((item) => ({ label: item.label, slug: item.slug }))
      : project.metadata.techStack.map((item) => ({ label: item, slug: item }));
    for (const tag of projectTags) {
      const current = tags.get(tag.slug);
      tags.set(tag.slug, {
        count: (current?.count ?? 0) + 1,
        label: current?.label ?? tag.label,
      });
    }
  }
  return [...tags.entries()].map(([slug, tag]) => ({
    count: tag.count,
    href: `/${locale}/projects?tag=${encodeURIComponent(slug)}`,
    label: tag.label,
    slug,
  }));
}

export const metadata: Metadata = {
  alternates: { canonical: "/zh-CN/projects" },
  description: "LAWSON 的真实工程项目、技术选择与可验证成果。",
  title: "个人项目 | LAWSON",
};

function ProjectsFallback() {
  return <main className="bg-canvas min-h-screen" />;
}

async function ProjectsContent({ params, searchParams }: ProjectsPageProps) {
  await connection();
  const [{ locale }, { tag }] = await Promise.all([params, searchParams]);
  if (locale !== supportedLocale) notFound();
  const allProjects = await listPublishedProjects(locale);
  const projects = tag
    ? allProjects.filter(
        (project) =>
          project.tags.some((item) => item.slug === tag) ||
          project.metadata.techStack.some((item) => item === tag),
      )
    : allProjects;
  const tagOptions = buildProjectTagOptions(locale, allProjects);
  const activeTag = tag;
  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-12 min-[992px]:py-18 sm:px-6 lg:px-8">
        <PublicPageHeader
          description="从问题、技术选择到可验证成果的真实工程实践。标签负责分类，技术栈保留为项目事实。"
          eyebrow="BUILD LOG"
          title="个人项目"
        >
          <p className="text-muted font-mono text-xs leading-6">
            {projects.length} / {allProjects.length} 个项目显示
          </p>
        </PublicPageHeader>

        <div className="mt-10 min-[992px]:mt-16">
          <ContentFilterBar
            activeSlug={activeTag}
            allHref={`/${locale}/projects`}
            ariaLabel="项目标签"
            options={tagOptions}
          />
        </div>

        <div className="mt-10 grid gap-6 min-[992px]:mt-16">
          {projects.map((project) => (
            <article
              className="border-line bg-surface-raised flex min-w-0 flex-col gap-6 border-t p-6 sm:p-8 md:flex-row md:items-start md:justify-between"
              key={project.slug}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  {(project.tags.length
                    ? project.tags.map((item) => ({
                        key: item.id,
                        label: item.label,
                        slug: item.slug,
                      }))
                    : project.metadata.techStack.map((item) => ({
                        key: item,
                        label: item,
                        slug: item,
                      }))
                  ).map((tag) => (
                    <Link
                      className="border-line text-muted rounded-control bg-surface hover:text-brand focus-visible:ring-brand border px-3 py-1.5 font-mono text-[11px] leading-4 focus-visible:ring-2 focus-visible:outline-none"
                      href={`/${locale}/projects?tag=${encodeURIComponent(tag.slug)}`}
                      key={tag.key}
                    >
                      {tag.label}
                    </Link>
                  ))}
                </div>
                <h2 className="mt-6 text-3xl leading-tight font-semibold tracking-[-0.035em] [overflow-wrap:anywhere]">
                  <Link
                    className="hover:text-muted focus-visible:ring-brand outline-none focus-visible:ring-2"
                    href={`/${locale}/projects/${project.slug}`}
                  >
                    {project.title}
                  </Link>
                </h2>
                <p className="text-muted mt-3 leading-6">{project.summary}</p>
                <p className="text-muted mt-4 text-sm leading-6">
                  问题：{project.metadata.problem}
                </p>
                <p className="text-muted mt-1 text-sm leading-6">
                  成果：{project.metadata.outcomes}
                </p>
                <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs font-medium">
                  <a
                    href={project.metadata.repositoryUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    GitHub
                  </a>
                  {project.metadata.demoUrl ? (
                    <a
                      href={project.metadata.demoUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      演示
                    </a>
                  ) : null}
                </div>
              </div>
              {project.metadata.coverImageUrl ? (
                <img
                  alt={`${project.title} 项目封面`}
                  className="rounded-media border-line aspect-video w-full shrink-0 border object-cover md:w-64 lg:w-72"
                  src={project.metadata.coverImageUrl}
                />
              ) : null}
            </article>
          ))}
          {!projects.length ? (
            <p className="text-muted border-line border-t py-10">
              没有匹配内容。
              <Link
                className="underline underline-offset-4"
                href={`/${locale}/projects`}
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

export default function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  return (
    <Suspense fallback={<ProjectsFallback />}>
      <ProjectsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
