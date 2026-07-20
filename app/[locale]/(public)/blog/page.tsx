import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BlogHeader } from "./_components/blog-header";
import { listPublishedBlogs, supportedLocale } from "@/lib/content/catalog";

type BlogListPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
};

export const metadata: Metadata = {
  description: "LAWSON 的工程实践、教程与 AI 内容。",
  title: "博客 | LAWSON",
};

function BlogListFallback() {
  return <main className="min-h-screen bg-canvas" />;
}

async function BlogListContent({ params, searchParams }: BlogListPageProps) {
  const [{ locale }, { tag }] = await Promise.all([params, searchParams]);

  if (locale !== supportedLocale) {
    notFound();
  }

  const blogs = await listPublishedBlogs(locale, tag);

  return (
    <main className="min-h-screen bg-canvas text-ink" lang={locale}>
      <BlogHeader locale={locale} />
      <section className="mx-auto max-w-site px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="text-sm font-bold tracking-eyebrow text-accent">FIELD NOTES</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-none tracking-tight sm:text-7xl">
          博客
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          关于 AI、工程实践与可持续维护的技术系统。
        </p>

        <div className="mt-16 grid gap-4">
          {blogs.map((blog) => (
            <article
              className="border border-line bg-surface p-6 transition-colors hover:border-brand hover:bg-surface-raised sm:p-8"
              key={blog.slug}
            >
              <div className="flex flex-wrap gap-2">
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
              <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
                <Link
                  className="outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  href={`/${locale}/blog/${blog.slug}`}
                >
                  {blog.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-3xl leading-7 text-muted">{blog.summary}</p>
              <p className="mt-6 text-sm text-muted">
                发布于 {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(blog.publishedAt))}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function BlogListPage({ params, searchParams }: BlogListPageProps) {
  return (
    <Suspense fallback={<BlogListFallback />}>
      <BlogListContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
