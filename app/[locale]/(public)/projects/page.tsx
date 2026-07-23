/* eslint-disable @next/next/no-img-element -- Cover URLs become managed media in Ticket 05. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { supportedLocale } from "@/lib/content/catalog";
import { listPublishedProjects } from "@/lib/content/projects";

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  alternates: { canonical: "/zh-CN/projects" },
  description: "LAWSON 的真实工程项目、技术选择与可验证成果。",
  title: "个人项目 | LAWSON",
};

function ProjectsFallback() {
  return <main className="bg-canvas min-h-screen" />;
}

async function ProjectsContent({ params }: ProjectsPageProps) {
  await connection();
  const { locale } = await params;
  if (locale !== supportedLocale) notFound();
  const projects = await listPublishedProjects(locale);
  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-12 min-[992px]:py-18 sm:px-6 lg:px-8">
        <p className="tracking-eyebrow text-muted font-mono text-xs font-medium">
          BUILD LOG
        </p>
        <h1 className="mt-3 text-4xl leading-[1.1] font-light tracking-tight min-[992px]:text-6xl sm:text-5xl">
          个人项目
        </h1>
        <p className="text-muted mt-4 max-w-2xl text-base leading-7">
          从问题、技术选择到可验证成果的真实工程实践。
        </p>
        <div className="border-line mt-8 border-t pt-8 min-[992px]:mt-16 min-[992px]:pt-10">
          <p className="text-muted font-mono text-xs">已发布项目目录</p>
        </div>
        <div className="mt-10 grid gap-x-10 gap-y-10 min-[768px]:grid-cols-2 min-[992px]:grid-cols-3 min-[992px]:gap-y-16">
          {projects.map((project) => (
            <article className="min-w-0" key={project.slug}>
              {project.metadata.coverImageUrl ? (
                <img
                  alt={`${project.title} 项目封面`}
                  className="rounded-media mb-5 aspect-video w-full object-cover"
                  src={project.metadata.coverImageUrl}
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                {project.metadata.techStack.map((item) => (
                  <span
                    className="border-line text-muted rounded-control bg-surface border px-2.5 py-1 font-mono text-[11px] leading-4"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h2 className="mt-5 text-2xl leading-tight font-light tracking-tight">
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
              <div className="mt-5 flex flex-wrap gap-4 font-mono text-xs font-medium">
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
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function ProjectsPage({ params }: ProjectsPageProps) {
  return (
    <Suspense fallback={<ProjectsFallback />}>
      <ProjectsContent params={params} />
    </Suspense>
  );
}
