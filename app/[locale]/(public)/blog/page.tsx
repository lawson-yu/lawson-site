import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { listPublishedBlogs, supportedLocale } from "@/lib/content/catalog";

type BlogListPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
};

export const metadata: Metadata = {
  alternates: { canonical: "/zh-CN/blog" },
  description: "LAWSON 的工程实践、教程与 AI 内容。",
  title: "博客 | LAWSON",
};

function BlogListFallback() {
  return <main className="bg-canvas min-h-screen" />;
}

async function BlogListContent({ params, searchParams }: BlogListPageProps) {
  await connection();
  const [{ locale }, { tag }] = await Promise.all([params, searchParams]);

  if (locale !== supportedLocale) {
    notFound();
  }

  const blogs = await listPublishedBlogs(locale, tag);

  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="tracking-eyebrow text-accent text-sm font-bold">
          FIELD NOTES
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl leading-none font-extrabold tracking-tight sm:text-7xl">
          博客
        </h1>
        <p className="text-muted mt-6 max-w-2xl text-lg leading-8">
          关于 AI、工程实践与可持续维护的技术系统。
        </p>

        <div className="mt-16 grid gap-4">
          {blogs.map((blog) => (
            <article
              className="border-line bg-surface hover:border-brand hover:bg-surface-raised border p-6 transition-colors sm:p-8"
              key={blog.slug}
            >
              <div className="flex flex-wrap gap-2">
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
              <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
                <Link
                  className="focus-visible:ring-brand outline-none focus-visible:ring-2"
                  href={`/${locale}/blog/${blog.slug}`}
                >
                  {blog.title}
                </Link>
              </h2>
              <p className="text-muted mt-4 max-w-3xl leading-7">
                {blog.summary}
              </p>
              <p className="text-muted mt-6 text-sm">
                发布于{" "}
                {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
                  new Date(blog.publishedAt),
                )}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function BlogListPage({
  params,
  searchParams,
}: BlogListPageProps) {
  return (
    <Suspense fallback={<BlogListFallback />}>
      <BlogListContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
