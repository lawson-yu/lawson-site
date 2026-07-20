import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BlogHeader } from "../_components/blog-header";
import { MarkdownContent } from "./markdown-content";
import { getPublishedBlog, supportedLocale } from "@/lib/content/catalog";

type BlogDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const blog = locale === supportedLocale ? await getPublishedBlog(locale, slug) : null;

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
  return <main className="min-h-screen bg-canvas" />;
}

async function BlogDetailContent({ params }: BlogDetailPageProps) {
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
    <main className="min-h-screen bg-canvas text-ink" lang={locale}>
      <BlogHeader locale={locale} />
      <article className="mx-auto max-w-reading px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm font-bold tracking-eyebrow text-accent">ENGINEERING NOTE</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          {blog.title}
        </h1>
        <p className="mt-6 text-xl leading-8 text-muted">{blog.summary}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>LAWSON</span>
          <span aria-hidden="true">·</span>
          <time dateTime={blog.publishedAt}>
            {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(blog.publishedAt))}
          </time>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <Link
              className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-accent"
              href={`/${locale}/blog?tag=${encodeURIComponent(tag.slug)}`}
              key={tag.slug}
            >
              {tag.label}
            </Link>
          ))}
        </div>
        <div className="mt-12 border-t border-line pt-2">
          <MarkdownContent markdown={blog.bodyMarkdown} />
        </div>
      </article>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />
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
