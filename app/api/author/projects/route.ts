import { NextResponse } from "next/server";

import { parseDraftProjectInput } from "@/lib/author/project-input";
import { requireAuthor } from "@/lib/author/identity";
import {
  createDraftProject,
  listWorkspaceProjects,
} from "@/lib/content/projects";
import { requestFailure } from "../response";

export async function GET() {
  try {
    const author = await requireAuthor();
    try {
      return NextResponse.json(await listWorkspaceProjects(author.userId));
    } catch {
      return NextResponse.json({ error: "无法读取内容" }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const id = await createDraftProject(
      parseDraftProjectInput(await request.json()),
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return requestFailure(error);
  }
}
