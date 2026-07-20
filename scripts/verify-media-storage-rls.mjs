import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.ok(url && key, "Supabase public configuration is required");
const anon = createClient(url, key, { auth: { persistSession: false } });
const path = `anonymous-check/${crypto.randomUUID()}.png`;
const bytes = new Uint8Array([137, 80, 78, 71]);
const upload = await anon.storage.from("content-media").upload(path, bytes, { contentType: "image/png" });
assert.ok(upload.error, "anonymous callers must not upload private media");
const listing = await anon.storage.from("content-media").list();
assert.ok(listing.error || listing.data?.length === 0, "anonymous callers must not enumerate private media");
