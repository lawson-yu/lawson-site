import { NextResponse } from "next/server";

import { parseDraftBlogInput } from "@/lib/author/blog-input";
import { requireAuthor } from "@/lib/author/identity";
import { createDraftBlog, listWorkspaceBlogs } from "@/lib/content/workspace";
import { requestFailure } from "../response";

export async function GET() {
  let author;
  try {
    author = await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    return NextResponse.json(await listWorkspaceBlogs(author.userId));
  } catch {
    return NextResponse.json({ error: "无法读取内容" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const id = await createDraftBlog(parseDraftBlogInput(await request.json()));
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return requestFailure(error);
  }
}
