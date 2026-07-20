import { NextResponse } from "next/server";

import { parseDraftCuratedInput } from "@/lib/author/curated-input";
import { requireAuthor } from "@/lib/author/identity";
import { createDraftCuratedProject } from "@/lib/content/curated";
import { requestFailure } from "../response";

export async function POST(request: Request) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const id = await createDraftCuratedProject(
      parseDraftCuratedInput(await request.json()),
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return requestFailure(error);
  }
}
