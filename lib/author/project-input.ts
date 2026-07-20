import type { DraftProjectInput } from "@/lib/content/projects";
import { z } from "zod";

const projectMetadataSchema = z.object({
  coverImageUrl: z.url("封面链接无效").nullable(),
  demoUrl: z.url("演示链接无效").nullable(),
  featured: z.boolean(),
  outcomes: z.string().trim().min(1, "成果不能为空").max(1_000, "成果长度无效"),
  problem: z.string().trim().min(1, "问题不能为空").max(1_000, "问题长度无效"),
  repositoryUrl: z.url("仓库链接无效"),
  techStack: z
    .array(z.string().trim().min(1).max(60))
    .min(1, "至少填写一项技术栈")
    .max(20, "技术栈数量无效")
    .refine((items) => new Set(items).size === items.length, "技术栈不能重复"),
});

const draftProjectSchema = z.object({
  bodyMarkdown: z
    .string()
    .trim()
    .min(1, "正文不能为空")
    .max(50_000, "正文长度无效"),
  locale: z.literal("zh-CN", { error: "首发只接受 zh-CN locale" }),
  metadata: projectMetadataSchema,
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

export function parseDraftProjectInput(value: unknown): DraftProjectInput {
  const parsed = draftProjectSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "请求无效");
  }
  return parsed.data;
}

export function parseProjectId(value: string) {
  const parsed = idSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "内容 ID 无效");
  }
  return parsed.data;
}
