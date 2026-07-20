import { NextResponse } from "next/server";

import { parseCuratedId } from "@/lib/author/curated-input";
import { requireAuthor } from "@/lib/author/identity";
import {
  createCuratedEditDraft,
  publishDraftCuratedProject,
  unpublishCuratedProject,
} from "@/lib/content/curated";
import { requestFailure } from "../../../response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ action: string; id: string }> },
) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { action, id: rawId } = await params;
    const id = parseCuratedId(rawId);
    if (action === "edit")
      return NextResponse.json(
        { id: await createCuratedEditDraft(id) },
        { status: 201 },
      );
    if (action === "publish") {
      await publishDraftCuratedProject(id);
      return NextResponse.json({ id });
    }
    if (action === "unpublish") {
      await unpublishCuratedProject(id);
      return NextResponse.json({ id });
    }
    return NextResponse.json({ error: "操作无效" }, { status: 404 });
  } catch (error) {
    return requestFailure(error);
  }
}
