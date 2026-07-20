import { NextResponse } from "next/server";

import { getAuthorIdentity } from "@/lib/author/identity";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=missing-code", url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !(await getAuthorIdentity())) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/auth/login?error=unauthorized", url),
    );
  }

  return NextResponse.redirect(new URL("/author", url));
}
