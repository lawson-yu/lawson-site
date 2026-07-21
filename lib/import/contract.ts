import { createHash, timingSafeEqual } from "node:crypto";

import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { visit } from "unist-util-visit";
import { z } from "zod";

const imageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const maxImageCount = 10;
const maxImageBytes = 5 * 1024 * 1024;
const maxPackageBytes = 25 * 1024 * 1024;

export class ImportContractError extends Error {}

type ImportedImage = {
  alt: string;
  file: File;
  path: string;
};

export type ImportPackage = {
  bodyMarkdown: string;
  digest: string;
  images: ImportedImage[];
  kind: "blog" | "project" | "curated";
  locale: "zh-CN";
  metadata: Record<string, unknown>;
  slug: string;
  summary: string;
  tags: Array<{ label: string; slug: string }>;
  title: string;
  externalId: string;
};

const commonSchema = z.object({
  externalId: z.string().trim().min(1).max(200),
  kind: z.enum(["blog", "project", "curated"]),
  locale: z.literal("zh-CN"),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(1).max(500),
  tags: z.array(z.string().trim().min(1).max(60)).min(1).max(10),
  title: z.string().trim().min(1).max(200),
});

const projectMetadata = z.object({
  coverImageUrl: z.string().url().nullable().optional().default(null),
  demoUrl: z.string().url().nullable().optional().default(null),
  featured: z.boolean().optional().default(false),
  outcomes: z.string().trim().min(1),
  problem: z.string().trim().min(1),
  repositoryUrl: z.string().url(),
  techStack: z.array(z.string().trim().min(1)).min(1),
});

const curatedMetadata = z.object({
  collectedAt: z.string().date(),
  commentary: z.string().trim().min(1),
  problem: z.string().trim().min(1),
  sourceRepositoryUrl: z.string().url(),
  useCases: z.string().trim().min(1),
  week: z.string().regex(/^\d{4}-W\d{2}$/),
});

function invalid(message: string): never {
  throw new ImportContractError(message);
}

function parseFrontMatter(markdown: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(markdown);
  if (!match) invalid("导入文档必须包含完整 front matter");
  const values: Record<string, string | string[]> = {};
  let activeArray: string | null = null;
  for (const line of match[1].split(/\r?\n/)) {
    const arrayItem = /^\s{2}-\s+(.+)$/.exec(line);
    if (arrayItem && activeArray) {
      const current = values[activeArray];
      if (Array.isArray(current)) current.push(arrayItem[1].trim());
      continue;
    }
    const field = /^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/.exec(line);
    if (!field) invalid("front matter 格式无效");
    activeArray = field[2] ? null : field[1];
    values[field[1]] = field[2] ? field[2].trim() : [];
  }
  return { bodyMarkdown: match[2], values };
}

function parseMetadata(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value) return {};
  try {
    const metadata: unknown = JSON.parse(value);
    if (!metadata || Array.isArray(metadata) || typeof metadata !== "object")
      invalid("metadata 必须是 JSON 对象");
    return metadata as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ImportContractError) throw error;
    invalid("metadata 必须是 JSON 对象");
  }
}

function tagSlug(label: string) {
  const slug = label
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) invalid("标签格式无效");
  return slug;
}

