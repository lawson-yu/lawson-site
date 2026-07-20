import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthor } from "@/lib/author/identity";
import {
  deleteUnreferencedDraftImage,
  listOwnDraftImages,
  MediaError,
  uploadDraftImage,
} from "@/lib/content/media";

export async function GET(request: Request) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const parsed = z
    .object({ variantId: z.uuid("图片请求无效") })
    .safeParse({
      variantId: new URL(request.url).searchParams.get("variantId"),
    });
  if (!parsed.success)
    return NextResponse.json({ error: "图片请求无效" }, { status: 400 });
  try {
    return NextResponse.json(await listOwnDraftImages(parsed.data.variantId));
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof MediaError ? error.message : "无法读取草稿图片",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  const alt = form.get("alt");
  const variantId = form.get("variantId");
  const parsed = z
    .object({ alt: z.string(), variantId: z.uuid("图片请求无效") })
    .safeParse({ alt, variantId });
  if (!(file instanceof File) || !parsed.success)
    return NextResponse.json({ error: "图片请求无效" }, { status: 400 });
  try {
    return NextResponse.json(
      await uploadDraftImage({
        alt: parsed.data.alt,
        file,
        variantId: parsed.data.variantId,
      }),
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof MediaError ? error.message : "图片上传失败" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAuthor();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const parsed = z
    .object({
      assetId: z.uuid("图片请求无效"),
      variantId: z.uuid("图片请求无效"),
    })
    .safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "图片请求无效" }, { status: 400 });
  try {
    await deleteUnreferencedDraftImage(
      parsed.data.assetId,
      parsed.data.variantId,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof MediaError ? error.message : "图片删除失败" },
      { status: 400 },
    );
  }
}
