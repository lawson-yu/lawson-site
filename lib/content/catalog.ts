import { createPublicClient } from "@/lib/supabase/public";
import { assertContinuousHeadingLevels } from "./markdown";

export const supportedLocale = "zh-CN";

export type BlogTag = {
  label: string;
  slug: string;
};

export type PublishedBlog = {
  bodyMarkdown: string;
  locale: string;
  publishedAt: string;
  slug: string;
  summary: string;
  tags: BlogTag[];
  title: string;
  updatedAt: string;
};

export const searchableContentKinds = ["blog", "project", "curated"] as const;

export type SearchableContentKind = (typeof searchableContentKinds)[number];

export type PublishedSearchResult = {
  kind: SearchableContentKind;
  locale: string;
  publishedAt: string;
  slug: string;
  summary: string;
  tags: BlogTag[];
  title: string;
};

type SearchResultRow = {
  kind: SearchableContentKind;
  locale: string;
  published_at: string;
  slug: string;
  summary: string;
  tags: BlogTag[];
  title: string;
};

type ContentVariantRow = {
  body_markdown: string;
  content_items: { kind: "blog" | "curated" | "project" } | null;
  content_tags: Array<{
    tags: {
      label: string;
      slug: string;
      state: "confirmed" | "pending";
    } | null;
  }>;
  locale: string;
  published_at: string | null;
  slug: string;
  summary: string;
  title: string;
  updated_at: string;
};

function toPublishedBlog(row: ContentVariantRow): PublishedBlog | null {
  if (!row.published_at || row.content_items?.kind !== "blog") {
    return null;
  }

  assertContinuousHeadingLevels(row.body_markdown);

  return {
    bodyMarkdown: row.body_markdown,
    locale: row.locale,
    publishedAt: row.published_at,
    slug: row.slug,
    summary: row.summary,
    tags: row.content_tags.flatMap(({ tags }) =>
      tags?.state === "confirmed"
        ? [{ label: tags.label, slug: tags.slug }]
        : [],
    ),
    title: row.title,
    updatedAt: row.updated_at,
  };
}

async function selectPublishedBlogs(locale: string, slug?: string) {
  const supabase = createPublicClient();
  let query = supabase
    .from("content_variants")
    .select(
      "body_markdown, content_items!inner(kind), content_tags(tags(label, slug, state)), locale, published_at, slug, summary, title, updated_at",
    )
    .eq("state", "published")
    .eq("locale", locale)
    .eq("content_items.kind", "blog")
    .order("published_at", { ascending: false });

  if (slug) {
    query = query.eq("slug", slug);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`无法读取已发布博客：${error.message}`);
  }

  return (data as unknown as ContentVariantRow[]).flatMap((row) => {
    const blog = toPublishedBlog(row);
    return blog ? [blog] : [];
  });
}

export async function listPublishedBlogs(locale: string, tag?: string) {
  const blogs = await selectPublishedBlogs(locale);

  return tag
    ? blogs.filter((blog) => blog.tags.some(({ slug }) => slug === tag))
    : blogs;
}

export async function getPublishedBlog(locale: string, slug: string) {
  const [blog] = await selectPublishedBlogs(locale, slug);
  return blog ?? null;
}

export async function searchPublished(
  locale: string,
  query: string,
  kind?: SearchableContentKind,
  cursor = 0,
): Promise<PublishedSearchResult[]> {
  const { data, error } = await createPublicClient().rpc(
    "search_published_content",
    {
      search_cursor: cursor,
      search_kind: kind ?? null,
      search_locale: locale,
      search_query: query,
    },
  );

  if (error) {
    throw new Error(`无法搜索已发布内容：${error.message}`);
  }

  return (data as SearchResultRow[]).map((result) => ({
    kind: result.kind,
    locale: result.locale,
    publishedAt: result.published_at,
    slug: result.slug,
    summary: result.summary,
    tags: result.tags,
    title: result.title,
  }));
}