function assertRelativePath(path: string) {
  if (
    !path ||
    path.startsWith("/") ||
    path.includes("\\") ||
    /[:?#]/.test(path) ||
    path
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    invalid("图片路径必须是同包相对路径");
  }
}

function imageReferences(bodyMarkdown: string) {
  const document = fromMarkdown(bodyMarkdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const references = new Map<string, string>();
  let rawHtml = false;
  visit(document, (node) => {
    if (node.type === "html") rawHtml = true;
    if (node.type === "imageReference") invalid("导入图片必须使用同包相对路径");
  });
  if (rawHtml || /<\s*script\b/i.test(bodyMarkdown))
    invalid("Markdown 不允许原始 HTML 或脚本");
  visit(document, "image", (node) => {
    if (/^(?:https?:)?\/\//i.test(node.url) || node.url.startsWith("/"))
      invalid("图片必须来自同一个导入包");
    assertRelativePath(node.url);
    if (node.title) invalid("导入图片不能包含标题属性");
    if (!node.alt?.trim()) invalid("图片必须提供替代文本");
    if (references.has(node.url)) invalid("Markdown 中不能重复引用同一图片");
    references.set(node.url, node.alt.trim());
  });
  return references;
}

export function rewriteImportedImageUrls(
  markdown: string,
  managedUrls: ReadonlyMap<string, string>,
) {
  const document = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const replacements: Array<{ end: number; start: number; text: string }> = [];
  visit(document, "image", (node) => {
    const managedUrl = managedUrls.get(node.url);
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (!managedUrl || start === undefined || end === undefined)
      invalid("无法安全改写导入图片");
    replacements.push({
      end,
      start,
      text: `![${node.alt ?? ""}](${managedUrl})`,
    });
  });
  return replacements
    .sort((left, right) => right.start - left.start)
    .reduce(
      (result, replacement) =>
        `${result.slice(0, replacement.start)}${replacement.text}${result.slice(replacement.end)}`,
      markdown,
    );
}

export async function parseImportPackage(
  form: FormData,
): Promise<ImportPackage> {
  const markdownEntries = form.getAll("markdown");
  if (markdownEntries.length !== 1 || !(markdownEntries[0] instanceof File))
    invalid("导入包必须包含一份 Markdown 文件");
  const markdownFile = markdownEntries[0];
  if (markdownFile.size === 0 || markdownFile.size > maxPackageBytes)
    invalid("Markdown 文件大小无效");
  const markdown = await markdownFile.text();
  const { bodyMarkdown, values } = parseFrontMatter(markdown);
  const parsed = commonSchema.safeParse({
    externalId: values.externalId,
    kind: values.kind,
    locale: values.locale,
    slug: values.slug,
    summary: values.summary,
    tags: values.tags,
    title: values.title,
  });
  if (!parsed.success) invalid("front matter 字段无效");
  const metadata = parseMetadata(values.metadata);
  if (
    parsed.data.kind === "project" &&
    !projectMetadata.safeParse(metadata).success
  )
    invalid("项目 metadata 无效");
  if (
    parsed.data.kind === "curated" &&
    !curatedMetadata.safeParse(metadata).success
  )
    invalid("精选项目 metadata 无效");

  const references = imageReferences(bodyMarkdown);
  if (references.size > maxImageCount) invalid("图片数量超过限制");
  const images: ImportedImage[] = [];
  const names = new Set<string>();
  let packageBytes = markdownFile.size;
  for (const [name, entry] of form.entries()) {
    if (name === "markdown") continue;
    if (!(entry instanceof File)) invalid("导入包只允许 Markdown 与图片文件");
    assertRelativePath(name);
    if (names.has(name)) invalid("导入包不能包含重复图片路径");
    names.add(name);
    if (
      !imageTypes.has(entry.type) ||
      entry.size === 0 ||
      entry.size > maxImageBytes
    )
      invalid("图片类型或大小无效");
    packageBytes += entry.size;
    if (packageBytes > maxPackageBytes) invalid("导入包大小超过限制");
    const alt = references.get(name);
    if (!alt) invalid("导入包包含未引用图片");
    images.push({ alt, file: entry, path: name });
  }
  if (names.size !== references.size)
    invalid("Markdown 引用的图片必须随导入包提供");

  const hash = createHash("sha256");
  hash.update(markdown);
  for (const image of [...images].sort((left, right) =>
    left.path.localeCompare(right.path),
  )) {
    hash.update("\0");
    hash.update(image.path);
    hash.update("\0");
    hash.update(Buffer.from(await image.file.arrayBuffer()));
  }
  return {
    ...parsed.data,
    bodyMarkdown,
    digest: hash.digest("hex"),
    images,
    metadata,
    tags: parsed.data.tags.map((label) => ({ label, slug: tagSlug(label) })),
  };
}

export function hasValidImportSecret(authorization: string | null) {
  const match = /^Bearer\s+(.+)$/.exec(authorization ?? "");
  if (!match) return false;
  const digest = createHash("sha256").update(match[1]).digest();
  const hashes = [
    process.env.IMPORT_SECRET_HASH,
    process.env.IMPORT_SECRET_PREVIOUS_HASH,
  ].filter((hash): hash is string => /^[0-9a-f]{64}$/i.test(hash ?? ""));
  return hashes.some((hash) => {
    const expected = Buffer.from(hash, "hex");
    return (
      expected.length === digest.length && timingSafeEqual(expected, digest)
    );
  });
}
