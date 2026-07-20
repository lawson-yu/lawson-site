import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { WorkspaceError } from "@/lib/content/workspace";

export function requestFailure(error: unknown) {
  if (error instanceof WorkspaceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  const message = error instanceof Error ? error.message : "请求无效";
  return NextResponse.json({ error: message }, { status: 400 });
}

export function revalidatePublicBlogs() {
  revalidatePath("/zh-CN/blog");
  revalidatePath("/zh-CN/blog/[slug]", "page");
}
