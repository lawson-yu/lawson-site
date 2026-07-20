import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    options: { redirectTo: new URL("/auth/callback", request.url).toString() },
    provider: "github",
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      new URL("/auth/login?error=unavailable", request.url),
    );
  }

  return NextResponse.redirect(data.url);
}
