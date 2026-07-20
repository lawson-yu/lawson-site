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
      <section className="max-w-site mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          BUILD LOG
        </p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
          个人项目
        </h1>
        <p className="text-muted mt-6 max-w-2xl text-lg leading-8">
          从问题、技术选择到可验证成果的真实工程实践。
        </p>
        <div className="mt-16 grid gap-4">
          {projects.map((project) => (
            <article
              className="border-line bg-surface border p-6 sm:p-8"
              key={project.slug}
            >
              {project.metadata.coverImageUrl ? (
                <img
                  alt={`${project.title} 项目封面`}
                  className="border-line mb-6 aspect-video w-full border object-cover"
                  src={project.metadata.coverImageUrl}
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                {project.metadata.techStack.map((item) => (
                  <span
                    className="text-accent rounded-full border px-3 py-1 text-xs font-semibold"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
                <Link
                  className="focus-visible:ring-brand outline-none focus-visible:ring-2"
                  href={`/${locale}/projects/${project.slug}`}
                >
                  {project.title}
                </Link>
              </h2>
              <p className="text-muted mt-4 max-w-3xl leading-7">
                {project.summary}
              </p>
              <p className="text-muted mt-4 leading-7">
                问题：{project.metadata.problem}
              </p>
              <p className="text-muted mt-2 leading-7">
                成果：{project.metadata.outcomes}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
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
