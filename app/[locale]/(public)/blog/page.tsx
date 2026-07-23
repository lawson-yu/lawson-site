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
      <section className="max-w-site mx-auto px-4 py-12 min-[992px]:py-18 sm:px-6 lg:px-8">
        <p className="tracking-eyebrow text-muted font-mono text-xs font-medium">
          FIELD NOTES
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-[1.1] font-light tracking-tight min-[992px]:text-6xl sm:text-5xl">
          博客
        </h1>
        <p className="text-muted mt-4 max-w-2xl text-base leading-7">
          关于 AI、工程实践与可持续维护的技术系统。
        </p>

        <div className="border-line mt-8 border-t pt-8 min-[992px]:mt-16 min-[992px]:pt-10">
          <p className="text-muted font-mono text-xs">已发布文章目录</p>
        </div>
        <div className="mt-10 grid gap-x-10 gap-y-10 min-[768px]:grid-cols-2 min-[992px]:grid-cols-3 min-[992px]:gap-y-16">
          {blogs.map((blog) => (
            <article className="border-line border-t pt-5" key={blog.slug}>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Link
                    className="border-line text-muted rounded-control bg-surface border px-2.5 py-1 font-mono text-[11px] leading-4"
                    href={`/${locale}/blog?tag=${encodeURIComponent(tag.slug)}`}
                    key={tag.slug}
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
              <h2 className="mt-5 text-2xl leading-tight font-light tracking-tight">
                <Link
                  className="hover:text-muted focus-visible:ring-brand outline-none focus-visible:ring-2"
                  href={`/${locale}/blog/${blog.slug}`}
                >
                  {blog.title}
                </Link>
              </h2>
              <p className="text-muted mt-3 leading-6">{blog.summary}</p>
              <p className="text-muted mt-5 font-mono text-xs">
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
