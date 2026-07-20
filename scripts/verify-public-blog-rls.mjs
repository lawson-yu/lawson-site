import assert from "node:assert/strict";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

assert(url, "缺少 NEXT_PUBLIC_SUPABASE_URL。");
assert(key, "缺少 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。");

const supabase = createClient(url, key);
const { data: variants, error: variantError } = await supabase
  .from("content_variants")
  .select("slug, state")
  .order("slug");
const { data: tags, error: tagError } = await supabase
  .from("tags")
  .select("slug, state")
  .order("slug");

assert.ifError(variantError);
assert.ifError(tagError);
assert.ok(variants.length > 0, "公开内容不应为空。");
assert.ok(
  variants.every((variant) => variant.state === "published"),
  "匿名读取不应包含草稿。",
);
assert.ok(
  variants.some((variant) => variant.slug === "langchain"),
  "已发布精选项目应可公开读取。",
);
assert.ok(tags.length > 0, "公开标签不应为空。");
assert.ok(
  tags.every((tag) => tag.state === "confirmed"),
  "匿名读取不应包含待确认标签。",
);
