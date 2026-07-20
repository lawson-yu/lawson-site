import { createClient } from "@supabase/supabase-js";

const fetchWithoutCache: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { fetch: fetchWithoutCache } },
  );
}
