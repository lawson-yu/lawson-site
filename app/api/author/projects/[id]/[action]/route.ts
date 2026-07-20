import { NextResponse } from "next/server";

import { parseProjectId } from "@/lib/author/project-input";
import { requireAuthor } from "@/lib/author/identity";
import {
  createProjectEditDraft,
  publishDraftProject,
  unpublishProject,
} from "@/lib/content/projects";
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
    const id = parseProjectId(rawId);
    if (action === "edit")
      return NextResponse.json(
        { id: await createProjectEditDraft(id) },
        { status: 201 },
      );
    if (action === "publish") {
      await publishDraftProject(id);
      return NextResponse.json({ id });
    }
    if (action === "unpublish") {
      await unpublishProject(id);
      return NextResponse.json({ id });
    }
    return NextResponse.json({ error: "操作无效" }, { status: 404 });
  } catch (error) {
    return requestFailure(error);
  }
}
