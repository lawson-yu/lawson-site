import { NextResponse } from "next/server";

import {
  hasValidImportSecret,
  ImportContractError,
  parseImportPackage,
} from "@/lib/import/contract";
import {
  importContent,
  ImportExecutionError,
} from "@/lib/import/import-content";
import { isImportRateLimited } from "@/lib/import/rate-limit";

const maxPackageBytes = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxPackageBytes)
    return NextResponse.json({ error: "导入包大小超过限制" }, { status: 413 });
  if (isImportRateLimited(request))
    return NextResponse.json({ error: "请求过于频繁" }, { status: 429 });
  if (!hasValidImportSecret(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  try {
    const result = await importContent(
      await parseImportPackage(await request.formData()),
    );
    return NextResponse.json(result, {
      status: result.result === "created" ? 201 : 200,
    });
  } catch (error) {
    if (error instanceof ImportContractError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof ImportExecutionError)
      return NextResponse.json({ error: "导入失败" }, { status: 500 });
    return NextResponse.json({ error: "导入失败" }, { status: 500 });
  }
}
