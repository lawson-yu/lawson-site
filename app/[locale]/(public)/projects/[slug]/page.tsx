import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { MarkdownContent } from "../../blog/[slug]/markdown-content";
import { supportedLocale } from "@/lib/content/catalog";
import { getPublishedProject } from "@/lib/content/projects";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { locale, slug } = await params;
  const project =
    locale === supportedLocale ? await getPublishedProject(locale, slug) : null;
  if (!project) return {};
  return {
    title: `${project.title} | LAWSON`,
    description: project.summary,
    alternates: { canonical: `/${locale}/projects/${project.slug}` },
    openGraph: {
      description: project.summary,
      title: project.title,
      type: "website",
    },
  };
}

function ProjectDetailFallback() {
  return <main className="bg-canvas min-h-screen" />;
}

async function ProjectDetailContent({ params }: Props) {
  await connection();
  const { locale, slug } = await params;
  if (locale !== supportedLocale) notFound();
  const project = await getPublishedProject(locale, slug);
  if (!project) notFound();
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Project",
    description: project.summary,
    name: project.title,
    sameAs: project.metadata.repositoryUrl,
  }).replace(/</g, "\\u003c");
  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <article className="max-w-reading mx-auto px-4 py-16 sm:px-6">
        <Link className="text-muted underline" href={`/${locale}/projects`}>
          ← 个人项目
        </Link>
        <p className="tracking-eyebrow text-accent mt-10 text-sm font-bold">
          PROJECT
        </p>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-6xl">
          {project.title}
        </h1>
        <p className="text-muted mt-6 text-xl leading-8">{project.summary}</p>
        {project.metadata.coverImageUrl ? (
          <img
            alt={`${project.title} 项目封面`}
            className="border-line mt-10 aspect-video w-full border object-cover"
            src={project.metadata.coverImageUrl}
          />
        ) : null}
        <dl className="border-line mt-12 grid gap-8 border-y py-8">
          <div>
            <dt className="font-bold">问题</dt>
            <dd className="text-muted mt-2 leading-7">
              {project.metadata.problem}
            </dd>
          </div>
          <div>
            <dt className="font-bold">成果</dt>
            <dd className="text-muted mt-2 leading-7">
              {project.metadata.outcomes}
            </dd>
          </div>
          <div>
            <dt className="font-bold">技术栈</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {project.metadata.techStack.map((item) => (
                <span
                  className="border-line rounded-full border px-3 py-1 text-sm"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </dd>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              className="bg-action text-canvas rounded-lg px-4 py-3 font-bold"
              href={project.metadata.repositoryUrl}
              rel="noreferrer"
              target="_blank"
            >
              查看代码
            </a>
            {project.metadata.demoUrl ? (
              <a
                className="border-line rounded-lg border px-4 py-3 font-bold"
                href={project.metadata.demoUrl}
                rel="noreferrer"
                target="_blank"
              >
                查看演示
              </a>
            ) : null}
          </div>
        </dl>
        <div className="mt-12">
          <MarkdownContent markdown={project.bodyMarkdown} />
        </div>
        <script
          dangerouslySetInnerHTML={{ __html: jsonLd }}
          type="application/ld+json"
        />
      </article>
    </main>
  );
}

export default function ProjectDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<ProjectDetailFallback />}>
      <ProjectDetailContent params={params} />
    </Suspense>
  );
}
