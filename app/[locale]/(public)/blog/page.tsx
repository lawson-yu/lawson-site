import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import {
  ContentFilterBar,
  type ContentFilterOption,
} from "@/app/[locale]/(public)/_components/content-filter-bar";
import { PublicPageHeader } from "@/app/[locale]/(public)/_components/public-page-header";
import { listPublishedBlogs, supportedLocale } from "@/lib/content/catalog";

type BlogListPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
};

function buildBlogTagOptions(
  locale: string,
  blogs: Awaited<ReturnType<typeof listPublishedBlogs>>,
): ContentFilterOption[] {
  const tags = new Map<string, { count: number; label: string }>();
  for (const blog of blogs) {
    for (const tag of blog.tags) {
      const current = tags.get(tag.slug);
      tags.set(tag.slug, {
        count: (current?.count ?? 0) + 1,
        label: current?.label ?? tag.label,
      });
    }
  }
  return [...tags.entries()].map(([slug, tag]) => ({
    count: tag.count,
    href: `/${locale}/blog?tag=${encodeURIComponent(slug)}`,
    label: tag.label,
    slug,
  }));
}

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

  const allBlogs = await listPublishedBlogs(locale);
  const blogs = tag
    ? allBlogs.filter((blog) => blog.tags.some((item) => item.slug === tag))
    : allBlogs;
  const tagOptions = buildBlogTagOptions(locale, allBlogs);
  const activeTag = tag;

  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-12 min-[992px]:py-18 sm:px-6 lg:px-8">
        <PublicPageHeader
          description="关于 AI、工程实践与可持续维护的技术系统。先选主题，再读文章。"
          eyebrow="FIELD NOTES"
          title="博客"
        >
          <p className="text-muted font-mono text-xs leading-6">
            {blogs.length} / {allBlogs.length} 篇显示
          </p>
        </PublicPageHeader>

        <div className="mt-10 min-[992px]:mt-16">
          <ContentFilterBar
            activeSlug={activeTag}
            allHref={`/${locale}/blog`}
            ariaLabel="博客标签"
            options={tagOptions}
          />
        </div>

        <div className="mt-10 grid gap-8 min-[768px]:grid-cols-2 min-[992px]:grid-cols-3">
          {blogs.map((blog) => (
            <article
              className="border-line bg-surface-raised flex min-h-full flex-col border-t p-6 sm:p-8"
              key={blog.slug}
            >
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Link
                    className="border-line text-muted rounded-control bg-surface hover:text-brand focus-visible:ring-brand border px-3 py-1.5 font-mono text-[11px] leading-4 focus-visible:ring-2 focus-visible:outline-none"
                    href={`/${locale}/blog?tag=${encodeURIComponent(tag.slug)}`}
                    key={tag.slug}
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
              <h2 className="mt-8 text-3xl leading-tight font-semibold tracking-[-0.035em] [overflow-wrap:anywhere]">
                <Link
                  className="hover:text-muted focus-visible:ring-brand outline-none focus-visible:ring-2"
                  href={`/${locale}/blog/${blog.slug}`}
                >
                  {blog.title}
                </Link>
              </h2>
              <p className="text-muted mt-3 leading-6">{blog.summary}</p>
              <p className="text-muted mt-auto pt-8 font-mono text-xs">
                发布于{" "}
                {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
                  new Date(blog.publishedAt),
                )}
              </p>
            </article>
          ))}
          {!blogs.length ? (
            <p className="text-muted border-line border-t py-10 min-[768px]:col-span-2 min-[992px]:col-span-3">
              没有匹配内容。
            </p>
          ) : null}
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
