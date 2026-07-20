import { NextResponse } from "next/server";

import {
  parseCuratedId,
  parseDraftCuratedInput,
} from "@/lib/author/curated-input";
import { requireAuthor } from "@/lib/author/identity";
import { updateDraftCuratedProject } from "@/lib/content/curated";
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
    const id = parseCuratedId(rawId);
    await updateDraftCuratedProject(
      id,
      parseDraftCuratedInput(await request.json()),
    );
    return NextResponse.json({ id });
  } catch (error) {
    return requestFailure(error);
  }
}
