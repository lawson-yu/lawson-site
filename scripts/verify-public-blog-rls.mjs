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
assert.deepEqual(variants, [
  { slug: "agent-workflows", state: "published" },
  { slug: "personal-site-foundation", state: "published" },
]);
assert.deepEqual(tags, [
  { slug: "ai-systems", state: "confirmed" },
  { slug: "engineering", state: "confirmed" },
  { slug: "unreviewed", state: "confirmed" },
]);
