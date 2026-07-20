import assert from "node:assert/strict";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

assert(url, "缺少 NEXT_PUBLIC_SUPABASE_URL。");
assert(key, "缺少 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。");

const anon = createClient(url, key, { auth: { persistSession: false } });

const { data: publicTags, error: publicTagsError } = await anon
  .from("tags")
  .select("slug");

assert.ifError(publicTagsError);
const confirmedTagSlugs = new Set(publicTags.map((tag) => tag.slug));

const { data: chineseResults, error: chineseError } = await anon.rpc(
  "search_published_content",
  {
    search_cursor: 0,
    search_kind: "blog",
    search_locale: "zh-CN",
    search_query: "技术站",
  },
);

assert.ifError(chineseError);
assert.ok(
  chineseResults.some((result) => result.slug === "personal-site-foundation"),
  "中文分词搜索应以“技术站”命中已发布博客。",
);

const { data: projectResults, error: projectError } = await anon.rpc(
  "search_published_content",
  {
    search_cursor: 0,
    search_kind: "project",
    search_locale: "zh-CN",
    search_query: "LAWSON",
  },
);

assert.ifError(projectError);
assert.ok(
  projectResults.some((result) => result.slug === "lawson-site"),
  "匿名搜索应返回已发布个人项目。",
);
assert.ok(
  projectResults.every((result) => result.kind === "project"),
  "内容类型筛选不应混入其他内容。",
);

const { data: draftResults, error: draftError } = await anon.rpc(
  "search_published_content",
  {
    search_cursor: 0,
    search_kind: null,
    search_locale: "zh-CN",
    search_query: "不会出现在公开站",
  },
);

assert.ifError(draftError);
assert.deepEqual(draftResults, [], "匿名搜索不应返回草稿。");

const { data: tagResults, error: tagError } = await anon.rpc(
  "search_published_content",
  {
    search_cursor: 0,
    search_kind: null,
    search_locale: "zh-CN",
    search_query: "待确认标签",
  },
);

assert.ifError(tagError);
assert.ok(
  tagResults
    .flatMap((result) => result.tags)
    .every((tag) => confirmedTagSlugs.has(tag.slug)),
  "匿名搜索结果不应包含不可公开读取的标签。",
);
