import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { BlogHeader } from "../_components/blog-header";
import { MarkdownContent } from "./markdown-content";
import { getPublishedBlog, supportedLocale } from "@/lib/content/catalog";

type BlogDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  await connection();
  const { locale, slug } = await params;
  const blog =
    locale === supportedLocale ? await getPublishedBlog(locale, slug) : null;

  if (!blog) {
    return { title: "文章不存在 | LAWSON" };
  }

  return {
    alternates: { canonical: `/${locale}/blog/${blog.slug}` },
    description: blog.summary,
    openGraph: {
      description: blog.summary,
      title: blog.title,
      type: "article",
    },
    title: `${blog.title} | LAWSON`,
  };
}

function BlogDetailFallback() {
  return <main className="bg-canvas min-h-screen" />;
}

async function BlogDetailContent({ params }: BlogDetailPageProps) {
  await connection();
  const { locale, slug } = await params;

  if (locale !== supportedLocale) {
    notFound();
  }

  const blog = await getPublishedBlog(locale, slug);

  if (!blog) {
    notFound();
  }

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    author: { "@type": "Person", name: "LAWSON" },
    dateModified: blog.updatedAt,
    datePublished: blog.publishedAt,
    description: blog.summary,
    headline: blog.title,
    inLanguage: blog.locale,
  }).replace(/</g, "\\u003c");

  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <BlogHeader locale={locale} />
      <article className="max-w-reading mx-auto px-4 py-16 sm:px-6 sm:py-24">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          ENGINEERING NOTE
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-extrabold tracking-tight sm:text-6xl">
          {blog.title}
        </h1>
        <p className="text-muted mt-6 text-xl leading-8">{blog.summary}</p>
        <div className="text-muted mt-8 flex flex-wrap items-center gap-3 text-sm">
          <span>LAWSON</span>
          <span aria-hidden="true">·</span>
          <time dateTime={blog.publishedAt}>
            {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
              new Date(blog.publishedAt),
            )}
          </time>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <Link
              className="border-line text-accent rounded-full border px-3 py-1 text-xs font-semibold"
              href={`/${locale}/blog?tag=${encodeURIComponent(tag.slug)}`}
              key={tag.slug}
            >
              {tag.label}
            </Link>
          ))}
        </div>
        <div className="border-line mt-12 border-t pt-2">
          <MarkdownContent markdown={blog.bodyMarkdown} />
        </div>
      </article>
      <script
        dangerouslySetInnerHTML={{ __html: jsonLd }}
        type="application/ld+json"
      />
    </main>
  );
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  return (
    <Suspense fallback={<BlogDetailFallback />}>
      <BlogDetailContent params={params} />
    </Suspense>
  );
}
