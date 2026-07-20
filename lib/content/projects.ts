import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

import type { WorkspaceTag } from "./workspace";

export type ProjectMetadata = {
  coverImageUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  outcomes: string;
  problem: string;
  repositoryUrl: string;
  techStack: string[];
};

export type Project = {
  bodyMarkdown: string;
  id: string;
  locale: string;
  metadata: ProjectMetadata;
  publishedAt: string | null;
  slug: string;
  state: "draft" | "published";
  summary: string;
  tags: WorkspaceTag[];
  title: string;
  updatedAt: string;
};

type ProjectRow = {
  body_markdown: string;
  content_items: { kind: "blog" | "curated" | "project" } | null;
  content_tags: Array<{ tags: WorkspaceTag | null }>;
  id: string;
  locale: string;
  metadata: ProjectMetadata;
  published_at: string | null;
  slug: string;
  state: "draft" | "published";
  summary: string;
  title: string;
  updated_at: string;
};

export type DraftProjectInput = {
  bodyMarkdown: string;
  locale: "zh-CN";
  metadata: ProjectMetadata;
  slug: string;
  summary: string;
  tagIds: string[];
  title: string;
};

function toProject(row: ProjectRow): Project | null {
  if (row.content_items?.kind !== "project") return null;
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

const projectSelection =
  "id, locale, state, slug, title, summary, body_markdown, metadata, published_at, updated_at, content_items!inner(kind, author_id), content_tags(tags(id, label, slug, state))";

export async function listPublishedProjects(locale: string) {
  const { data, error } = await createPublicClient()
    .from("content_variants")
    .select(projectSelection)
    .eq("state", "published")
    .eq("locale", locale)
    .eq("content_items.kind", "project")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`无法读取已发布项目：${error.message}`);
  return (data as unknown as ProjectRow[])
    .flatMap((row) => {
      const project = toProject(row);
      return project ? [project] : [];
    })
    .sort(
      (left, right) =>
        Number(right.metadata.featured) - Number(left.metadata.featured),
    );
}

export async function getPublishedProject(locale: string, slug: string) {
  const projects = await listPublishedProjects(locale);
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function listWorkspaceProjects(authorId: string) {
  const { data, error } = await (await createClient())
    .from("content_variants")
    .select(projectSelection)
    .eq("content_items.author_id", authorId)
    .eq("content_items.kind", "project")
    .order("updated_at", { ascending: false });
  if (error) throw new Error("无法读取作者项目");
  return (data as unknown as ProjectRow[]).flatMap((row) => {
    const project = toProject(row);
    return project ? [project] : [];
  });
}

export async function getWorkspaceProject(authorId: string, id: string) {
  const projects = await listWorkspaceProjects(authorId);
  return projects.find((project) => project.id === id) ?? null;
}

export async function createDraftProject(input: DraftProjectInput) {
  const { data, error } = await (
    await createClient()
  ).rpc("create_project_draft", {
    draft_body_markdown: input.bodyMarkdown,
    draft_locale: input.locale,
    draft_metadata: input.metadata,
    draft_slug: input.slug,
    draft_summary: input.summary,
    draft_tag_ids: input.tagIds,
    draft_title: input.title,
  });
  if (error || !data) throw new Error("无法创建项目草稿");
  return data as string;
}

export async function updateDraftProject(id: string, input: DraftProjectInput) {
  const { data, error } = await (
    await createClient()
  ).rpc("update_project_draft", {
    draft_body_markdown: input.bodyMarkdown,
    draft_metadata: input.metadata,
    draft_slug: input.slug,
    draft_summary: input.summary,
    draft_tag_ids: input.tagIds,
    draft_title: input.title,
    draft_variant_id: id,
  });
  if (error || !data) throw new Error("无法更新项目草稿");
}

async function runProjectAction(
  functionName: string,
  id: string,
  message: string,
) {
  const { data, error } = await (
    await createClient()
  ).rpc(functionName, {
    project_variant_id: id,
  });
  if (error) throw new Error(message);
  return data as string;
}

export async function createProjectEditDraft(id: string) {
  return runProjectAction(
    "create_project_edit_draft",
    id,
    "无法创建项目编辑草稿",
  );
}

export async function publishDraftProject(id: string) {
  return runProjectAction("publish_project_draft", id, "无法发布项目");
}

export async function unpublishProject(id: string) {
  return runProjectAction("unpublish_project", id, "无法撤回项目");
}
