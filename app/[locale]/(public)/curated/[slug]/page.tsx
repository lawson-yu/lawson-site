import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { MarkdownContent } from "../../blog/[slug]/markdown-content";
import { supportedLocale } from "@/lib/content/catalog";
import { getPublishedCuratedProject } from "@/lib/content/curated";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { locale, slug } = await params;
  const project =
    locale === supportedLocale
      ? await getPublishedCuratedProject(locale, slug)
      : null;
  if (!project) return {};
  return {
    title: `${project.title} | LAWSON`,
    description: project.summary,
    alternates: { canonical: `/${locale}/curated/${project.slug}` },
  };
}

function CuratedDetailFallback() {
  return <main className="bg-canvas min-h-screen" />;
}

async function CuratedDetailContent({ params }: Props) {
  await connection();
  const { locale, slug } = await params;
  if (locale !== supportedLocale) notFound();
  const project = await getPublishedCuratedProject(locale, slug);
  if (!project) notFound();
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    codeRepository: project.metadata.sourceRepositoryUrl,
    description: project.summary,
    name: project.title,
  }).replace(/</g, "\\u003c");
  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <article className="max-w-reading mx-auto px-4 py-16 sm:px-6">
        <Link className="text-muted underline" href={`/${locale}/curated`}>
          ← 精选项目
        </Link>
        <p className="tracking-eyebrow text-accent mt-10 text-sm font-bold">
          {project.metadata.week}
        </p>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-6xl">
          {project.title}
        </h1>
        <p className="text-muted mt-6 text-xl leading-8">{project.summary}</p>
        <dl className="border-line mt-12 grid gap-8 border-y py-8">
          <div>
            <dt className="font-bold">解决的问题</dt>
            <dd className="text-muted mt-2 leading-7">
              {project.metadata.problem}
            </dd>
          </div>
          <div>
            <dt className="font-bold">适用场景</dt>
            <dd className="text-muted mt-2 leading-7">
              {project.metadata.useCases}
            </dd>
          </div>
          <div>
            <dt className="font-bold">作者短评</dt>
            <dd className="text-muted mt-2 leading-7">
              {project.metadata.commentary}
            </dd>
          </div>
          <div>
            <dt className="font-bold">主题</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  className="border-line rounded-full border px-3 py-1 text-sm"
                  key={tag.id}
                >
                  {tag.label}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="font-bold">收录日期</dt>
            <dd className="text-muted mt-2">{project.metadata.collectedAt}</dd>
          </div>
          <a
            className="bg-action text-canvas w-fit rounded-lg px-4 py-3 font-bold"
            href={project.metadata.sourceRepositoryUrl}
            rel="noreferrer"
            target="_blank"
          >
            查看 GitHub 仓库
          </a>
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

export default function CuratedDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<CuratedDetailFallback />}>
      <CuratedDetailContent params={params} />
    </Suspense>
  );
}
