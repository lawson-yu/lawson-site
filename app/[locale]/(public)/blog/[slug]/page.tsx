import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

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
      <article className="max-w-reading mx-auto px-4 py-16 sm:px-6 sm:py-24">
        <p className="tracking-eyebrow text-accent text-xs font-bold">
          ENGINEERING NOTE
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-medium tracking-tight sm:text-6xl">
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
              className="border-line text-accent rounded-md border px-3 py-1 text-xs font-semibold"
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
      <RelatedLinks locale={locale} />
      <script
        dangerouslySetInnerHTML={{ __html: jsonLd }}
        type="application/ld+json"
      />
    </main>
  );
}

function RelatedLinks({ locale }: { locale: string }) {
  return (
    <aside
      className="bg-surface text-ink border-line border-y"
      aria-label="继续浏览"
    >
      <div className="max-w-reading mx-auto px-4 py-12 sm:px-6">
        <p className="tracking-eyebrow text-brand text-xs font-bold">
          CONTINUE READING
        </p>
        <h2 className="mt-3 text-2xl font-medium">继续浏览真实内容</h2>
        <nav className="mt-6 flex flex-wrap gap-3" aria-label="相关内容入口">
          <Link
            className="border-line rounded-md border px-4 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            href={`/${locale}/blog`}
          >
            全部博客
          </Link>
          <Link
            className="border-line rounded-md border px-4 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            href={`/${locale}/projects`}
          >
            个人项目
          </Link>
          <Link
            className="border-line rounded-md border px-4 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
            href={`/${locale}/curated`}
          >
            精选项目
          </Link>
        </nav>
      </div>
    </aside>
  );
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  return (
    <Suspense fallback={<BlogDetailFallback />}>
      <BlogDetailContent params={params} />
    </Suspense>
  );
}
