import { NextResponse } from "next/server";

import { parseContentId } from "@/lib/author/blog-input";
import { requireAuthor } from "@/lib/author/identity";
import { createBlogEditDraft } from "@/lib/content/workspace";
import { requestFailure } from "../../../response";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    const id = await createBlogEditDraft(parseContentId(rawId));
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return requestFailure(error);
  }
}
