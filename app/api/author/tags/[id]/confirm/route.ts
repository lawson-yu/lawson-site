import { NextResponse } from "next/server";

import { parseContentId } from "@/lib/author/blog-input";
import { requireAuthor } from "@/lib/author/identity";
import { confirmWorkspaceTag } from "@/lib/content/workspace";
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
    const id = parseContentId(rawId);
    await confirmWorkspaceTag(id);
    return NextResponse.json({ id });
  } catch (error) {
    return requestFailure(error);
  }
}
