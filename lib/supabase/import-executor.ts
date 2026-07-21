import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * This client is deliberately private to the restricted import executor. It
 * must never be imported by a page, browser client, or general data module.
 */
export function createImportExecutorClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Import executor is unavailable");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
