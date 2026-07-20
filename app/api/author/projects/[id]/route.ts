import { NextResponse } from "next/server";

import {
  parseDraftProjectInput,
  parseProjectId,
} from "@/lib/author/project-input";
import { requireAuthor } from "@/lib/author/identity";
import { updateDraftProject } from "@/lib/content/projects";
import { requestFailure } from "../../response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    const id = parseProjectId(rawId);
    await updateDraftProject(id, parseDraftProjectInput(await request.json()));
    return NextResponse.json({ id });
  } catch (error) {
    return requestFailure(error);
  }
}
