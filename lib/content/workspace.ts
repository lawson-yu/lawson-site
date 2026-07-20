import { createClient } from "@/lib/supabase/server";

export type WorkspaceTag = {
  id: string;
  label: string;
  slug: string;
  state: "confirmed" | "pending";
};

export class WorkspaceError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 409 | 500 = 500,
  ) {
    super(message);
  }
}

export type WorkspaceBlog = {
  bodyMarkdown: string;
  contentItemId: string;
  id: string;
  locale: string;
  publishedAt: string | null;
  slug: string;
  state: "draft" | "published";
  summary: string;
  tags: WorkspaceTag[];
  title: string;
  updatedAt: string;
};

type WorkspaceBlogRow = {
  body_markdown: string;
  content_item_id: string;
  content_tags: Array<{ tags: WorkspaceTag | null }>;
  id: string;
  locale: string;
  published_at: string | null;
  slug: string;
  state: "draft" | "published";
  summary: string;
  title: string;
  updated_at: string;
};

function toWorkspaceBlog(row: WorkspaceBlogRow): WorkspaceBlog {
  return {
    bodyMarkdown: row.body_markdown,
    contentItemId: row.content_item_id,
    id: row.id,
    locale: row.locale,
    publishedAt: row.published_at,
    slug: row.slug,
    state: row.state,
    summary: row.summary,
    tags: row.content_tags.flatMap(({ tags }) => (tags ? [tags] : [])),
    title: row.title,
    updatedAt: row.updated_at,
  };
}

async function selectAuthorBlogs(authorId: string, id?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("content_variants")
    .select(
      "id, content_item_id, locale, state, slug, title, summary, body_markdown, published_at, updated_at, content_items!inner(author_id, kind), content_tags(tags(id, label, slug, state))",
    )
    .eq("content_items.author_id", authorId)
    .eq("content_items.kind", "blog")
    .order("updated_at", { ascending: false });

  if (id) {
    query = query.eq("id", id);
  }

  const { data, error } = await query;

  if (error) {
    throw new WorkspaceError("无法读取作者博客");
  }

  return (data as unknown as WorkspaceBlogRow[]).map(toWorkspaceBlog);
}

export async function listWorkspaceBlogs(authorId: string) {
  return selectAuthorBlogs(authorId);
}

export async function getWorkspaceBlog(authorId: string, id: string) {
  const [blog] = await selectAuthorBlogs(authorId, id);
  return blog ?? null;
}

export async function listWorkspaceTags() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, label, slug, state")
    .order("label");

  if (error) {
    throw new WorkspaceError("无法读取标签");
  }

  return data as WorkspaceTag[];
}

export type DraftBlogInput = {
  bodyMarkdown: string;
  locale: "zh-CN";
  slug: string;
  summary: string;
  tagIds: string[];
  title: string;
};

export async function createDraftBlog(input: DraftBlogInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_blog_draft", {
    draft_body_markdown: input.bodyMarkdown,
    draft_locale: input.locale,
    draft_slug: input.slug,
    draft_summary: input.summary,
    draft_tag_ids: input.tagIds,
    draft_title: input.title,
  });

  if (error || !data) {
    throw new WorkspaceError("无法创建草稿");
  }

  return data;
}

export async function updateDraftBlog(id: string, input: DraftBlogInput) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("update_blog_draft", {
    draft_body_markdown: input.bodyMarkdown,
    draft_slug: input.slug,
    draft_summary: input.summary,
    draft_tag_ids: input.tagIds,
    draft_title: input.title,
    draft_variant_id: id,
  });

  if (error || !data) {
    throw new WorkspaceError("无法更新草稿");
  }
}

export async function createBlogEditDraft(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_blog_edit_draft", {
    published_variant_id: id,
  });

  if (error || !data) {
    throw new WorkspaceError("无法创建编辑草稿", 409);
  }

  return data;
}

export async function publishDraftBlog(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("publish_blog_draft", {
    draft_variant_id: id,
  });

  if (error) {
    throw new WorkspaceError("无法发布博客", 409);
  }
}

export async function unpublishBlog(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("unpublish_blog", {
    published_variant_id: id,
  });

  if (error) {
    throw new WorkspaceError("无法撤回博客", 409);
  }
}

export async function confirmWorkspaceTag(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_tag", { tag_id: id });

  if (error) {
    throw new WorkspaceError("无法确认标签", 409);
  }
}
