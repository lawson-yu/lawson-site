import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

import type { WorkspaceTag } from "./workspace";

export type CuratedMetadata = {
  collectedAt: string;
  commentary: string;
  problem: string;
  sourceRepositoryUrl: string;
  useCases: string;
  week: string;
};

export type CuratedProject = {
  bodyMarkdown: string;
  id: string;
  locale: string;
  metadata: CuratedMetadata;
  publishedAt: string | null;
  slug: string;
  state: "draft" | "published";
  summary: string;
  tags: WorkspaceTag[];
  title: string;
  updatedAt: string;
};

type CuratedRow = {
  body_markdown: string;
  content_items: { kind: "blog" | "curated" | "project" } | null;
  content_tags: Array<{ tags: WorkspaceTag | null }>;
  id: string;
  locale: string;
  metadata: CuratedMetadata;
  published_at: string | null;
  slug: string;
  state: "draft" | "published";
  summary: string;
  title: string;
  updated_at: string;
};

export type DraftCuratedInput = {
  bodyMarkdown: string;
  locale: "zh-CN";
  metadata: CuratedMetadata;
  slug: string;
  summary: string;
  tagIds: string[];
  title: string;
};

function toCuratedProject(row: CuratedRow): CuratedProject | null {
  if (row.content_items?.kind !== "curated") return null;
  return {
    bodyMarkdown: row.body_markdown,
    id: row.id,
    locale: row.locale,
    metadata: row.metadata,
    publishedAt: row.published_at,
    slug: row.slug,
    state: row.state,
    summary: row.summary,
    tags: row.content_tags.flatMap(({ tags }) => (tags ? [tags] : [])),
    title: row.title,
    updatedAt: row.updated_at,
  };
}

const curatedSelection =
  "id, locale, state, slug, title, summary, body_markdown, metadata, published_at, updated_at, content_items!inner(kind, author_id), content_tags(tags(id, label, slug, state))";

export async function listPublishedCuratedProjects(locale: string) {
  const { data, error } = await createPublicClient()
    .from("content_variants")
    .select(curatedSelection)
    .eq("state", "published")
    .eq("locale", locale)
    .eq("content_items.kind", "curated")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`无法读取已发布精选项目：${error.message}`);
  return (data as unknown as CuratedRow[])
    .flatMap((row) => {
      const project = toCuratedProject(row);
      return project ? [project] : [];
    })
    .sort((left, right) =>
      right.metadata.collectedAt.localeCompare(left.metadata.collectedAt),
    );
}

export async function getPublishedCuratedProject(locale: string, slug: string) {
  const projects = await listPublishedCuratedProjects(locale);
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function listWorkspaceCuratedProjects(authorId: string) {
  const { data, error } = await (await createClient())
    .from("content_variants")
    .select(curatedSelection)
    .eq("content_items.author_id", authorId)
    .eq("content_items.kind", "curated")
    .order("updated_at", { ascending: false });
  if (error) throw new Error("无法读取作者精选项目");
  return (data as unknown as CuratedRow[]).flatMap((row) => {
    const project = toCuratedProject(row);
    return project ? [project] : [];
  });
}

export async function getWorkspaceCuratedProject(authorId: string, id: string) {
  const projects = await listWorkspaceCuratedProjects(authorId);
  return projects.find((project) => project.id === id) ?? null;
}

export async function createDraftCuratedProject(input: DraftCuratedInput) {
  const { data, error } = await (
    await createClient()
  ).rpc("create_curated_draft", {
    draft_body_markdown: input.bodyMarkdown,
    draft_locale: input.locale,
    draft_metadata: input.metadata,
    draft_slug: input.slug,
    draft_summary: input.summary,
    draft_tag_ids: input.tagIds,
    draft_title: input.title,
  });
  if (error || !data) throw new Error("无法创建精选项目草稿");
  return data as string;
}

export async function updateDraftCuratedProject(
  id: string,
  input: DraftCuratedInput,
) {
  const { data, error } = await (
    await createClient()
  ).rpc("update_curated_draft", {
    draft_body_markdown: input.bodyMarkdown,
    draft_metadata: input.metadata,
    draft_slug: input.slug,
    draft_summary: input.summary,
    draft_tag_ids: input.tagIds,
    draft_title: input.title,
    draft_variant_id: id,
  });
  if (error || !data) throw new Error("无法更新精选项目草稿");
}

async function runCuratedAction(
  functionName: string,
  id: string,
  message: string,
) {
  const { data, error } = await (
    await createClient()
  ).rpc(functionName, {
    curated_variant_id: id,
  });
  if (error) throw new Error(message);
  return data as string;
}

export function createCuratedEditDraft(id: string) {
  return runCuratedAction(
    "create_curated_edit_draft",
    id,
    "无法创建精选项目编辑草稿",
  );
}

export function publishDraftCuratedProject(id: string) {
  return runCuratedAction("publish_curated_draft", id, "无法发布精选项目");
}

export function unpublishCuratedProject(id: string) {
  return runCuratedAction("unpublish_curated", id, "无法撤回精选项目");
}
