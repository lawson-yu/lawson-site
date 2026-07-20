import type { DraftCuratedInput } from "@/lib/content/curated";
import { z } from "zod";

const curatedMetadataSchema = z.object({
  collectedAt: z.iso.date("收录日期无效"),
  commentary: z
    .string()
    .trim()
    .min(1, "短评不能为空")
    .max(1_000, "短评长度无效"),
  problem: z
    .string()
    .trim()
    .min(1, "解决问题不能为空")
    .max(1_000, "解决问题长度无效"),
  sourceRepositoryUrl: z.url("来源仓库链接无效"),
  useCases: z
    .string()
    .trim()
    .min(1, "适用场景不能为空")
    .max(1_000, "适用场景长度无效"),
  week: z.string().regex(/^\d{4}-W\d{2}$/, "周信息格式应为 YYYY-Www"),
});

const draftCuratedSchema = z.object({
  bodyMarkdown: z
    .string()
    .trim()
    .min(1, "正文不能为空")
    .max(50_000, "正文长度无效"),
  locale: z.literal("zh-CN", { error: "首发只接受 zh-CN locale" }),
  metadata: curatedMetadataSchema,
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能使用小写字母、数字与连字符")
    .max(120, "slug 长度无效"),
  summary: z.string().trim().min(1, "摘要不能为空").max(320, "摘要长度无效"),
  tagIds: z.array(z.uuid("标签 ID 无效")).max(12, "标签数量无效"),
  title: z.string().trim().min(1, "标题不能为空").max(160, "标题长度无效"),
});

const idSchema = z.uuid("内容 ID 无效");

export function parseDraftCuratedInput(value: unknown): DraftCuratedInput {
  const parsed = draftCuratedSchema.safeParse(value);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "请求无效");
  return parsed.data;
}

export function parseCuratedId(value: string) {
  const parsed = idSchema.safeParse(value);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "内容 ID 无效");
  return parsed.data;
}
