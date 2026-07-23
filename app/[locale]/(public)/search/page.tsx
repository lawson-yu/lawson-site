import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import {
  searchableContentKinds,
  searchPublished,
  supportedLocale,
  type SearchableContentKind,
} from "@/lib/content/catalog";

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string; kind?: string; q?: string }>;
};

const kindLabels: Record<SearchableContentKind, string> = {
  blog: "博客",
  curated: "精选项目",
  project: "个人项目",
};

export const metadata: Metadata = {
  alternates: { canonical: "/zh-CN/search" },
  robots: { follow: true, index: false },
  title: "搜索 | LAWSON",
};

function SearchFallback() {
  return <main className="bg-canvas min-h-screen" />;
}

function parseCursor(value: string | undefined) {
  const cursor = Number(value);
  return Number.isInteger(cursor) && cursor > 0 ? cursor : 0;
}

function parseKind(value: string | undefined) {
  return searchableContentKinds.includes(value as SearchableContentKind)
    ? (value as SearchableContentKind)
    : undefined;
}

function searchHref(
  locale: string,
  query: string,
  kind?: SearchableContentKind,
  cursor = 0,
) {
  const params = new URLSearchParams({ q: query });
  if (kind) params.set("kind", kind);
  if (cursor) params.set("cursor", String(cursor));
  return `/${locale}/search?${params.toString()}`;
}

async function SearchContent({ params, searchParams }: SearchPageProps) {
  await connection();
  const [{ locale }, { cursor: cursorParam, kind: kindParam, q: queryParam }] =
    await Promise.all([params, searchParams]);
  if (locale !== supportedLocale) notFound();

  const query = queryParam?.trim() ?? "";
  const kind = parseKind(kindParam);
  const cursor = parseCursor(cursorParam);
  const results = query
    ? await searchPublished(locale, query, kind, cursor)
    : [];

  return (
    <main className="bg-canvas text-ink min-h-screen" lang={locale}>
      <section className="max-w-site mx-auto px-4 py-12 min-[992px]:py-18 sm:px-6 lg:px-8">
        <p className="tracking-eyebrow text-muted font-mono text-xs font-medium">
          SEARCH
        </p>
        <h1 className="mt-3 text-4xl leading-[1.1] font-light tracking-tight min-[992px]:text-6xl sm:text-5xl">
          搜索
        </h1>
        <div className="border-line mt-8 border-t pt-8 min-[992px]:mt-16 min-[992px]:pt-10">
          <form
            className="flex max-w-3xl flex-col gap-3 min-[768px]:flex-row"
            method="get"
          >
            <input
              aria-label="搜索关键词"
              className="border-line rounded-control bg-canvas focus-visible:border-accent min-h-11 min-w-0 flex-1 border px-4 py-3 text-base outline-none"
              defaultValue={query}
              name="q"
              placeholder="搜索已发布内容"
              required
              type="search"
            />
            {kind ? <input name="kind" type="hidden" value={kind} /> : null}
            <button
              className="rounded-control bg-action text-ink min-h-11 px-5 py-3 font-mono text-sm font-medium"
              type="submit"
            >
              搜索
            </button>
          </form>
          <nav
            aria-label="内容类型"
            className="mt-6 flex flex-wrap gap-2"
            role="group"
          >
            <Link
              aria-current={!kind ? "page" : undefined}
              className={`border-line rounded-control border px-3 py-2 font-mono text-xs ${
                !kind
                  ? "bg-brand text-canvas border-brand"
                  : "bg-surface text-muted"
              }`}
              href={searchHref(locale, query)}
            >
              全部
            </Link>
            {searchableContentKinds.map((item) => (
              <Link
                aria-current={kind === item ? "page" : undefined}
                className={`border-line rounded-control border px-3 py-2 font-mono text-xs ${
                  kind === item
                    ? "bg-brand text-canvas border-brand"
                    : "bg-surface text-muted"
                }`}
                href={searchHref(locale, query, item)}
                key={item}
              >
                {kindLabels[item]}
              </Link>
            ))}
          </nav>
        </div>
        {query ? (
          <p className="text-muted mt-10 font-mono text-xs">
            {kind ? `${kindLabels[kind]} · ` : ""}“{query}” 的搜索结果
          </p>
        ) : (
          <p className="text-muted mt-10 font-mono text-xs">
            输入关键词，搜索已发布的博客和项目。
          </p>
        )}
        <div className="mt-8 grid gap-x-10 gap-y-10 min-[768px]:grid-cols-2 min-[992px]:grid-cols-3 min-[992px]:gap-y-16">
          {results.map((result) => (
            <article
              className="border-line border-t pt-5"
              key={`${result.kind}-${result.slug}`}
            >
              <p className="text-muted font-mono text-xs">
                {kindLabels[result.kind]}
              </p>
              <h2 className="mt-4 text-2xl leading-tight font-light tracking-tight">
                <Link
                  className="hover:text-muted focus-visible:ring-brand outline-none focus-visible:ring-2"
                  href={`/${locale}/${result.kind === "blog" ? "blog" : result.kind === "project" ? "projects" : "curated"}/${result.slug}`}
                >
                  {result.title}
                </Link>
              </h2>
              <p className="text-muted mt-3 leading-6">{result.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {result.tags.map((tag) => (
                  <span
                    className="border-line text-muted rounded-control bg-surface border px-2.5 py-1 font-mono text-[11px] leading-4"
                    key={tag.slug}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </article>
          ))}
          {query && !results.length ? (
            <p className="text-muted font-mono text-sm">
              没有匹配的已发布内容。
            </p>
          ) : null}
        </div>
        {query && cursor > 0 ? (
          <Link
            className="border-line text-muted rounded-control bg-surface mt-10 inline-block border px-3 py-2 font-mono text-xs"
            href={searchHref(locale, query, kind, cursor - 1)}
          >
            上一页
          </Link>
        ) : null}
        {query && results.length === 20 ? (
          <Link
            className="border-line text-muted rounded-control bg-surface mt-10 ml-2 inline-block border px-3 py-2 font-mono text-xs"
            href={searchHref(locale, query, kind, cursor + 1)}
          >
            下一页
          </Link>
        ) : null}
      </section>
    </main>
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent {...props} />
    </Suspense>
  );
}
