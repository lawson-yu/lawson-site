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
      <section className="max-w-site mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="tracking-eyebrow text-accent text-sm font-bold">SEARCH</p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
          搜索
        </h1>
        <form className="mt-10 flex max-w-3xl gap-3" method="get">
          <input
            aria-label="搜索关键词"
            className="border-line bg-surface min-w-0 flex-1 border px-4 py-3"
            defaultValue={query}
            name="q"
            placeholder="搜索已发布内容"
            required
            type="search"
          />
          {kind ? <input name="kind" type="hidden" value={kind} /> : null}
          <button
            className="bg-brand px-5 py-3 font-bold text-white"
            type="submit"
          >
            搜索
          </button>
        </form>
        <nav aria-label="内容类型" className="mt-6 flex flex-wrap gap-3">
          <Link
            className="text-muted underline"
            href={searchHref(locale, query)}
          >
            全部
          </Link>
          {searchableContentKinds.map((item) => (
            <Link
              className="text-muted underline"
              href={searchHref(locale, query, item)}
              key={item}
            >
              {kindLabels[item]}
            </Link>
          ))}
        </nav>
        {query ? (
          <p className="text-muted mt-10">
            {kind ? `${kindLabels[kind]} · ` : ""}“{query}” 的搜索结果
          </p>
        ) : (
          <p className="text-muted mt-10">
            输入关键词，搜索已发布的博客和项目。
          </p>
        )}
        <div className="mt-6 grid gap-4">
          {results.map((result) => (
            <article
              className="border-line bg-surface border p-6 sm:p-8"
              key={`${result.kind}-${result.slug}`}
            >
              <p className="text-accent text-sm font-semibold">
                {kindLabels[result.kind]}
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                <Link
                  className="focus-visible:ring-brand outline-none focus-visible:ring-2"
                  href={`/${locale}/${result.kind === "blog" ? "blog" : result.kind === "project" ? "projects" : "curated"}/${result.slug}`}
                >
                  {result.title}
                </Link>
              </h2>
              <p className="text-muted mt-4 leading-7">{result.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {result.tags.map((tag) => (
                  <span
                    className="text-accent rounded-full border px-3 py-1 text-xs font-semibold"
                    key={tag.slug}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </article>
          ))}
          {query && !results.length ? (
            <p className="text-muted">没有匹配的已发布内容。</p>
          ) : null}
        </div>
        {query && cursor > 0 ? (
          <Link
            className="text-muted mt-8 inline-block underline"
            href={searchHref(locale, query, kind, cursor - 1)}
          >
            上一页
          </Link>
        ) : null}
        {query && results.length === 20 ? (
          <Link
            className="text-muted mt-8 ml-6 inline-block underline"
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
