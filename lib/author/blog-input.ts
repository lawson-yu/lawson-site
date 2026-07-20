import type { DraftBlogInput } from "@/lib/content/workspace";
import { z } from "zod";

const draftBlogSchema = z.object({
  bodyMarkdown: z
    .string()
    .trim()
    .min(1, "正文不能为空")
    .max(50_000, "正文长度无效"),
  locale: z.literal("zh-CN", { error: "首发只接受 zh-CN locale" }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能使用小写字母、数字与连字符")
    .max(120, "slug 长度无效"),
  summary: z.string().trim().min(1, "摘要不能为空").max(320, "摘要长度无效"),
  tagIds: z
    .array(z.uuid("标签 ID 无效"))
    .max(12, "标签数量无效")
    .refine((ids) => new Set(ids).size === ids.length, "标签不能重复"),
  title: z.string().trim().min(1, "标题不能为空").max(160, "标题长度无效"),
});

const idSchema = z.uuid("内容 ID 无效");

export function parseDraftBlogInput(value: unknown): DraftBlogInput {
  const parsed = draftBlogSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "请求无效");
  }
  return parsed.data;
}

export function parseContentId(value: string) {
  const parsed = idSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "内容 ID 无效");
  }
  return parsed.data;
}
